import { MSSP } from "../models/mssp.schema";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

export const loginMSSP = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    const msppClient = await MSSP.findOne({ msspEmail: email });
    if (!msppClient) {
      return res.status(404).json({ message: "MSSP not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      msppClient.password
    );

    console.log(msppClient, msppClient.password)
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    const accessToken = jwt.sign({email, role:msppClient.role, userId:msppClient._id}, process.env.ACCESS_JWT_SECRET, {
      expiresIn: '10d',
    });

    const refreshToken = jwt.sign({ email }, process.env.REFRESH_JWT_SECRET, {
      expiresIn: "30d",
    });
    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error logging in MSSP" });
  }
};
