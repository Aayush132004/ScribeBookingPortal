import express from "express";
import {userMiddleware} from "../middleware/user.middleware.js"
import { getStudentProfile,createExamRequest,loadScribes,getRequests,sendRequestToScribes,submitFeedback,deleteStudentAccount,cancelExamRequest,updateStudentProfile } from "../controllers/student.controller.js";


export const studentRoutes=express.Router();      


//getting profile
studentRoutes.get("/profile",userMiddleware,getStudentProfile)
studentRoutes.put("/profile",userMiddleware,updateStudentProfile)
studentRoutes.delete("/profile",userMiddleware,deleteStudentAccount)

//creating exam_request on creation will get all available scribes for that day/time
studentRoutes.post("/createRequest",userMiddleware,createExamRequest)
studentRoutes.get("/load-scribes",userMiddleware,loadScribes)// for pagination

//fetch requests
//based on frontend i/p it will give 10 recent requests from frontend passs type of request(completed,pending,timedout)
studentRoutes.get("/get-requests",userMiddleware,getRequests)
studentRoutes.post("/cancel-request",userMiddleware,cancelExamRequest)

//sending request to a scribe (can send to multiple scribes)
studentRoutes.post("/send-request",userMiddleware,sendRequestToScribes)

//sending feedback to some scribe
studentRoutes.post("/feedback",userMiddleware,submitFeedback)



