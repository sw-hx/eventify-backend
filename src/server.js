import express from "express";
import authMiddleware from "./middleware/authMiddleware.js";
import trimMiddleware from "./middleware/trimMiddleware.js";
import verifyAccountStatusMiddleware from "./middleware/accountStatusMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categories.js";
import serviceRoutes from "./routes/services.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import staticesRoutes from "./routes/staticesRoutes.js";
import testDatabaseConnection from "./testing/database/connectToDatabase.js";
import models from "./models/index.js";
import initApp from "./script/init-default-admin.js";

const app = express();
const PORT = process.env.PORT || 3000;

//test database connection
testDatabaseConnection();

//test module init
console.log(models);

//init backend and add default admin
await initApp();

// Middlewares
app.use(express.json());
app.use(trimMiddleware);

// Routes
app.use("/api/auth", authRoutes);
app.use(
  "/api/categories",
  authMiddleware,
  verifyAccountStatusMiddleware,
  categoryRoutes,
);
app.use(
  "/api/services",
  authMiddleware,
  verifyAccountStatusMiddleware,
  serviceRoutes,
);
app.use("/api/user", authMiddleware, verifyAccountStatusMiddleware, userRoutes);
app.use(
  "/api/admin",
  authMiddleware,
  verifyAccountStatusMiddleware,
  adminRoutes,
);
app.use(
  "/api/bookings",
  authMiddleware,
  verifyAccountStatusMiddleware,
  bookingRoutes,
);
app.use(
  "/api/statices",
  authMiddleware,
  verifyAccountStatusMiddleware,
  staticesRoutes,
);

app.listen(PORT, () => {
  console.log(`node is running at PORT ${PORT}`);
});
