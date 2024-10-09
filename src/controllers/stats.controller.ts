import { Request, Response } from "express";
import { CryptoPrice } from "../models/CryptoPrice";
import { CoinId } from "../config/config";
import { NextFunction, RequestHandler } from "express-serve-static-core";

// Supported coins
const SUPPORTED_COINS = ["bitcoin", "matic-network", "ethereum"] as const;

// Controller function to get cryptocurrency stats
export const getCryptoStats: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const coinId = req.query.coinId as CoinId;

  if (!coinId || !SUPPORTED_COINS.includes(coinId)) {
    res.status(400).json({ error: "Invalid or missing 'coinId' parameter" });
    return;
  }

  try {
    // Fetch coin data from MongoDB
    const coinData = await CryptoPrice.findOne({ coinId });

    if (!coinData) {
      res.status(404).json({ error: "Coin data not found" });
      return;
    }

    // Send the response with coin data
    res.json({
      price: coinData.priceUsd,
      marketCap: coinData.marketCapUsd,
      "24hChange": coinData.priceChange24h,
    });
  } catch (error) {
    console.error("Error fetching coin data from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch coin data" });
  }
};
