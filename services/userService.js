const userRepository = require("../repositories/userRepository");

const removeRefreshToken = async (refreshToken) => {
  const users = await userRepository.getUsers();
  const foundUser = users.find((user) => user.refreshToken === refreshToken);

  if (!foundUser) {
    return null;
  }

  const updatedUsers = users.map((user) =>
    user.refreshToken === refreshToken ? { ...user, refreshToken: "" } : user
  );

  await userRepository.saveUsers(updatedUsers);

  return foundUser;
};

const findUserByRefreshToken = async (refreshToken) => {
  return await userRepository.findByRefreshToken(refreshToken);
};

module.exports = { removeRefreshToken, findUserByRefreshToken };
