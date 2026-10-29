const TaskAssignment = require("../models/TaskAssignment");
const { sendData } = require("../utils/response");

const list = async (_req, res) => {
  const leaderboard = await TaskAssignment.aggregate([
    { $match: { status: "approved" } },
    { $lookup: { from: "tasks", localField: "task", foreignField: "_id", as: "task" } },
    { $unwind: "$task" },
    {
      $group: {
        _id: "$member",
        points: { $sum: "$task.points" },
        completedTasks: { $sum: 1 },
        lastCompletedAt: { $max: "$reviewedAt" },
      },
    },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "member" } },
    { $unwind: "$member" },
    { $match: { "member.status": "active" } },
    { $sort: { points: -1, completedTasks: -1, lastCompletedAt: 1, "member.fullName": 1 } },
    { $limit: 100 },
    {
      $project: {
        _id: 0,
        memberId: "$_id",
        fullName: "$member.fullName",
        points: 1,
        completedTasks: 1,
      },
    },
  ]);

  return sendData(res, { leaderboard: leaderboard.map((entry, index) => ({ rank: index + 1, ...entry })) });
};

module.exports = { list };
