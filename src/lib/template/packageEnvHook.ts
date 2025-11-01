import fs from "fs";

const mergeDirs = require("merge-dirs");

const packageEnvHook = async (env: string, srcDir: string, targetDir: string) => {
  const fromDir = `${targetDir}/${srcDir}/${env}`;

  if (fs.existsSync(fromDir))
    mergeDirs.default(fromDir, `${targetDir}`, "overwrite");

  fs.rmSync(`${targetDir}/${srcDir}`, { recursive: true, force: true });
};

export default packageEnvHook;
