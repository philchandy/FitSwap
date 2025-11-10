import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

//get workouts with user id
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = req.app.locals.db;

    const workouts = await db
      .collection("workouts")
      .find({ userId: ObjectId.createFromHexString(userId) })
      .sort({ date: -1 })
      .toArray();

    res.json(workouts);
  } catch (error) {
    console.error("GET user workouts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//create new workout
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      type,
      date,
      duration,
      caloriesBurned,
      exercises,
      distance,
      notes,
    } = req.body;
    const db = req.app.locals.db;

    const newWorkout = {
      userId: ObjectId.createFromHexString(userId),
      type,
      date: new Date(date),
      duration,
      caloriesBurned,
      exercises: exercises || [],
      distance: distance || null,
      notes: notes || "",
      createdAt: new Date(),
    };

    const result = await db.collection("workouts").insertOne(newWorkout);

    res.status(201).json({
      message: "Workout logged!",
      workout: { ...newWorkout, _id: result.insertedId },
    });
  } catch (error) {
    console.error("POST workout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get workout with id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    const workout = await db
      .collection("workouts")
      .findOne({ _id: ObjectId.createFromHexString(id) });
    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.json(workout);
  } catch (error) {
    console.error("GET workout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//update workout with id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { type, date, duration, caloriesBurned, exercises, distance, notes } =
      req.body;
    const db = req.app.locals.db;

    const updateData = {
      type,
      date: new Date(date),
      duration,
      caloriesBurned,
      exercises: exercises || [],
      distance: distance || null,
      notes: notes || "",
      updatedAt: new Date(),
    };

    const result = await db
      .collection("workouts")
      .updateOne(
        { _id: ObjectId.createFromHexString(id) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.json({ message: "Workout updated!" });
  } catch (error) {
    console.error("PUT workout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//delete workout
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    const result = await db
      .collection("workouts")
      .deleteOne({ _id: ObjectId.createFromHexString(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.json({ message: "Workout deleted!" });
  } catch (error) {
    console.error("DELETE workout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
