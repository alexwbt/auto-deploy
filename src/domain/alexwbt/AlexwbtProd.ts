import { AxEnv, AxTemplateEnv } from ".";
import Remote from "../../lib/remote/Remote";
import { EnvHandler } from "../Domain";

export default class AlexwbtProd implements EnvHandler<AxEnv, AxTemplateEnv> {
  public getRootDir(): string {
    return "/root";
  }

  public async getTemplateExcludeRegex() {}

  public async getPackageExcludeRegex() {}

  public async buildEnv(): Promise<AxEnv> {
    return {
      CERTBOT_EMAIL: "alexwbtg@gmail.com",
    };
  }

  public async buildTemplateEnv(): Promise<AxTemplateEnv> {
    return {
      ALEXWBT_DOMAIN_NAME: "alexwbt.com",
    };
  }

  public async unpackHook(
    remote: Remote,
    targetDir: string,
    runtimeDir: string,
  ): Promise<void> {
    console.log("converting dos to unix...");
    await remote.client.exec(
      `find ${targetDir} -type f -not -path "${runtimeDir}/*" -not -path "${targetDir}/.git/*" -exec dos2unix {} \\; || true`,
    );
  }

  public async initialize(remote: Remote): Promise<void> {}

  public async completeHook(
    remote: Remote,
    targetDir: string,
    runtimeDir: string,
  ): Promise<void> {}
}
