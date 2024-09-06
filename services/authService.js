const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

const authenticateUser = async (username, password) => {
  const user = await userRepository.findByUsername(username);
  if (!user) return { success: false };

  const match = await bcrypt.compare(password, user.password);
  if (!match) return { success: false };

  const roles = Object.values(user.roles);
  const accessToken = generateAccessToken(user.username, roles);
  const refreshToken = generateRefreshToken(user.username);

  await userRepository.updateRefreshToken(user._id, refreshToken);

  return {
    success: true,
    roles,
    accessToken,
    refreshToken,
  };
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
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (username) => {
  return jwt.sign({ username: username }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

module.exports = { authenticateUser };
