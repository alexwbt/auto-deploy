import { getEnvNumber, getEnvStringRequired } from "../utils/env";
import { createRemote, RemoteConfig } from "./Remote";

const remoteConfig: RemoteConfig = {
  port: getEnvNumber("REMOTE_PORT", 22),
  host: getEnvStringRequired("REMOTE_HOST"),
  username: getEnvStringRequired("REMOTE_USER"),
  privateKey: getEnvStringRequired("REMOTE_PRIVATE_KEY"),
};

export const getRemote = () => createRemote(remoteConfig);
