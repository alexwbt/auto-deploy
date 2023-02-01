import fs from "fs";

export type EnvData = { [key: string]: string };

const buildEnvFile = async (file: string, data: EnvData) => {
  const str = Object.entries(data).map(([key, value]) => `${key}=${value}`).join("\n");
  await fs.promises.writeFile(file, str);
  return str;
};

export default buildEnvFile;
