import express from "express";
import authMiddleware from "./middleware/authMiddleware.js";
import trimMiddleware from "./middleware/trimMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categories.js";
import serviceRoutes from "./routes/services.js";
import testDatabaseConnection from "./testing/database/connectToDatabase.js";
import models from "./models/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

//test database connection
testDatabaseConnection();

//test module init
console.log(models);

// Middlewares
app.use(express.json());
app.use(trimMiddleware);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", authMiddleware, categoryRoutes);
app.use("/api/services", authMiddleware, serviceRoutes);

app.listen(PORT, () => {
  console.log(`node is running at PORT ${PORT}`);
});
