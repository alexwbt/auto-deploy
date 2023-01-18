import createRemote from "./remote/createRemote";
import createRemoteConfig from "./remote/createRemoteConfig";

(async () => {
  console.log("connecting...");
  const remote = await createRemote(createRemoteConfig);
  console.log("connected");

  // const gitVersion = await remote.git.version();
  // console.log(gitVersion);
  // if (!gitVersion) {
  //   await remote.pm.installGit();
  // }

  console.log(await remote.client.upload("~/test", "configuration"));

  console.log("terminating...");
  remote.client.end();
  console.log("terminated");
})();
