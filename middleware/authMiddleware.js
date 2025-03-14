const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;

    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid user" });
    }
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};
