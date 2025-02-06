import { Request, Response } from "express";
import { MSSP } from "../models/mssp.schema";

export const addMSSP = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const msppClient = new MSSP({
    msspName: name,
    msspEmail: email,
    password,
  });
  try {
    const newClient = await msppClient.save();
    res.status(201).json(newClient);
  } catch (err) {
    res.status(500).json({ message: "Error adding client" });
  }
};
