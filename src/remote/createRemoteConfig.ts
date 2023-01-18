import { getEnvNumber, getEnvStringRequired } from "../utils/env";
import { RemoteConfig } from "./createRemote";

const createRemoteConfig: RemoteConfig = {
  port: getEnvNumber("REMOTE_PORT", 22),
  host: getEnvStringRequired("REMOTE_HOST"),
  username: getEnvStringRequired("REMOTE_USER"),
  privateKey: getEnvStringRequired("REMOTE_PRIVATE_KEY"),
};

export default createRemoteConfig;
