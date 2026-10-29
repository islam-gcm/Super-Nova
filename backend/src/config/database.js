const mongoose = require("mongoose");
const { env } = require("./env");

const supportsTransactions = () => {
  const topologyType = mongoose.connection.getClient()?.topology?.description?.type;
  return topologyType === "ReplicaSetWithPrimary" || topologyType === "Sharded";
};

const connectDatabase = async (uri = env.mongoUri) => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { autoIndex: !env.isProduction });

  if (!supportsTransactions()) {
    const message = "MongoDB must run as a replica set for task and account workflows";
    if (env.isProduction) {
      await mongoose.disconnect();
      throw new Error(message);
    }
    console.warn(`Warning: ${message}. Transaction-backed actions will be unavailable.`);
  }

  return mongoose.connection;
};

const disconnectDatabase = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDatabase, disconnectDatabase, supportsTransactions };
