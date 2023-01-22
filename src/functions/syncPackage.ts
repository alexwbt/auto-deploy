import Remote from "../remote/Remote";
import { RemoteExecResult } from "../remote/RemoteClient";
import { buildEnvFile } from "../utils/envBuilder";

export type SyncConfig = {
  dir?: string;
  init?: boolean;
  envName?: string;
  commitMessage?: string;
  envFilePath?: string;
};

const syncPackage = async (remote: Remote, packageList: string[], config: SyncConfig = {}) => {
  packageList = [...packageList, ".env"];

  const packageDirName = "package";
  const destDir = `${config.dir || "~"}/${config.envName || ""}`;

  // build env
  buildEnvFile(`${packageDirName}/.env`, {
    "WORK_DIR": destDir,
  });
  console.log("Built env file");

  // pre-upload checks
  const testRes = await remote.client
    .exec("test -d " + destDir)
    .catch<RemoteExecResult>(e => e);

  if (!config.init === !!testRes.code)
    throw new Error(config.init
      ? `Failed to init package, ${destDir} already exists.`
      : `Failed to sync package, ${destDir} does not exist.`);

  if (!config.init) {
    const diffRes = await remote.git.diffHead({ dir: destDir });
    if (diffRes.stdout) {
      console.log(diffRes.stdout);
      throw new Error("Failed to sync package, "
        + "uncommitted changes exist on remote.");
    }
  }

  // upload
  await remote.client.upload(destDir, ...packageList.map(p => `${packageDirName}/${p}`));

  // unpack
  const packageSrc = packageList.map(p => `${destDir}/${packageDirName}/${p}`).join(" ");
  const packageDest = packageList.map(p => `${destDir}/${p}`).join(" ");
  await remote.client.exec(`rm -rf ${packageDest} `
    + `&& mv ${packageSrc} ${destDir} `
    + `&& rm -rf ${packageDirName}`);

  // commit
  if (config.init) {
    await remote.git.init({ dir: destDir });
  }
  await remote.git.addAll({ dir: destDir });
  await remote.git.commit({
    message: config.init
      ? "initial commit"
      : "syncPackage",
    dir: destDir,
  });

  console.log("Sync Package complete");
};

export default syncPackage;
