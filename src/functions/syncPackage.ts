import Remote from "../remote/Remote";
import { RemoteExecResult } from "../remote/RemoteClient";
import { getEnvString, getEnvStringRequired } from "../utils/env";
import { buildEnvFile } from "../utils/envBuilder";

export type SyncConfig = {
  dir?: string;
  envName?: string;
  commitMessage?: string;
  envFilePath?: string;
};

const syncPackage = async (remote: Remote, packageList: string[], config: SyncConfig = {}) => {
  packageList = [...packageList, ".env"];

  const packageDirName = "package";
  const destDir = `${config.dir || "~"}/${config.envName || ""}`;

  // build env
  const env = await buildEnvFile(`${packageDirName}/.env`, {
    "WORK_DIR": destDir,
    "USER": getEnvString("REMOTE_USER", "ec2-user"),
    "CERT_EMAIL": getEnvStringRequired("CERT_EMAIL"),
  });
  console.log("Built env file");
  console.log(`-------\n${env}\n-------`);

  // pre-upload checks
  const testRes = await remote.client
    .exec("test -d " + destDir)
    .catch<RemoteExecResult>(e => e);
  const init = !!testRes.code;

  if (!init) {
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
  if (init) {
    await remote.git.init({ dir: destDir });
  }
  await remote.git.addAll({ dir: destDir });
  await remote.git.commit({
    message: init
      ? "initial commit"
      : "syncPackage",
    dir: destDir,
  });

  console.log("Sync Package complete");
};

export default syncPackage;
