const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./user');

const signToken = id => {
  return jwt.sign({ id },"secret_qwertyuiop1234567890", {
    expiresIn:"90d"
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
cookieOptions.secure = false;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
};

exports.signUp = async (req, res, next) => {
  console.log(req.body)
  const newUser = await User.create(req.body);
  createSendToken(newUser, 200, res);
  res.redirect("/login")
}

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next('Please provide email or password')
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next('email or password is incorrect');
  }
  createSendToken(user, 201, res);
  res.redirect("/show")
}

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
    (`You are not logged in.Please log in to access`)
    );
  }

  const decoded = await promisify(jwt.verify)(token,"secret_qwertyuiop1234567890");

  user = await User.findById(decoded.id);
  if (!user) {
    return next(
      ('The user belonging to the token no longer exist')
    );
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      (
        `User has recently changed their password.Please log in again`)
    );
  }

  req.user = user;
  next();
}

exports.logout = async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expiresIn: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
}


      