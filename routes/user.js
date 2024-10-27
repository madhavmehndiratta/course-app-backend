const { Router } = require("express");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { UserModel, PurchaseModel, CourseModel } = require("../db");
const { userMiddleware } = require("../middlewares/user");
const { JWT_USER_SECRET } = require("../config");

const userRouter = Router();

userRouter.post("/signup", async function (req, res) {
  const requiredBody = z.object({
    email: z.string().min(3).max(50).email(),
    password: z.string().min(5).max(50),
    firstName: z.string().min(3).max(20),
    lastName: z.string().min(3).max(20),
  });

  const validateBody = requiredBody.safeParse(req.body);
  if (!validateBody.success) {
    res.json({
      error: validateBody.error.issues.map((err) => err.message),
    });
    return;
  }

  const { email, password, firstName, lastName } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 5);

    await UserModel.create({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });
  } catch (err) {
    console.log(err);
    res.json({ error: "user already exists" });
    return;
  }

  res.json({ success: "user created successfully" });
});

userRouter.post("/signin", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const response = await UserModel.findOne({
      email: email,
    });

    const matchedPassword = await bcrypt.compare(password, response.password);
    if (matchedPassword) {
      const token = jwt.sign({ id: response._id.toString() }, JWT_USER_SECRET);
      res.json({ token: token });
    } else {
      res.status(403).json({ error: "invalid username or password" });
    }
  } catch (err) {
    console.log(err);
    res.status(403).json({ error: "invalid username or password" });
    return;
  }
});

userRouter.get("/purchases", userMiddleware, async function (req, res) {
  const userId = req.userId;

  try {
    const response = await PurchaseModel.find({
      userId: userId,
    });

    const coursesIds = response.map((u) => u.courseId);
    const courseDetails = await CourseModel.find({
      _id: { $in: coursesIds },
    });

    res.json({
      courses: courseDetails,
    });
  } catch (err) {
    console.log(err);
    res.json({ error: "error in fetching courses for current user" });
  }
});

module.exports = {
  userRouter: userRouter,
};
