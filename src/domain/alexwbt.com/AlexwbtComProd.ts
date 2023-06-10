import { AlexwbtComEnv, AlexwbtComTemplateEnv } from ".";
import Remote from "../../lib/remote/Remote";
import { EnvHandler } from "../Domain";

export default class AlexwbtComProd implements EnvHandler<AlexwbtComEnv, AlexwbtComTemplateEnv> {

  public getRootDir(): string {
    return "~/prod";
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

  public async unpackHook(remote: Remote, targetDir: string): Promise<void> {
    await remote.client.exec(
      `echo >> ${targetDir}/.env && ` +
      `cat ${targetDir}/runtime/secret.env >> ${targetDir}/.env`);
  }

  public async completeHook(remote: Remote, targetDir: string): Promise<void> {}

}
