// check for secretkey
module.exports = (secretkeys) => (req, res, next) => {
  const secretkey = req.headers["secret"];

  if (!secretkeys.includes(secretkey)) {
    return res.status(403).json({ message: "Permission denied" });
  }

  next();
};
