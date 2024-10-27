const { Router } = require("express");
const courseRouter = Router();
const { CourseModel, PurchaseModel } = require("../db");
const { userMiddleware } = require("../middlewares/user");

courseRouter.post("/purchase", userMiddleware, async function (req, res) {
  const userId = req.userId;
  const courseId = req.body.courseId;

  const response = await PurchaseModel.create({
    userId,
    courseId,
  });

  res.json({
    message: "course purchased successfully",
    purchase_id: response._id,
  });
});

courseRouter.get("/preview", async function (req, res) {
  const courses = await CourseModel.find({});

  res.json({ courses });
});

module.exports = {
  courseRouter: courseRouter,
};
