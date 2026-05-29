import RemoteClient, { RemoteExecResult } from "../../RemoteClient";
import RemoteMachine, { Package } from "./RemoteMachine";

export default class RemoteEC2 extends RemoteMachine {
  constructor(protected readonly client: RemoteClient) {
    super(client);
    this.registerPackageInstaller("git", () => this.installGit());
    this.registerPackageInstaller("docker", () => this.installDocker());
  }

  public override updatePackages(): Promise<RemoteExecResult> {
    return this.client.exec(`${this.sudo()} yum update -y`);
  }

  public override _install(packageName: Package): Promise<RemoteExecResult> {
    return this.client.exec(`${this.sudo()} yum install -y ${packageName}`);
  }

  public installGit(): Promise<RemoteExecResult> {
    return this.client.exec(`${this.sudo()} yum install git -y \
      && git config --global user.name ubuntu \
      && git config --global user.email ubuntu@localhost`);
  }

  public installDocker(): Promise<RemoteExecResult> {
    return this.client.exec(`${this.sudo()} sh -c '\
      yum install docker -y \
      && service docker start \
      && usermod -a -G docker ec2-user \
      && chmod 666 /var/run/docker.sock \
      && curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose \
      && chmod +x /usr/local/bin/docker-compose'`);
  }
}
