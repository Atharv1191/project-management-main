const prisma = require("../configs/prisma");

// add comment
const addComents = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { content, taskId } = req.body;

    if (!content || !taskId) {
      return res.status(400).json({
        message: "content and taskId are required",
      });
    }

    // find task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // find project and check membership
    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({
        message: "project not found",
      });
    }

    const member = project.members.find((member) => member.userId === userId);

    if (!member) {
      return res.status(403).json({
        message: "You are not member of this project",
      });
    }

    // ✅ Correct mapping here
    const comment = await prisma.comment.create({
      data: {
        taskId,      // correct taskId
        userId,      // from req.auth()
        content,     // actual comment text
      },
      include: {
        user: true,
      },
    });

    res.json({ comment });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// get comments for a task
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    res.json({ comments });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { addComents, getTaskComments };
