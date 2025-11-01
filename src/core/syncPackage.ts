import simpleGit from "simple-git";
import Remote from "../lib/remote/Remote";
import { RemoteExecResult } from "../lib/remote/RemoteClient";
import buildPackage, { PackageConfig } from "./buildPackage";

export type SyncConfig = PackageConfig & {
  /**
   * Remote destination directory
   * - default to "~/package"
   */
  dir?: string;

  /**
   * commit message.
   */
  message?: string;

  /**
   * List of name to keep while sync package.
   */
  keep?: string[];

  /**
   * Unpack hook, called after unpacking package on remote.
   */
  unpackHook?: (targetDir: string) => Promise<void>;

  /**
   * Complete hook, called after sync package complete.
   */
  completeHook?: (targetDir: string) => Promise<void>;

  /**
   * Verbose setting.
   */
  verbose?: boolean;

  /**
   * Author.
   */
  author?: string;

  /**
   * Debug mode will not deploy to remote and creates rendered output of package.
   */
  debug?: boolean;
};

const syncPackage = async (remote: Remote, domain: string, config: SyncConfig) => {
  // temporary directory for package on remote machine
  const packageTmpDir = config.outputDir;

  // domain directory
  const packageDomainDir = `${packageTmpDir}/${domain}`;
  const destDomainDir = `${config.dir || "~/package"}`;

  // build package
  // override outputDir
  await buildPackage({
    ...config,
    outputDir: config.debug
      ? `dist/debug/${domain}_${Date.now()}`
      : packageDomainDir,
  });

  if (config.debug)
    return;

  try {
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
    config.unpackHook && await config.unpackHook(destDomainDir)
      .then(() => console.log("Ran unpack hook"))
      .catch(e => console.error("Unpack hook failed", e));

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

    // get local git info
    const git = simpleGit();
    const [user, email, log, diff] = await Promise.all([
      git.getConfig("user.name"),
      git.getConfig("user.email"),
      git.log().then(res => res.latest?.hash || "-"),
      git.diffSummary().then(res => res.files.map(f => "changes" in f ? `${f.file}(${f.changes})` : f.file).join("\n")),
    ]);

    await remote.git.commit({
      message: config.message || (init
        ? "initial commit"
        : `sync package\npackage: ${packageTmpDir}\ncommit: ${log}\ndiff:\n${diff}`),
      dir: destDomainDir,
      author: config.author || `${user.value} <${email.value}>`,
    }).catch(e => {
      console.warn("Failed To Commit:", e);
    });
  } catch (error) {
    console.error("Error thrown: ", error);
  }

  console.log("Sync Package Complete");

  config.completeHook && await config.completeHook(destDomainDir)
    .then(() => console.log("Ran complete hook"))
    .catch(e => console.error("Complete hook failed", e));
};

export default syncPackage;
