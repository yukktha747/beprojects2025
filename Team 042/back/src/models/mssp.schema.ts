import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MSSPSchema = new mongoose.Schema({
  msspName: {
    type: String,
    required: true,
  },
  msspEmail: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role:{
    type:String,
    default:"MSSP"
  }
});

MSSPSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err: NativeError, salt: any) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err: NativeError, hash: string) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

export const MSSP = mongoose.model("MSSP", MSSPSchema);
