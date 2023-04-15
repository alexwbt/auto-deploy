import { DemoEnv, DemoTemplateEnv } from ".";
import Remote from "../../lib/remote/Remote";
import { EnvHandler } from "../Domain";

export default class DemoUat implements EnvHandler<DemoEnv, DemoTemplateEnv> {

  public getRootDir(): string {
    return "~/demo-uat";
  }

  public async buildEnv(): Promise<DemoEnv> {
    return {
      DEMO_ENV_VARIABLE: "string",
    };
  }

  public async buildTemplateEnv(): Promise<DemoTemplateEnv> {
    return {
      DEMO_TEMPLATE_ENV_VARIABLE: "string",
    };
  }

  public async unpackHook(remote: Remote, targetDir: string): Promise<void> {

  }

}
