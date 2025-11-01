import renderDirectory from "../lib/template/renderDirectory";
import buildEnvFile from "../lib/utils/buildEnvFile";

export type PackageConfig = {
  /**
   * Package directory.
   */
  package: string;

  /**
   * Package output directory.
   */
  outputDir: string;

  /**
   * Regex to exclude files from the output package.
   */
  packageExcludeRegex?: RegExp;

  /**
   * Runtime environment variables.
   */
  env?: { [key: string]: string; };

  /**
   * Template variables.
   */
  templateEnv?: { [key: string]: string; };

  /**
   * Regex to exclude files from the template rendering.
   */
  templateExcludeRegex?: RegExp;

  /**
   * Package hook, called after rendering package dir.
   */
  packageHook?: (packageDir: string) => Promise<void>;
};

const buildPackage = async (config: PackageConfig) => {
  // render template
  await renderDirectory({
    srcDir: config.package,
    destDir: config.outputDir,
    data: {
      ...config.templateEnv,
      ...config.env,
    },
    packageExcludeRegex: config.packageExcludeRegex,
    templateExcludeRegex: config.templateExcludeRegex,
  });
  config.packageHook && await config.packageHook(config.outputDir);

  // build env
  await buildEnvFile(`${config.outputDir}/.env`, config.env || {});
};

export default buildPackage;
