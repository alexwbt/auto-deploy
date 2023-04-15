import fs from "fs";

const mergeDirs = require("merge-dirs");

const packageEnvHook = async (domain: string, env: string, srcDir: string, targetDir: string) => {
  const fromDir = `${targetDir}/${domain}/${srcDir}/${env}`;
  if (!fs.existsSync(fromDir))
    return;

  mergeDirs.default(fromDir, `${targetDir}/${domain}`, "overwrite");
  fs.rmSync(`${targetDir}/${domain}/${srcDir}`, { recursive: true, force: true });
};

export default packageEnvHook;
