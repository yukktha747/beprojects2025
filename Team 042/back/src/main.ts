import express from "express";
import * as dotenv from "dotenv";
import { Client } from "@notionhq/client";
import cors from "cors";
import router from "./routes/index";
import { ObjectId } from "mongodb";
import connectDB from "./config/db";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);
app.use(router);
//@ts-ignore
app.use(errorHandler);
connectDB();

const PORT = process.env.PORT || 3000;

declare global {
  namespace Express {
    interface Request {
      user: {
        _id: ObjectId;
        role: string;
      };
    }
  }
}

app.listen(PORT, () => {
  console.log("The server is working at 3000");
});
