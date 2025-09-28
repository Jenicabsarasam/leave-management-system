import jwt from "jsonwebtoken";

const JWT_SECRET = "your_jwt_secret_key"; // keep same as in authController

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: "No token provided" });

  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ msg: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

// Middleware to allow only specific roles
export const permit = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({ msg: "Forbidden: Access denied" });
    next();
  };
};
