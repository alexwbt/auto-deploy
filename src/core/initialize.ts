import Remote from "../lib/remote/Remote";

const initialize = async (remote: Remote) => {
  console.log(await remote.machine.init());
  console.log(await remote.machine.installGit());
  console.log(await remote.machine.installDocker());
};

export default initialize;
