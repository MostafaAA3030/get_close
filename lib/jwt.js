require('dotenv').config();

const jwt = require('jsonwebtoken');

const jwt_methods = {
  generateAccessToken: function(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10s'})
  },
  generateRefreshToken: function(user) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1h'});
  },
  verifyAccessToken: function(token, callback) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, user) {
      if(err) {
        callback(err)
      } else {
        callback(null, user)
      }
    });
  },
  verifyRefreshToken: function (token, callback) {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, function(err, user) {
      if(err) {
        callback(err, null)
      } else {
        callback(null, user)
      }
    });
  }
}

module.exports = jwt_methods;
