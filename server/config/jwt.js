const jwt = require('jsonwebtoken');

const config = {
  secret : process.env.SESS_SECRET,
};

function verify(req, successCallBack, failedCallBack) {
  const token = req.headers['x-access-token'];
  if (!token) {
    return failedCallBack({ auth : false, message : 'No token provided. x-access-token should be provided' });
  }
  return jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      failedCallBack(err);
    } else {
      // if everything good, save to request for use in other routes
      successCallBack(decoded);
    }
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
