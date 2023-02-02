import createRemote, { RemoteConfig } from "./createRemote";
import Remote from "./Remote";

const remoteSession = async (
  config: RemoteConfig,
  run: (remote: Remote) => Promise<void>
) => {
  console.log("connecting...");
  const remote = await createRemote(config);
  console.log("connected");

  try {
    await run(remote);
  } catch (error) {
    console.log(error);
  }

  console.log("terminating...");
  remote.client.end();
  console.log("terminated");
};

export default remoteSession;
