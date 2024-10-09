import express, { Router } from "express";
import { getCryptoStats } from "../controllers/stats.controller";
import { getPriceDeviation } from "../controllers/deviation.controller";

const router: Router = express.Router();

// Define the /stats route, handled by getCryptoStats controller
router.get("/stats", getCryptoStats);
router.get("/deviation", getPriceDeviation);

export default router;
