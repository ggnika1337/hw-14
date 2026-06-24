// check if req body exists
module.exports = (req, res, next) => {
  if (!req.body?.name || !req.body?.price) {
    return res.status(400).json({ message: "fields are empty" });
  }

  next();
};
