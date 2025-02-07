import express from "express";
import Project from "../models/projects";


export const getProjects = async (req: express.Request, res: express.Response) => {
  try {
    const clientId = req.params.id;
    const page = parseInt(req.query.page as string) || 1; // Default to page 1
    const limit = parseInt(req.query.limit as string) || 10; // Default to 10 records per page

    const skip = (page - 1) * limit;

    const projects = await Project.find({ clientId: clientId })
      .skip(skip)
      .limit(limit);

    const totalProjects = await Project.countDocuments({ clientId: clientId });

    return res.status(200).json({
      projects: projects, 
      total: totalProjects,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred" });
  }
};

export const getProject = async (req: express.Request, res: express.Response) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId);

    return res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "An error occured" });
  }
};

export const createProject = async (req: express.Request, res: express.Response) => {
  try {

    const clientId = req.params.id;

    const startDate = new Date(req.body.startDate).toISOString().split("T")[0]; // Removes time
    const endDate = new Date(req.body.endDate).toISOString().split("T")[0];     // Removes time

    console.log(startDate, endDate);


    const project = new Project({
      projectName: req.body.projectName,
      clientId: clientId,
      managerName: req.body.managerName,
      status: req.body.status, 
      type: req.body.type,
      startDate,
      endDate
    });

    await project.save();
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "An error occured" });
  }
};

export const updateProject = async (req: express.Request, res: express.Response) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.projectName = req.body.name;
    project.clientId = req.body.clientId;
    project.managerName = req.body.managerName;
    project.status = req.body.status;
    project.type = req.body.type;
    project.startDate = req.body.startDate;
    project.endDate = req.body.endDate;

    await project.save();

    return res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "An error occured" });
  }
};

export const deleteProject = async (req: express.Request, res: express.Response) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "An error occured" });
  }
};