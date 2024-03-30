import express from "express";
import path from "path";
import dotenv from "dotenv/config";
import userRoute from "./routes/user.router.js";
import blogRoute from "./routes/blog.router.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { checkAuthCookie } from "./middlewares/auth.js";
const app = express();
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("mongodb connected...");
  })
  .catch((err) => {
    console.log(err, "Cannot connect to mongodb");
  });
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkAuthCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});
app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => {
  console.log(`App is listening on PORT:${PORT}...`);
});
