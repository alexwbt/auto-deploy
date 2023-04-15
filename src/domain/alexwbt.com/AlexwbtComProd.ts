import { AlexwbtComEnv, AlexwbtComTemplateEnv } from ".";
import Remote from "../../lib/remote/Remote";
import { EnvHandler } from "../Domain";

export default class AlexwbtComProd implements EnvHandler<AlexwbtComEnv, AlexwbtComTemplateEnv> {

  public getRootDir(): string {
    return "/app/prod";
  }

  public async buildEnv(): Promise<AlexwbtComEnv> {
    return {
      CERT_EMAIL: "alexwbtg@gmail.com",
    };
  }

  public async buildTemplateEnv(): Promise<AlexwbtComTemplateEnv> {
    return {
      ALEXWBT_DOMAIN: "alexwbt.com",
    };
  }

  public async unpackHook(remote: Remote, targetDir: string): Promise<void> {}

}
