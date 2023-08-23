const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  const mongoClient = await new MongoClient(
    process.env.MONGODB_URI,
    {}
  ).connect();
  const db = mongoClient.db("data");
  const collection = db.collection("users");
  const results = await collection.find({ username: user }).toArray();

  if (results.length != 1) return res.sendStatus(401);

  const match = await bcrypt.compare(pwd, results[0]?.password);
  if (match) {
    const roles = Object.values(results[0].roles);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: results[0].username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    const refreshToken = jwt.sign(
      { username: results[0].username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    await db
      .collection("users")
      .findOneAndUpdate(
        { _id: results[0]._id },
        { $set: { refreshToken: refreshToken } }
      );
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ roles, accessToken });
  } else {
    res.sendStatus(401);
  }
  mongoClient.close();
};

module.exports = { handleLogin };
