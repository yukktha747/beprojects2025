import mongoose from "mongoose";

const VulnerabilitySchema = new mongoose.Schema({
  template:{
    type:String,
    required:true
  },
  projectId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Project",
    required:true
  },
  issueTitle:{
    type:String,
  },
  description:{
    type:String, 
  },
  impact:{
    type:String,
  }, 
  proofOfConcept:{//multiple image and description
    type:String,
  },
  recommendation:{
    type:String,
  },
  url:{
    type:[String],
  },
  severity:{
    type:String,
    required:true
  },
  cvss:{
    type:String,
  },
  tags:{
    type:String,
  },
  } 
);

export default mongoose.model("Vulnerability", VulnerabilitySchema);