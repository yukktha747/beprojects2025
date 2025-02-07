import mongoose from "mongoose";

//parms

const ProjectSchema = new mongoose.Schema({
  projectName:{
    type:String,
    required:true
  },
  clientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client",
    required:true
  },
  managerName:{
    type:String,
    required:true
  },
  status:{
    type:String,
    required:true
  },
  type:{
    type:String,    
  },
  startDate:{
    type:Date,
    required:true
  },
  endDate:{
    type:Date,  
    required:true
  },
});
//
export default mongoose.model("Project", ProjectSchema); 