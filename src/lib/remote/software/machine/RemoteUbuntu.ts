import { RemoteExecResult } from "../../RemoteClient";
import RemoteMachine from "./RemoteMachine";

export default class RemoteUbuntu extends RemoteMachine {

  public override init(): Promise<RemoteExecResult> {
    return this.client.exec("sudo apt-get update -y");
  }

  public override installGit(): Promise<RemoteExecResult> {
    return this.client.exec("sudo apt-get install git -y");
  }

  public override installDocker(): Promise<RemoteExecResult> {
    return this.client.exec(
      "sudo apt-get install ca-certificates curl gnupg -y "
      + "&& sudo install -m 0755 -d /etc/apt/keyrings "
      + "&& curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --yes --dearmor -o /etc/apt/keyrings/docker.gpg "
      + "&& sudo chmod a+r /etc/apt/keyrings/docker.gpg "
      + `&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null `
      + "&& sudo apt-get update -y "
      + "&& sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y "
      + "&& sudo groupadd -f docker "
      + "&& sudo usermod -aG docker $(whoami) "
    );
  }

}
