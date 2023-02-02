import { RemoteExecResult } from "../../RemoteClient";
import RemoteSoftware from "../RemoteSoftware";

export default abstract class RemoteMachine extends RemoteSoftware {

  public abstract init(): Promise<RemoteExecResult>;

  public abstract installGit(): Promise<RemoteExecResult>;
  public abstract installDocker(): Promise<RemoteExecResult>;

}
