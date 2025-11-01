import { getEnvString } from "../../../utils/env";
import { RemoteExecResult } from "../../RemoteClient";
import RemoteSoftware from "../RemoteSoftware";

const Packages = [
  "git",
  "make",
  "docker",
  "dos2unix",
  "vim",
  "htop",
  "tmux",
] as const;
export type Package = typeof Packages[number];

export default abstract class RemoteMachine extends RemoteSoftware {

  protected packageInstallers: { [key in Package]?: () => Promise<RemoteExecResult> } = {};

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

  public install(packageName: Package): Promise<RemoteExecResult> {
    const installer = this.packageInstallers[packageName];
    return installer ? installer() : this._install(packageName);
  }

}
