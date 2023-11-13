import fs from "fs";
import path from "path";
import { forEachFile } from "../utils/file";
import handlebars from "./handlebars";

export type RenderDirectoryOptions = {
  srcDir: string;
  destDir: string;
  data?: object;
  excludeRegex?: RegExp;
};

const renderDirectory = ({
  srcDir,
  destDir,
  data,
  excludeRegex,
}: RenderDirectoryOptions) => {
  return forEachFile(srcDir, async ({ filePath }) => {
    const relativeFilePath = path.relative(srcDir, filePath);
    const outputFilePath = path.join(destDir, relativeFilePath);

    // create output directory
    await fs.promises.mkdir(path.dirname(outputFilePath), { recursive: true });

    const exclude = excludeRegex?.test(relativeFilePath);
    if (exclude) {
      // copy file directly
      await fs.promises.copyFile(filePath, outputFilePath);
    } else {
      // process files with handlebars
      const fileData = await fs.promises.readFile(filePath);
      const result = handlebars.compile(fileData.toString())(data || {});
      await fs.promises.writeFile(outputFilePath, result);
    }

  }, { recursive: true });
};

export default renderDirectory;
