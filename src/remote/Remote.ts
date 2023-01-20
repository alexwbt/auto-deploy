import RemoteClient from "./RemoteClient";
import RemoteEC2 from "./software/machine/RemoteEC2";
import RemoteMachine from "./software/machine/RemoteMachine";
import RemoteGit from "./software/RemoteGit";

export default class Remote {

  public readonly machine: RemoteMachine;
  public readonly git: RemoteGit;

  constructor(
    public readonly client: RemoteClient
  ) {
    this.machine = new RemoteEC2(client);
    this.git = new RemoteGit(client);
  }

}
