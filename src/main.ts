import { getRemote } from "./remote";

(async () => {
  console.log("connecting...");
  const remote = await getRemote();
  console.log("connected");

  const gitVersion = await remote.git.version();
  console.log(gitVersion);
  if (!gitVersion) {
    await remote.pm.installGit();
  }

  console.log("terminating...");
  remote.end();
  console.log("terminated");
})();
