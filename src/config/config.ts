import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

interface Config {
  mongodb: {
    uri: string;
  };
  coinGecko: {
    baseUrl: string;
    coins: readonly ["bitcoin", "matic-network", "ethereum"];
  };
  job: {
    interval: string;
  };
}

export const config: Config = {
  mongodb: {
    uri: process.env.MONGODB_URI || "https://api.coingecko.com/api/v3",
  },
  coinGecko: {
    baseUrl: "https://api.coingecko.com/api/v3",
    coins: ["bitcoin", "matic-network", "ethereum"] as const,
  },
  job: {
    interval: "0 */2 * * *", // Run every 2 hours
  },
};

// Type for supported coin IDs
export type CoinId = (typeof config.coinGecko.coins)[number];
