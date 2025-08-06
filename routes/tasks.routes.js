const express = require("express");
const taskRouter = express.Router(); 
const {
  createTask,
  getTasks,
  getTasksWithFilters,
  updateTask,
  deleteTask,
} = require("../controller/task.controller");


taskRouter.post("/create", createTask);                    
// taskRouter.post("/get", getTasks);                               
taskRouter.post("/get", getTasksWithFilters);                               
taskRouter.post("/update", updateTask);                      
taskRouter.post("/delete/:taskId", deleteTask);                   
module.exports = taskRouter;
