import Remote from "../lib/remote/Remote";

const testConnection = async (remote: Remote) => {
  console.log(await remote.client.exec("ls"));
};

export default testConnection;
