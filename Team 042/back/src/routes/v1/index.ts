import express from "express";
import clientRoute from "./clients.route";
import superAdminRoute from "./super-admin.route";

const router = express.Router();

router.use("/client", clientRoute);
router.use("/super-admin", superAdminRoute);

export default router;
