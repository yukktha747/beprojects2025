import express from "express";
import Vulnerability from "../models/vulnerabilities";


export const getVulnerabilities = async (req: express.Request, res: express.Response) => {
  try {
    const projectId = req.params.id;
    const page = parseInt(req.query.page as string) || 1; 
    const limit = parseInt(req.query.limit as string) || 10; 

    const skip = (page - 1) * limit;

    console.log(projectId)

    const vulnerabilities = await Vulnerability.find({ projectId: projectId })
      .skip(skip)
      .limit(limit);
    
    const totalVulnerabilities = await Vulnerability.countDocuments({ projectId: projectId });

    return res.status(200).json({
      vulnerabilities: vulnerabilities, 
      total: totalVulnerabilities,
      currentPage: page,
      totalPages: Math.ceil(totalVulnerabilities / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "An error occured" });
  }
};

export const getVulnerability = async (req: express.Request, res: express.Response) => {
  try {
    const vulnerabilityId = req.params.id;

    const vulnerability = await Vulnerability.findById(vulnerabilityId);

    return res.status(200).json(vulnerability);
  } catch (error) {
    res.status(500).json({ message: "An error occured" });
  }
};

export const createVulnerability = async (req: express.Request, res: express.Response) => {
  try {
    const projectId = req.params.id;

    console.log(req.body.url)

    const vulnerability = new Vulnerability({
      template: req.body.template,
      projectId: projectId,
      issueTitle: req.body.issueTitle,
      description: req.body.description,
      impact: req.body.impact,
      proofOfConcept: req.body.proofOfConcept,
      recommendation: req.body.recommendation,
      url: req.body.url,
      severity: req.body.severity,
      cvss: req.body.cvss,
      tags: req.body.tags,
    });

    await vulnerability.save();

    return res.status(200).json(vulnerability);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "An error occured" });
  }
};

export const updateVulnerability = async (req: express.Request, res: express.Response) => {
  try {
    const data = req.body;
    const vulnerabilityId = req.params.id;
    const vulnerability = await Vulnerability.findByIdAndUpdate(vulnerabilityId, data);

    if (!vulnerability) {
      return res.status(404).json({ message: "Vulnerability not found" });
    }

    await vulnerability.save();

    return res.status(200).json(vulnerability);
  } catch (error) {
    res.status(500).json({ message: "An error occured" });
  }
};

export const deleteVulnerability = async (req: express.Request, res: express.Response) => {
  try {
    const vulnerabilityId = req.params.id;
    const vulnerability = await Vulnerability.findByIdAndDelete(vulnerabilityId);

    if (!vulnerability) {
      return res.status(404).json({ message: "Vulnerability not found" });
    }

    return res.status(200).json({ message: "Vulnerability deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "An error occured" });
  }
};  