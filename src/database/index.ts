import { createConnection, getConnectionOptions } from "typeorm";

export default async () => {
  const options = await getConnectionOptions();

  Object.assign(options, {
    database: process.env.NODE_ENV === "test" ? "fin_api" : options.database,
  });

  return createConnection(options);
};
