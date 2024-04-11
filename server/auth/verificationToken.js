const jwt = require('jsonwebtoken');

const generateVerificationToken = () => {
  // Generate a verification token with JWT
  const token = jwt.sign({ verification: 'token' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};

module.exports = { generateVerificationToken };
