const express = require("express");
const { createTask, updateTask, deleteTask } = require("../controllers/taskController");

const router = express.Router();

router.post('/',createTask);
router.put('/:id',updateTask);
router.post('/delete',deleteTask)

module.exports = router;