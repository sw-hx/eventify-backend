import express from "express";
import authMiddleware from "./middleware/authMiddleware.js";
import trimMiddleware from "./middleware/trimMiddleware.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(trimMiddleware);

// Routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`node is running at PORT ${PORT}`);
});
