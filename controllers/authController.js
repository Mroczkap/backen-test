const authService = require('../services/authService');
const { validateLoginInput } = require('../middleware/validateInput');
const userService = require('../services/userService');
const tokenService = require('../services/tokenService');

const handleLogin = async (req, res) => {
  try {
    const { error } = validateLoginInput(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { user, pwd } = req.body;
    const authResult = await authService.authenticateUser(user, pwd);

    if (authResult.success) {
      res.cookie('jwt', authResult.refreshToken, {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({ roles: authResult.roles, accessToken: authResult.accessToken });
    } else {
      res.status(401).json({ message: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const handleLogout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(204); // No content
  }
  const refreshToken = cookies.jwt;

  try {
    const foundUser = await userService.removeRefreshToken(refreshToken);

    if (!foundUser) {
      res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
      return res.sendStatus(204);
    }

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const handleRefreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) {
      return res.sendStatus(401);
    }

    const user = await userService.findUserByRefreshToken(refreshToken);
    if (!user) {
      return res.sendStatus(403);
    }

    const decodedToken = await tokenService.verifyRefreshToken(refreshToken);
    if (!decodedToken || user.username !== decodedToken.username) {
      return res.sendStatus(403);
    }

    const roles = Object.values(user.roles);
    const accessToken = tokenService.generateAccessToken(user.username, roles);

    res.json({ roles, accessToken });
  } catch (error) {
    console.error('Error in handleRefreshToken:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = { handleLogin, handleLogout, handleRefreshToken };