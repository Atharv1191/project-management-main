const prisma = require("../configs/prisma");


/* ==================== CREATE PROJECT ==================== */

const createProject = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      workspaceId,
      description,
      name,
      status,
      start_date,
      end_date,
      team_members,
      team_lead,
      progress,
      priority,
    } = req.body;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { include: { user: true } } },
    });

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    if (!workspace.members.some((m) => m.userId === userId && m.role === "ADMIN"))
      return res.status(403).json({ message: "You don't have permission" });

    const teamLeadUser = await prisma.user.findUnique({
      where: { email: team_lead },
      select: { id: true },
    });

    const project = await prisma.project.create({
      data: {
        workspaceId,
        name,
        description,
        status,
        priority,
        progress,
        team_lead: teamLeadUser?.id || userId,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      },
    });

    // Add members
    if (Array.isArray(team_members) && team_members.length > 0) {
      const membersToAdd = workspace.members
        .filter((m) => team_members.includes(m.user.email))
        .map((m) => m.user.id);

      if (membersToAdd.length > 0) {
        await prisma.projectMember.createMany({
          data: membersToAdd.map((userId) => ({
            userId,
            projectId: project.id,
          })),
        });
      }
    }

    const projectWithMembers = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        members: { include: { user: true } },
        tasks: { include: { assignee: true, comments: { include: { user: true } } } },
        owner: true,
      },
    });

    res.json({ project: projectWithMembers, message: "Project created successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


/* ==================== UPDATE PROJECT ==================== */

const updateProject = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      workspaceId,
      id,
      description,
      name,
      status,
      start_date,
      end_date,
      progress,
      priority,
    } = req.body;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const isAdmin = workspace.members.some(
      (m) => m.userId === userId && m.role === "ADMIN"
    );

    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!isAdmin && project.team_lead !== userId)
      return res.status(403).json({ message: "No permission to update project" });

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        status,
        priority,
        progress,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      },
    });

    res.json({ project: updatedProject, message: "Project updated successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


/* ==================== ADD MEMBER TO PROJECT ==================== */

const addMember = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { projectId } = req.params;
    const { email } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.team_lead !== userId)
      return res.status(403).json({ message: "Only team lead can add members" });

    const existingMember = project.members.find((m) => m.user.email === email);
    if (existingMember) return res.status(400).json({ message: "Already a member" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const member = await prisma.projectMember.create({
      data: { userId: user.id, projectId },
    });

    res.json({ member, message: "Member added successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = { createProject, updateProject, addMember };
