import { Router } from "express";
import User from "../models/user.model.js";
import multer from "multer";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/profilepic/"));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });

router.get("/singin", (req, res) => {
  return res.render("signin");
});
router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

router.get("/signin", (req, res) => {
  if (req.cookies.token !== undefined) return res.redirect("/");
  return res.render("signin");
});

router.post("/signup", upload.single("profileImageUrl"), async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    await User.create({
      fullName,
      password,
      email,
      profileImageUrl: `/profilepic/${
        req?.file?.filename || "istockphoto-1393750072-612x612.jpg"
      }`,
    });
    return res.redirect("/user/signin");
  } catch (error) {
    console.log(error, "error");
    return res.render("signup", {
      error,
    });
  }
});
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userToken = await User.matchPasswordAndCreateToken(email, password);
    // console.log(userToken, "userToken");
    if (userToken !== false) {
      return res.cookie("token", userToken).redirect("/");
    } else {
      return res.render("signin", {
        error: "Try again! Invalid email/password",
      });
    }
  } catch (error) {
    return res.render("signin", {
      error: "Try again! Invalid email/password",
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/user/signin");
});
export default router;
