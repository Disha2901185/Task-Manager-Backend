// const Project = require("../src/models/project.model");
const Task = require("../src/models/task.model");
// Converts IST date string to UTC Date
function convertISTToUTC(dateStr) {
  const istDate = new Date(dateStr);
  const offsetMs = 5.5 * 60 * 60 * 1000;
  return new Date(istDate.getTime() - offsetMs);
}

// Converts UTC date to IST Date object (for displaying)
function convertUTCToIST(date) {
  const offsetMs = 5.5 * 60 * 60 * 1000;
  return new Date(date.getTime() + offsetMs);
}

// Get start and end of current IST day, in UTC
function getISTDayRangeInUTC() {
  const nowUTC = new Date();
  const istNow = new Date(nowUTC.getTime() + 5.5 * 60 * 60 * 1000);

  const istStart = new Date(istNow);
  istStart.setHours(0, 0, 0, 0);

  const istEnd = new Date(istNow);
  istEnd.setHours(23, 59, 59, 999);

  const utcStart = new Date(istStart.getTime() - 5.5 * 60 * 60 * 1000);
  const utcEnd = new Date(istEnd.getTime() - 5.5 * 60 * 60 * 1000);

  return { utcStart, utcEnd };
}

const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, priority } = req.body;
console.log(req.body,"create task");

    const task = new Task({
      title,
      description,
      status,
      dueDate: dueDate ? convertISTToUTC(dueDate) : new Date(), // Stored as UTC
      priority,
      userId: req.user._id,
    });

    await task.save();
    res.status(201).json({ message: "Task created", task });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};


const getTasksWithFilters = async (req, res) => {
  try {
    const { status, dueToday, overdue } = req.body;
    const userId = req.user._id;

    const filter = { userId };

    if (status) filter.status = status;

    const { utcStart, utcEnd } = getISTDayRangeInUTC();

    if (dueToday) {
      filter.dueDate = { $gte: utcStart, $lte: utcEnd };
    }

    if (overdue) {
      filter.dueDate = { $lt: utcStart };
      // filter.status = "todo"; // or whatever is your "incomplete" status
    }

    const tasks = await Task.find(filter);

    const tasksWithIST = tasks.map(task => ({
      ...task.toObject(),
      dueDate: convertUTCToIST(task.dueDate)
    }));

    res.status(200).json({ message: "Tasks fetched successfully", tasks: tasksWithIST });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};






// Get all tasks for a project (with optional status filter)
// const getTasks = async (req, res) => {
//   try {
//     const { projectId } = req.body;
//     const { status } = req.query;

//     const query = { project: projectId };
//     if (status) query.status = status;

//     const tasks = await Task.find(query);
//     res.status(200).json(tasks);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// Update a task
const updateTask = async (req, res) => {
  console.log(req.body, "update task");
  
  try {
    const { _id, title, description, status, dueDate } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    // Ensure user is authenticated (assuming `req.user` is set via middleware)
    const userId = req.user._id;

    const updatedTask = await Task.findOneAndUpdate(
      { _id, userId },
      { title, description, status, dueDate },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.status(200).json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    console.log(req.params,"//////////");
    
    const { taskId } = req.params;

    const task = await Task.findOneAndDelete({ _id: taskId });

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  getTasksWithFilters
};

