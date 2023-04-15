import Remote from "../lib/remote/Remote";

export interface EnvHandler<EnvType, TemplateEnvType> {
  getRootDir(): string;
  buildEnv(): Promise<EnvType>;
  buildTemplateEnv(): Promise<TemplateEnvType>;
  unpackHook(remote: Remote, targetDir: string): Promise<void>;
}

export default class Domain<EnvType, TemplateEnvType> {

  constructor(
    private envs: { [env: string]: EnvHandler<EnvType, TemplateEnvType> | undefined },
  ) { }

  private getEnv(env: string): EnvHandler<EnvType, TemplateEnvType> {
    const handler = this.envs[env];
    if (!handler)
      throw new Error("invalid env");
    return handler;
  }

  public getRootDir(env: string): string {
    return this.getEnv(env).getRootDir();
  }

  public buildEnv(env: string): Promise<EnvType> {
    return this.getEnv(env).buildEnv();
  }

  public buildTemplateEnv(env: string): Promise<TemplateEnvType> {
    return this.getEnv(env).buildTemplateEnv();
  }

  public unpackHook(env: string, remote: Remote, targetDir: string): Promise<void> {
    return this.getEnv(env).unpackHook(remote, targetDir);
  }

}
