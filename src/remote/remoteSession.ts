import createRemote from "./createRemote";
import createRemoteConfig from "./createRemoteConfig";
import Remote from "./Remote";

const remoteSession = async (run: (remote: Remote) => Promise<void>) => {
  console.log("connecting...");
  const remote = await createRemote(createRemoteConfig);
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
