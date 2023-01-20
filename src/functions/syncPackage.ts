import Remote from "../remote/Remote";

export type SyncConfig = {
  dir?: string;
  envName?: string;
};

const syncPackage = async (remote: Remote, config: SyncConfig = {}) => {
  // upload
  const dest = `${config.dir || "~"}/${config.envName || ""}`;
  await remote.client.upload("~/uat", "package");

  // unpack
  const p = `${dest}/package`;
  return await remote.client.exec(`mv -u ${p}/* ${p}/.[^.]* ${dest}; true && rm -rf ${p}`);
};

export default syncPackage;
