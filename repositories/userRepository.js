const database = require("../services/dbService");
const db = database.client.db("data");
const collection = db.collection("users");
const fsPromises = require("fs").promises;
const path = require("path");
const USER_FILE_PATH = path.join(__dirname, "..", "model", "users.json");

const findByUsername = async (username) => {
  return await collection.findOne({ username: username });
};

const updateRefreshToken = async (userId, refreshToken) => {
  await collection.findOneAndUpdate(
    { _id: userId },
    { $set: { refreshToken: refreshToken, lastLogin: new Date() } }
  );
};
const getUsers = async () => {
  const data = await fsPromises.readFile(USER_FILE_PATH, "utf8");
  return JSON.parse(data);
};

const saveUsers = async (users) => {
  await fsPromises.writeFile(USER_FILE_PATH, JSON.stringify(users));
};

const findByRefreshToken = async (refreshToken) => {
  const results = await collection.find({ refreshToken: refreshToken }).toArray();
  return results.length > 0 ? results[0] : null;
};

module.exports = { findByUsername, updateRefreshToken, getUsers, saveUsers, findByRefreshToken };
