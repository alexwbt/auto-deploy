import fs from "fs";
import path from "path";
import { forEachFile } from "../utils/file";
import handlebars from "./handlebars";

const renderDirectory = (
  srcDir: string,
  destDir: string,
  data: object,
) => {
  return forEachFile(srcDir, async ({ filePath }) => {
    const fileData = await fs.promises.readFile(filePath);
    const fileDataString = fileData.toString();

    const relativeFilePath = path.relative(srcDir, filePath);
    const outputFilePath = path.join(destDir, relativeFilePath);

    const template = handlebars.compile(fileDataString);
    const result = template(data);

    await fs.promises.mkdir(path.dirname(outputFilePath), { recursive: true });
    await fs.promises.writeFile(outputFilePath, result);
  }, { recursive: true });
};

export default renderDirectory;
