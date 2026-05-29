import RemoteEC2 from "./RemoteEC2";
import RemoteUbuntu from "./RemoteUbuntu";

const RemoteMachines = {
  ec2: RemoteEC2,
  ubuntu: RemoteUbuntu,
} as const;

export default RemoteMachines;
