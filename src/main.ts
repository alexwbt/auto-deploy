import { getRemote } from "./remote";

(async () => {
  const remote = await getRemote();

  console.log(await remote.uptime());

  remote.end();
})();
