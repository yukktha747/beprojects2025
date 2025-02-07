import { Request, Response } from "express";
import { Client } from "../models/clients.schema";
import { MSSP } from "../models/mssp.schema";

export const getProfile = async (req: Request, res: Response) => {
  try {
    // console.log("hitt")
    const profile = await MSSP.findById(req.user._id);
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving profile" });
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    const msspId = req.user._id;
    const clients = await Client.find({ msspId });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving clients" });
  }
};

export const getClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.findById(req.params.id);
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving client" });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const msspId = req.user._id;

    const client = await Client.create({
      msspId,
      clientName: req.body.clientName,
      clientEmail: req.body.clientEmail,
      managerName: req.body.managerName,
      managerEmail: req.body.managerEmail,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
    });
    return res.status(201).json(client);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error creating client" });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: "Error updating client" });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: "Error deleting client" });
  }
};
