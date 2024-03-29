import { Router } from "express";
import Blog from "../models/blog.model.js";
import multer from "multer";
import path from "path";
import Comment from "../models/comment.model.js";

const router = Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads/"));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });

router.get("/addnew", (req, res) => {
  return res.render("blog", { user: req.user });
});

router.post("/", upload.single("blogPhotoUrl"), async (req, res) => {
  const { title, content } = req.body;
  const blog = await Blog.create({
    title,
    content,
    blogPhotoUrl: `/uploads/${req.file.filename}`,
    createdBy: req.user.id,
  });

  return res.redirect("/blog/allblogs");
});

router.get("/allblogs", async (req, res) => {
  const allBlogs = await Blog.find({});
  return res.render("allBlogs", { allBlogs, user: req.user });
});
router.get("/myblogs", async (req, res) => {
  const myBlogs = await Blog.find({ createdBy: req.user.id });
  return res.render("myBlogs", { myBlogs, user: req.user });
});

router.get("/allblogs/:blogId", async (req, res) => {
  const id = req.params.blogId;
  const blogWithId = await Blog.findById(id).populate("createdBy");
  const commentWithId = await Comment.find({ blogId: id }).populate("postedBy");
  return res.render("blogFull", { user: req.user, blogWithId, commentWithId });
});

router.post("/comment/:blogId", async (req, res) => {
  const { commentBody } = req.body;
  const comment = await Comment.create({
    comment: commentBody,
    blogId: req.params.blogId,
    postedBy: req.user.id,
  });
  return res.redirect(`/blog/allblogs/${req.params.blogId}`);
});
export default router;
