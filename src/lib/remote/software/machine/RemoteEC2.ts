import { RemoteExecResult } from "../../RemoteClient";
import RemoteMachine from "./RemoteMachine";

export default class RemoteEC2 extends RemoteMachine {

  public override init(): Promise<RemoteExecResult> {
    return this.client.exec("sudo yum update -y");
  }

  public override installGit(): Promise<RemoteExecResult> {
    return this.client.exec("sudo yum install git -y");
  }

  public override installDocker(): Promise<RemoteExecResult> {
    return this.client.exec("sudo yum install docker -y "
      + "&& sudo service docker start "
      + "&& sudo usermod -a -G docker ec2-user"
      + "&& sudo chmod 666 /var/run/docker.sock"
      + "&& sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose"
      + "&& sudo chmod +x /usr/local/bin/docker-compose");
  }

}
