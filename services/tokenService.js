const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      }
    );
  });
};

const generateAccessToken = (username, roles) => {
  return jwt.sign(
    {
      UserInfo: {
        username: username,
        roles: roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30s" }
  );
};

module.exports = { verifyRefreshToken, generateAccessToken };
