import express from "express";
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getProfile,
} from "../../controllers/client";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../../controllers/projects";
import {
  getVulnerabilities,
  getVulnerability,
  createVulnerability,
  updateVulnerability,
  deleteVulnerability,
} from "../../controllers/vulnerabilities";
import { verifyJWT } from "../../middlewares/auth.middlewares";
import { loginMSSP } from "../../controllers/mssp";

const router = express.Router();

//Auth
router.route("/login").post(loginMSSP);

//Clients
router.route("/get-clients").get(verifyJWT,getClients);
router.route("/get-client/:id").get(verifyJWT,getClient);
router.route("/update-client/:id").put(verifyJWT,updateClient);
router.route("/delete-client/:id").delete(verifyJWT,deleteClient);
router.route("/create-client").post(verifyJWT,createClient);

//Projects
router.route("/get-projects/:id").get(verifyJWT,getProjects);
router.route("/get-project/:id").get(verifyJWT,getProject);
router.route("/update-project/:id").put(verifyJWT,updateProject);
router.route("/delete-project/:id").delete(verifyJWT,deleteProject);
router.route("/create-project/:id").post(verifyJWT,createProject);

//Vulnerabilities
router.route("/get-vulnerabilities/:id").get(verifyJWT,getVulnerabilities);
router.route("/get-vulnerability/:id").get(getVulnerability);
router.route("/update-vulnerability/:id").put(verifyJWT,updateVulnerability);
router.route("/delete-vulnerability/:id").delete(verifyJWT,deleteVulnerability);
router.route("/create-vulnerability/:id").post(verifyJWT,createVulnerability);

//ValidateToken
router.route("/auth/validate-token").post(verifyJWT, (req, res) => {
  res.status(200).json({ message: "Token is valid", isValid: true });
});
router.route("/profile").get(verifyJWT,getProfile);

export default router;
