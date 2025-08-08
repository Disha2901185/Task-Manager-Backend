const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const { userAuth } = require("../middlewares/auth");
const { authRouter } = require("../routes/authRoutes");
const profileRouter = require("../routes/profile.routes");
const taskRouter = require("../routes/tasks.routes");
const connectDB = require("./config/database");

const app = express();
const PORT = 3001;

// Swagger setup
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Uniteam API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Uniteam backend',
    },
    servers: [
      {
        url: 'http://localhost:3001',
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js')], // ✅ Absolute path is better
};


const swaggerSpec = swaggerJsdoc(options);

// Middlewares
app.use(cors({
  origin: "http://localhost:5173", // replace with your frontend origin
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect to database and start server
connectDB()
  .then(() => {
    console.log("✅ Database connection established");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📄 Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });

// Routes
app.use("/", authRouter);
app.use("/profile", profileRouter);
app.use("/task", userAuth, taskRouter);
