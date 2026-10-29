const bcrypt = require("bcryptjs");
const User = require("../src/models/User");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const { validateEnv } = require("../src/config/env");
const { ROLES } = require("../src/constants");

const seedAdmin = async () => {
  validateEnv();
  const fullName = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!fullName || !email || !password || password.length < 10) {
    throw new Error("ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD (10+ characters) are required");
  }

  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: { fullName, passwordHash, status: "active" },
      $addToSet: { roles: { $each: [ROLES.LEAD, ROLES.MEMBER] } },
    },
    { new: true, upsert: true, runValidators: true }
  );
  console.log(`Lead account ready: ${user.email}`);
};

seedAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
