import fs from "fs";
import Remote from "../remote/Remote";
import { RemoteExecResult } from "../remote/RemoteClient";
import buildEnvFile from "./buildEnvFile";
import renderDirectory from "./renderDirectory";

export type SyncConfig = {
  /**
   * Remote destination directory
   * default "~/"
   * passing empty string will result to root directory "/"
   */
  dir?: string;

  /**
   * Package directory
   */
  package?: string;

  /**
   * List of name to keep while sync package
   */
  keep?: string[];

  /**
   * Runtime environment variables
   */
  env?: { [key: string]: string };
};

const syncPackage = async (remote: Remote, domain: string, config: SyncConfig = {}) => {
  const packageTmpDir = "package_tmp";
  const packageDomainDir = `${packageTmpDir}/${domain}`;
  const destDomainDir = `${config.dir || "~"}/${domain}`;

  const envData = {
    ...config.env,
    "WORK_DIR": destDomainDir,
  };

  // render template
  await renderDirectory(config.package || "package", packageTmpDir, envData);

  // build env
  const envResult = await buildEnvFile(`${packageDomainDir}/.env`, envData);
  console.log(`-------\n.env\n-------\n${envResult}\n-------`);

  // pre-upload checks
  const testRes = await remote.client
    .exec("test -d " + destDomainDir)
    .catch<RemoteExecResult>(e => e);
  const init = !!testRes.code;

  if (!init) {
    const diffRes = await remote.git.diffHead({ dir: destDomainDir });
    if (diffRes.stdout) {
      console.log(diffRes.stdout);
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

  // commit
  if (init) {
    await remote.git.init({ dir: destDomainDir });
  }
  await remote.git.addAll({ dir: destDomainDir });

  const diffRes = await remote.git.diffHead({ dir: destDomainDir });
  if (diffRes.stdout)
    console.log(diffRes.stdout);
  else
    console.warn("No Change Detected");

  await remote.git.commit({
    message: init
      ? "initial commit"
      : "syncPackage",
    dir: destDomainDir,
  }).catch(() => {
    console.warn("Failed To Commit");
  });

  // remove packageTmp
  await fs.promises.rm(packageTmpDir, { recursive: true, force: true });

  console.log("Sync Package Complete");
};

export default syncPackage;
