import jwt from "jsonwebtoken";

//under testing
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No JWT token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid JWT token" });
    }

    req.userId = decoded.id;
    req.email = decoded.email;
    req.role = decoded.role;
    next();
  });
}

export default authMiddleware;
