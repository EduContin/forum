import { Client } from "pg";

async function query(queryObject: any) {
  let client: Client | undefined;

  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (endError) {
        console.error("Error closing client connection:", endError);
      }
    }
  }
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT
      ? Number(process.env.POSTGRES_PORT)
      : undefined,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });

  await client.connect();
  return client;
}

const database = {
  query,
  getNewClient,
};

export default database;

function getSSLValues() {
  if (process.env.NODE_ENV === "production") {
    console.log("In production.. trying to get SSL values");
    if (process.env.POSTGRES_CA) {
      console.log("SSL values found");
      return {
        ca: process.env.POSTGRES_CA,
      };
    }
    console.log("No SSL values found");
    return false;
  }
  return false;
}
