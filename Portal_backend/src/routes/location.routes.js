import express from "express";
import { getStates, getDistrictsByState, getMetadata, getAllDistricts } from "../controllers/location.controller.js";

export const locationRoutes = express.Router();

locationRoutes.get("/states", getStates);
locationRoutes.get("/districts/:state", getDistrictsByState);
locationRoutes.get("/all-districts", getAllDistricts);
locationRoutes.get("/metadata", getMetadata);