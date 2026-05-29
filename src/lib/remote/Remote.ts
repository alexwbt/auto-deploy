import RemoteClient from "./RemoteClient";
import RemoteMachines from "./software/machine";
import RemoteMachine from "./software/machine/RemoteMachine";
import RemoteGit from "./software/RemoteGit";

export default class Remote {
  public readonly machine: RemoteMachine;
  public readonly git: RemoteGit;

  constructor(
    public readonly client: RemoteClient,
    machine: keyof typeof RemoteMachines,
  ) {
    this.machine = new RemoteMachines[machine](client);
    this.git = new RemoteGit(client);
  }
}
