import fs from "fs";
import util from "util";

export type EnvData = { [key: string]: string };

export const buildEnvFile = async (file: string, data: EnvData) => {
  const str = Object.entries(data).map(([key, value]) => `${key}=${value}`).join("\n");
  await util.promisify(fs.writeFile)(file, str);
  return str;
};
