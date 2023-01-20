import Remote from "./remote/Remote";

export type SyncConfig = {
  dir?: string;
  envName?: string;
};

const syncPackage = async (remote: Remote, config: SyncConfig = {}) => {
  const { code, stdout, stderr } = await remote.client.upload(
    `${config.dir || "~"}/${config.envName || ""}`,
    "package"
  );
  if (code === 0)
    console.log(stdout);
  else
    console.log(stderr);
};

export default syncPackage;
