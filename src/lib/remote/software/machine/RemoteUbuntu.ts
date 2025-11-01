import RemoteClient, { RemoteExecResult } from "../../RemoteClient";
import RemoteMachine, { Package } from "./RemoteMachine";

export default class RemoteUbuntu extends RemoteMachine {

  constructor(protected readonly client: RemoteClient) {
    super(client);
    this.registerPackageInstaller("git", () => this.installGit());
    this.registerPackageInstaller("docker", () => this.installDocker());
  }

  public override updatePackages(): Promise<RemoteExecResult> {
    return this.client.exec(`${this.sudo()} apt update -y`);
  }

  public override _install(packageName: Package): Promise<RemoteExecResult> {
    return this.client.exec(`${this.sudo()} apt install -y ${packageName}`);
  }

  public installGit(): Promise<RemoteExecResult> {
    return this.client.exec(`${this.sudo()} apt install git -y \
      && git config --global user.name ubuntu \
      && git config --global user.email ubuntu@localhost`);
  }

  public installDocker(): Promise<RemoteExecResult> {
    return this.client.exec(`${this.sudo()} sh -c '\
      apt install ca-certificates curl gnupg -y \
      && install -m 0755 -d /etc/apt/keyrings \
      && curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --yes --dearmor -o /etc/apt/keyrings/docker.gpg \
      && chmod a+r /etc/apt/keyrings/docker.gpg \
      && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list \
      && apt update -y \
      && apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y \
      && groupadd -f docker \
      && usermod -aG docker $(whoami)'`);
  }

}
