const jwt = require("jsonwebtoken");
require("dotenv").config();

const database = require("../services/db");
const db = database.client.db("data");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;
  const collection = db.collection("users");
  const results = await collection
    .find({ refreshToken: refreshToken })
    .toArray();

  if (results.length == 0) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || results[0].username !== decoded.username)
      return res.sendStatus(403);
    const roles = Object.values(results[0].roles);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: decoded.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    res.json({ roles, accessToken });
  });
};

module.exports = { handleRefreshToken };
