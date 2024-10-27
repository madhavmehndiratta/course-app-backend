const { Router } = require("express");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { AdminModel, CourseModel } = require("../db");
const { adminMiddleware } = require("../middlewares/admin");
const { JWT_ADMIN_SECRET } = require("../config");

const adminRouter = Router();

adminRouter.post("/signup", async function (req, res) {
  const requiredBody = z.object({
    email: z.string().min(3).max(50).email(),
    password: z.string().min(5).max(50),
    firstName: z.string().min(3).max(20),
    lastName: z.string().min(3).max(50),
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

    await AdminModel.create({
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

adminRouter.post("/signin", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const response = await AdminModel.findOne({
      email: email,
    });

    const matchedPassword = await bcrypt.compare(password, response.password);
    if (matchedPassword) {
      const token = jwt.sign({ id: response._id.toString() }, JWT_ADMIN_SECRET);
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

adminRouter.post("/course", adminMiddleware, async function (req, res) {
  const adminId = req.userId;
  const { title, description, price, imageUrl } = req.body;

  try {
    const course = await CourseModel.create({
      title,
      description,
      price,
      imageUrl,
      creatorId: adminId,
    });

    res.json({ message: "course created successfully", course_id: course._id });
  } catch {
    res.json({ error: "error writing to the database" });
  }
});

adminRouter.put("/course", adminMiddleware, async function (req, res) {
  const adminId = req.userId;
  const { title, description, price, imageUrl, courseId } = req.body;
  try {
    var response = await CourseModel.updateOne(
      {
        _id: courseId,
        creatorId: adminId,
      },
      {
        title,
        description,
        price,
        imageUrl,
      },
    );
  } catch {
    res.json({ error: "error writing to the db" });
    return;
  }

  if (!response) {
    res.json({ error: "cannot find the course with given id" });
    return;
  }

  res.json({ message: "course updated successfully", response });
});

adminRouter.get("/course/bulk", adminMiddleware, async function (req, res) {
  const adminId = req.userId;
  const courses = await CourseModel.find({
    creatorId: adminId,
  });

  res.json({
    courses,
  });
});

module.exports = {
  adminRouter: adminRouter,
};
