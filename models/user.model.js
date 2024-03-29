import mongoose from "mongoose";
import { createHmac, randomBytes } from "crypto";
import { createToken } from "../services/authentication.js";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      default: "/images/istockphoto-1393750072-612x612.jpg",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);
UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return;
  const salt = randomBytes(16).toString();
  const hashedpassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");
  this.salt = salt;
  this.password = hashedpassword;
  next();
});
UserSchema.static(
  "matchPasswordAndCreateToken",
  async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) return false;
    const salt = user.salt;
    const hashedPassword = String(user.password);
    const userProvidedHash = createHmac("sha256", salt)
      .update(password)
      .digest("hex");
    if (hashedPassword !== userProvidedHash) {
      throw new Error("Incorrect Email/password");
    }
    const token = createToken(user);
    return token;
  }
);

const User = mongoose.model("user", UserSchema);

export default User;
