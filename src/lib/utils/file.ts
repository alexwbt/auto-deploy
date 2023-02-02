import fs from "fs";
import path from "path";

export const forEachFile = async (
  dir: string,
  callback: (entry: {
    fileName: string;
    filePath: string;
  }) => Promise<void>,
  options: {
    recursive?: boolean;
  } = {},
) => {
  const files = await fs.promises.readdir(dir);

  await Promise.all(files.map(fileName => (async () => {
    const filePath = path.join(dir, fileName);
    const stat = await fs.promises.stat(filePath);

    if (stat.isFile())
      await callback({
        fileName,
        filePath,
      });
    else if (stat.isDirectory() && options.recursive)
      await forEachFile(filePath, callback, options);
  })()));
};
