import { ENV } from "../config/env.js";
import { connectDB } from "../config/db.js";

export const startServer = async (app) => {
  try {
    // First connect to the database
    await connectDB();

    // Then start the server
    app.listen(ENV.PORT, () => {
      console.log(`✅ Server is up and running on PORT: ${ENV.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    process.exit(1); // Exit the process if DB connection fails
  }
};
