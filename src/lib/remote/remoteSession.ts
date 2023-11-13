import createJumpRemote, { JumpRemoteConfig } from "./createJumpRemote";
import createRemote, { RemoteConfig } from "./createRemote";
import Remote from "./Remote";

const remoteSession = async (
  config: ({ jump: true; } & JumpRemoteConfig) | ({ jump: false; } & RemoteConfig),
  run: (remote: Remote) => Promise<void>
) => {
  console.log("connecting...");
  const remote = await (config.jump
    ? createJumpRemote(config)
    : createRemote(config));
  console.log("connected");

  let success = true;
  try {
    await run(remote);
  } catch (error) {
    console.log(error);
    success = false;
  }

  console.log("terminating...");
  remote.client.end();
  console.log("terminated");

  return success;
};

export default remoteSession;
