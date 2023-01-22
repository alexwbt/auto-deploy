import fs from "fs";
import util from "util";

export type EnvData = { [key: string]: string };

export const buildEnvFile = (file: string, data: EnvData) => {
  return util.promisify(fs.writeFile)(file,
    Object.entries(data).map(([key, value]) => `${key}=${value}`).join("\n"));
};
