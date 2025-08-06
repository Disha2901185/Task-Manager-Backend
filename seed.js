const bcrypt = require("bcrypt");

const { User } = require("./src/models/user");
const Project = require("./src/models/project.model");
const Task = require("./src/models/task.model");
const connectDB = require("./src/config/database");

const seed = async () => {
  try {
    await connectDB();
    console.log("Database Connection Established.......");

    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    const hashedPassword = await bcrypt.hash("Disha@123", 10);
    const user = new User({
      username: "Disha Kansal",
      emailId: "dishakansal2410@gmail.com",
      password: hashedPassword,
    });
    await user.save();
    console.log("User created");

    const projectsData = [
      {
        title: "Project Alpha",
        description: "This is Project Alpha",
        status: "active",
      },
      {
        title: "Project Beta",
        description: "This is Project Beta",
        status: "completed",
      },
    ];

    for (const proj of projectsData) {
      const project = new Project({ ...proj, user: user._id });
      await project.save();

      const tasks = [
        { title: "Task 1", status: "todo" },
        { title: "Task 2", status: "in-progress" },
        { title: "Task 3", status: "done" },
      ];

      for (const task of tasks) {
        const taskDoc = new Task({
          ...task,
          project: project._id,
        });
        await taskDoc.save();
      }

      console.log(`Project "${project.title}" with 3 tasks created`);
    }

    console.log("Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();
