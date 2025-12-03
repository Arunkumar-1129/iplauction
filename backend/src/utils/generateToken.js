const jwt = require('jsonwebtoken');

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      team: user.team,
    },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

module.exports = generateToken;



