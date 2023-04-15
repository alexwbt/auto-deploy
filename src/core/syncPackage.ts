import fs from "fs";
import Remote from "../lib/remote/Remote";
import { RemoteExecResult } from "../lib/remote/RemoteClient";
import renderDirectory from "../lib/template/renderDirectory";
import buildEnvFile from "../lib/utils/buildEnvFile";

export type SyncConfig = {
  /**
   * Remote destination directory
   * - default to "~/"
   * - passing empty string will result to root directory "/"
   */
  dir?: string;

  /**
   * Package directory.
   */
  package?: string;

  /**
   * commit message.
   */
  message?: string;

  /**
   * List of name to keep while sync package.
   */
  keep?: string[];

  /**
   * Runtime environment variables.
   */
  env?: { [key: string]: string };

  /**
   * Template variables.
   */
  templateEnv?: { [key: string]: string };

  /**
   * Package hook, called after rendering package dir.
   */
  packageHook?: (targetDir: string) => Promise<void>;

  /**
   * Unpack hook, called after unpacking package on remote.
   */
  unpackHook?: (targetDir: string) => Promise<void>;

  /**
   * Verbose setting.
   */
  verbose?: boolean;

  /**
   * Author.
   */
  author?: string;
};

const syncPackage = async (remote: Remote, domain: string, config: SyncConfig = {}) => {
  const packageTmpDir = "package_tmp";
  const packageDir = config.package || "package";

  // domain directory
  const packageDomainDir = `${packageTmpDir}/${domain}`;
  const destDomainDir = `${config.dir || "~"}/${domain}`;

  // env data
  const envData = {
    ...config.env,
    "WORK_DIR": destDomainDir,
  };

  // render template
  await renderDirectory(packageDir, packageTmpDir, config.templateEnv || {});
  config.packageHook && await config.packageHook(packageTmpDir);

  try {
    // build env
    const envResult = await buildEnvFile(`${packageDomainDir}/.env`, envData);
    config.verbose && console.log(`-------\n.env\n-------\n${envResult}\n-------`);

    // pre-upload checks
    const testRes = await remote.client
      .exec("test -d " + destDomainDir)
      .catch<RemoteExecResult>(e => e);
    const init = !!testRes.code;

    if (init) {
      console.log("Initializing remote sync package");
    } else {
      const diffRes = await remote.git.diffHead({ dir: destDomainDir });
      if (diffRes.stdout) {
        config.verbose && console.log(diffRes.stdout);
        throw new Error("Failed to sync package, "
          + "uncommitted changes exist on remote.");
      }

      // clean
      await remote.client.exec(`find ${destDomainDir} `
        + `-mindepth 1 -maxdepth 1 `
        + [...(config.keep || []), ".git"].map(e => `! -iname "${e}" `).join(" ")
        + `-exec rm -rf {} +`);
    }

    // upload
    await remote.client.upload(destDomainDir, packageDomainDir);

    // unpack
    await remote.client.exec(`cp -rfu -t ${destDomainDir} `
      + `${destDomainDir}/${packageDomainDir}/* `
      + `${destDomainDir}/${packageDomainDir}/.[^.]*`);
    await remote.client.exec(`rm -rf ${destDomainDir}/${packageTmpDir}`);
    // unpack hook
    try {
      config.unpackHook && await config.unpackHook(destDomainDir);
    } catch (e) {
      console.log("Unpack hook failed.", e)
    }

    // commit
    if (init) {
      await remote.git.init({ dir: destDomainDir });
    }
    await remote.git.addAll({ dir: destDomainDir });

    if (!init) {
      const diffRes = await remote.git.diffHead({ dir: destDomainDir });
      if (diffRes.stdout)
        config.verbose && console.log(diffRes.stdout);
      else
        console.warn("No Change Detected");
    }

    await remote.git.commit({
      message: config.message || (init ? "initial commit" : "sync package"),
      dir: destDomainDir,
      author: config.author,
    }).catch(e => {
      console.warn("Failed To Commit:", e);
    });
  } catch (error) {
    console.error("Error thrown: ", error);
  }

  // remove packageTmp
  if (packageTmpDir)
    await fs.promises.rm(packageTmpDir, { recursive: true, force: true });

  console.log("Sync Package Complete");
};

export default syncPackage;
