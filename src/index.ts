import express, { Express } from "express";
import mongoose from "mongoose";
import cron from "node-cron";
import { config } from "./config/config";
import { CoinGeckoService } from "./services/coinGeckoService";
import { getCryptoStats } from "./controllers/stats.controller";
import router from "./routes/route";
import cors from "cors";

class App {
  private readonly app: Express;
  private readonly coinGeckoService: CoinGeckoService;

  constructor() {
    this.app = express();
    this.coinGeckoService = new CoinGeckoService();
  }

  private async connectToDatabase(): Promise<void> {
    try {
      await mongoose.connect(config.mongodb.uri);
      console.log("Connected to MongoDB successfully");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    }
  }

  private setupMiddleware(): void {
    this.app.use(cors({ origin: "*" }));
    this.app.use(express.json());
    // this.app.get("/test", (req, res) => {
    //   console.log("hi");
    // });
    this.app.use("/api", router);
    // Add any other middleware here
  }

  private setupCronJobs(): void {
    // Schedule crypto data fetching every 2 hours
    cron.schedule(config.job.interval, async () => {
      try {
        await this.coinGeckoService.fetchAndStoreAll();
      } catch (error) {
        console.error("Error in cron job:", error);
      }
    });
  }

  private async initialFetch(): Promise<void> {
    try {
      console.log("Performing initial data fetch...");
      await this.coinGeckoService.fetchAndStoreAll();
      console.log("Initial data fetch completed");
    } catch (error) {
      console.error("Error in initial fetch:", error);
    }
  }

  public async start(): Promise<void> {
    try {
      // Connect to MongoDB
      await this.connectToDatabase();
      console.log("Setting up middleware");
      // Setup middleware
      this.setupMiddleware();

      // Perform initial fetch
      await this.initialFetch();

      // Setup cron jobs
      this.setupCronJobs();

      // Start the server
      const PORT = process.env.PORT || 3000;
      this.app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log("Crypto price tracker started successfully");
      });

      // Handle graceful shutdown
      process.on("SIGTERM", async () => {
        console.log("SIGTERM received. Starting graceful shutdown...");
        await this.shutdown();
      });

      process.on("SIGINT", async () => {
        console.log("SIGINT received. Starting graceful shutdown...");
        await this.shutdown();
      });
    } catch (error) {
      console.error("Error starting the application:", error);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    try {
      // Close MongoDB connection
      await mongoose.connection.close();
      console.log("MongoDB connection closed");

      // Exit the process
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  }
}

// Start the application
if (require.main === module) {
  const app = new App();
  app.start().catch((error) => {
    console.error("Failed to start application:", error);
    process.exit(1);
  });
}

// Export for testing purposes
export default App;
