import { getEnvString } from "../../utils/env";
import RemoteClient, { RemoteExecResult } from "../RemoteClient";

const Packages = [
  "git",
  "make",
  "docker",
  "dos2unix",
  "vim",
  "htop",
  "tmux",
  "tree",
  "minikube",
  "helm",
  "unzip",
] as const;
export type Package = (typeof Packages)[number];

export default abstract class RemoteMachine {
  constructor(
    protected readonly client: RemoteClient,
    protected packageInstallers: {
      [key in Package]?: () => Promise<RemoteExecResult>;
    } = {},
  ) {}

  protected registerPackageInstaller(
    packageName: Package,
    installer: () => Promise<RemoteExecResult>,
  ) {
    this.packageInstallers[packageName] = installer;
  }

  public sudo() {
    const password = getEnvString("REMOTE_SUDO_PASSWORD");
    return password ? `echo ${password} | sudo -S` : "sudo";
  }

  public abstract updatePackages(): Promise<RemoteExecResult>;

  public abstract _install(packageName: Package): Promise<RemoteExecResult>;

  public async install(
    packageName: Package,
    ignoreExisting?: boolean,
  ): Promise<RemoteExecResult> {
    if (!ignoreExisting) {
      const existsRes = await this.client
        .exec(`command -v "${packageName}"`)
        .catch(e => e);
      if (existsRes.code === 0 || !!existsRes.stdout) {
        console.log(`skipping "${packageName}" (already installed)`);
        return existsRes;
      }
    }

    console.log(`installing "${packageName}"...`);
    const installer = this.packageInstallers[packageName];

    try {
      const res = await (installer ? installer() : this._install(packageName));
      console.log(`installed "${packageName}"`);
      return res;
    } catch (e) {
      console.error(`failed to install "${packageName}"`, e);
      throw e;
    }
  }
}
