const app = require("express");
const jwt = require("jsonwebtoken");
const { JWT_ADMIN_SECRET } = require("../config");

async function adminMiddleware(req, res, next) {
  const token = req.headers.token;
  try {
    const response = await jwt.verify(token, JWT_ADMIN_SECRET);
    req.userId = response.id;
    next();
  } catch {
    res.status(403).json({ error: "invalid authorization" });
    return;
  }
}

module.exports = {
  adminMiddleware,
};
