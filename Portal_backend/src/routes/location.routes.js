import express from "express";
import { getStates, getDistrictsByState, getMetadata } from "../controllers/location.controller.js";

export const locationRoutes = express.Router();

locationRoutes.get("/states", getStates);
locationRoutes.get("/districts/:state", getDistrictsByState);
locationRoutes.get("/metadata", getMetadata);