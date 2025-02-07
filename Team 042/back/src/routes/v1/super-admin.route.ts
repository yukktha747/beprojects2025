import express from "express";

import { addMSSP } from "../../controllers/super-admin";

const router = express.Router();

router.route("/add-mssp").post(addMSSP);

export default router; 