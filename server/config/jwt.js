const jwt = require('jsonwebtoken');

const config = {
  secret : process.env.SESS_SECRET,
};

function verify(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        reject(err);
      }
      // if everything good, save to request for use in other routes
      resolve(decoded);
    });
  });

}

function create(jsondata) {
  return jwt.sign(jsondata, config.secret, {
    expiresIn : 86400, // expires in 24 hours
  });
}

module.exports = {
  verify,
  create,
  config,
};
