// check if user is logged in
module.exports = (req, res, next) => {
  const userStatus = req.headers["userStatus"];

  if (!userStatus || userStatus !== "SIGNEDIN") {
    return res.status(401).json({ message: "You are not signed in!" });
  }

  next();
};
