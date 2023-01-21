import Remote from "../remote/Remote";
import { RemoteExecResult } from "../remote/RemoteClient";

export type SyncConfig = {
  dir?: string;
  init?: boolean;
  envName?: string;
  commitMessage?: string;
};

const syncPackage = async (remote: Remote, config: SyncConfig = {}) => {
  const dir = `${config.dir || "~"}/${config.envName || ""}`;

  const testRes = await remote.client
    .exec("test -d " + dir)
    .catch<RemoteExecResult>(e => e);

  if (!config.init === !!testRes.code)
    throw new Error(config.init
      ? `Failed to init package, ${dir} already exists.`
      : `Failed to sync package, ${dir} does not exist.`);

  if (!config.init) {
    const diffRes = await remote.git.diffHead({ dir });
    if (diffRes.stdout) {
      console.log(diffRes.stdout);
      throw new Error("Failed to sync package, "
        + "uncommitted changes exist on remote.");
    }
  }

  // upload
  await remote.client.upload(dir, "package");

  // unpack
  const p = `${dir}/package`;
  console.log(await remote.client.exec(`mv -u ${p}/* ${p}/.[^.]* -t ${dir}; true && rm -rf ${p}`));

  // commit
  if (config.init) {
    await remote.git.init({ dir });
  }
  await remote.git.add({ dir });
  await remote.git.commit({
    message: "syncPackage",
    dir,
  });
};

export default syncPackage;
