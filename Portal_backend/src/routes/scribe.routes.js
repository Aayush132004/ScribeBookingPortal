import express from "express";
import { userMiddleware } from "../middleware/user.middleware.js";
import { acceptExamRequest, getScribeProfile, loadStudents, loadUnavailability, setUnavailability } from "../controllers/scribe.controller.js";


export const scribeRoutes = express.Router();

scribeRoutes.get("/profile",userMiddleware,getScribeProfile)

scribeRoutes.post("/acceptRequest",userMiddleware,acceptExamRequest)

scribeRoutes.get("/get-request",userMiddleware,loadStudents)

scribeRoutes.get("/get-unavailability",userMiddleware,loadUnavailability);

scribeRoutes.post("/set-unavailability",userMiddleware,setUnavailability)



