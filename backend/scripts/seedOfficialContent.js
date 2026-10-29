const SiteContent = require("../src/models/SiteContent");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const { validateEnv } = require("../src/config/env");

const achievements = [
  {
    title: "starlet training",
    subtitle: "On divers topics",
    description: "Starlet Training is a six-day program by the Supernova Scientific Club that helps University of Boumerdes students build practical and creative skills through themed workshops, ending with a final team project competition.",
    imageUrl: "https://picsum.photos/300/200",
    sortOrder: 0,
  },
  {
    title: "quantum day",
    subtitle: "conferences",
    description: "Starlet Training",
    imageUrl: "https://picsum.photos/300/200",
    sortOrder: 1,
  },
  {
    title: "nasa",
    subtitle: "hackathon",
    description: "NASA hackathon",
    imageUrl: "https://picsum.photos/300/200",
    sortOrder: 2,
  },
];

const seedOfficialContent = async () => {
  validateEnv();
  await connectDatabase();

  let created = 0;
  for (const achievement of achievements) {
    const result = await SiteContent.updateOne(
      { kind: "achievement", title: achievement.title },
      { $setOnInsert: { kind: "achievement", ...achievement } },
      { upsert: true, runValidators: true }
    );
    if (result.upsertedCount) created += 1;
  }

  console.log(`Official achievements synchronized: ${created} created, ${achievements.length - created} already present`);
};

seedOfficialContent()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
