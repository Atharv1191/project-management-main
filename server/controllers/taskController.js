const prisma = require("../configs/prisma");
const { inngest } = require("../inngest");

//create a task
const createTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { projectId,type, title, description, status, priority, assigneeId, due_date } = req.body;

    const origin = req.get("origin");

    // check if user has admin role in project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res.status(403).json({ message: "You don't have admin privileges for this project" });
    } else if (assigneeId && !project.members.find((m) => m.user.id === assigneeId)) {
      return res.status(403).json({ message: "Assignee is not a member of the project/workspace" });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        priority,
        assigneeId,
        status,
        type,
        due_date: new Date(due_date),
      },
    });

    const taskWithAssignee = await prisma.task.findUnique({
      where: { id: task.id },
      include: { assignee: true },
    });

    await inngest.send({
      name: "app/task.assigned",
      data: { taskId: task.id, origin },
    });

    return res.json({
      task: taskWithAssignee,
      message: "Task created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

//update a task
const updateTask = async (req, res) => {
  try {
    const tasks = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!tasks) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { userId } = await req.auth();

    const project = await prisma.project.findUnique({
      where: { id: tasks.projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res.status(403).json({ message: "You don't have admin privileges for this project" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.json({ task: updatedTask, message: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

//delete task
const deleteTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { taskIds } = req.body;

    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
    });

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await prisma.project.findUnique({
      where: { id: tasks[0].projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res.status(403).json({ message: "You don't have admin privileges for this project" });
    }

    await prisma.task.deleteMany({
      where: { id: { in: taskIds } },
    });

    return res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, updateTask, deleteTask };
