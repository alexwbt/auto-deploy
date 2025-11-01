import Remote from "../lib/remote/Remote";

export interface EnvHandler<EnvType, TemplateEnvType> {
  getRootDir(): string;
  buildEnv(): Promise<EnvType>;
  buildTemplateEnv(): Promise<TemplateEnvType>;
  getTemplateExcludeRegex(): Promise<RegExp> | Promise<void>;
  getPackageExcludeRegex(): Promise<RegExp> | Promise<void>;

  initialize(remote: Remote): Promise<void>;
  unpackHook(remote: Remote, targetDir: string): Promise<void>;
  completeHook(remote: Remote, targetDir: string): Promise<void>;
}

export default class Domain<EnvType, TemplateEnvType> {

  constructor(
    private envs: { [env: string]: EnvHandler<EnvType, TemplateEnvType> | undefined; },
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

  public getTemplateExcludeRegex(env: string): Promise<RegExp> | Promise<void> {
    return this.getEnv(env).getTemplateExcludeRegex();
  }

  public getPackageExcludeRegex(env: string): Promise<RegExp> | Promise<void> {
    return this.getEnv(env).getPackageExcludeRegex();
  }

  public initialize(env: string, remote: Remote): Promise<void> {
    return this.getEnv(env).initialize(remote);
  }

  public unpackHook(env: string, remote: Remote, targetDir: string): Promise<void> {
    return this.getEnv(env).unpackHook(remote, targetDir);
  }

  public completeHook(env: string, remote: Remote, targetDir: string): Promise<void> {
    return this.getEnv(env).completeHook(remote, targetDir);
  }

}
