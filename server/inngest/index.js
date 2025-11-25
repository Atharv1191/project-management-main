// const { Inngest } = require("inngest");
// const prisma = require("../configs/prisma");
// const { assign } = require("nodemailer/lib/shared");
// const sendEmail = require("../configs/nodemailer");

// // Create a client to send and receive events
// const inngest = new Inngest({ id: "project-management" });

// // Inngest: Save user to DB
// const syncUserCreation = inngest.createFunction(
//   { id: "sync-user-from-clerk" },
//   { event: "clerk/user.created" },
//   async ({ event }) => {
//     const { data } = event;
//     await prisma.user.create({
//       data: {
//         id: data.id,
//         email: data.email_addresses[0]?.email_address,
//         name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
//         image: data?.image_url,
//       },
//     });
//   }
// );

// // Inngest: Delete user
// const syncUserDeletion = inngest.createFunction(
//   { id: "delete-user-with-clerk" },
//   { event: "clerk/user.deleted" },
//   async ({ event }) => {
//     const { data } = event;
//     await prisma.user.delete({
//       where: { id: data.id },
//     });
//   }
// );

// // Inngest: Update user
// const syncUserUpdation = inngest.createFunction(
//   { id: "update-user-from-clerk" },
//   { event: "clerk/user.updated" },
//   async ({ event }) => {
//     const { data } = event;
//     await prisma.user.update({
//       where: { id: data.id },
//       data: {
//         email: data.email_addresses[0]?.email_address,
//         name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
//         image: data?.image_url,
//       },
//     });
//   }
// );

// // Inngest: Create workspace
// const syncWorkspaceCreation = inngest.createFunction(
//   { id: "sync-workspace-from-clerk" },
//   { event: "clerk/organization.created" },
//   async ({ event }) => {
//     const { data } = event;

//     await prisma.workspace.create({
//       data: {
//         id: data.id,
//         name: data.name,
//         slug: data.slug,
//         ownerId: data.created_by,   // ✅ FIXED
//         image_url: data.image_url || "",
//       },
//     });

//     // Add creator as ADMIN
//     await prisma.workspaceMember.create({
//       data: {
//         userId: data.created_by,
//         workspaceId: data.id,
//         role: "ADMIN",
//       },
//     });
//   }
// );


// // Inngest: Update workspace
// const syncWorkspaceUpdation = inngest.createFunction(
//   { id: "update-workspace-from-clerk" },
//   { event: "clerk/organization.updated" },
//   async ({ event }) => {
//     const { data } = event;
//     await prisma.workspace.update({
//       where: { id: data.id },
//       data: {
//         name: data.name,
//         slug: data.slug,
//         image_url: data.image_url,
//       },
//     });
//   }
// );

// // Inngest: Delete workspace
// const syncWorkspaceDeletion = inngest.createFunction(
//   { id: "delete-workspace-with-clerk" },
//   { event: "clerk/organization.deleted" },
//   async ({ event }) => {
//     const { data } = event;
//     await prisma.workspace.delete({
//       where: { id: data.id },
//     });
//   }
// );

// // Inngest: Add workspace member when membership is created
// const syncWorkspaceMemberCreation = inngest.createFunction(
//   { id: "sync-workspace-member-from-clerk" },
//   { event: "clerk/organizationMembership.created" },
//   async ({ event }) => {
//     const { data } = event;
//     await prisma.workspaceMember.create({
//       data: {
//         userId: data.public_user_data.user_id,
//         workspaceId: data.organization_id,
//         role: String(data.role).toUpperCase(),
//       },
//     });
//   }
// );
// //Inngest function to send email on Task Creation

// const sendTaskAssignmentEmail = inngest.createFunction(
//   { id: "send-task-assignment-mail" },
//   { event: "app/task.assigned" },
//   async ({ event, step }) => {
//     const { taskId, origin } = event.data;
//     const task = await prisma.task.findUnique({
//       where: { id: taskId },
//       include: { assignee: true, project: true }
//     })
//     await sendEmail({
//       to: task.assignee.email,
//       subject: `New task Assignment in ${task.project.name} `,
//       body: `
//   <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
//     <h2>Hi ${task.assignee.name}, 👋</h2>

//     <p style="font-size: 16px;">You've been assigned a new task:</p>

//     <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">
//       ${task.title}
//     </p>

//     <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 8px; margin-bottom: 30px;">

//       <p style="margin: 6px 0;">
//         <strong>Description:</strong> ${task.description}
//       </p>

//       <p style="margin: 6px 0;">
//         <strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}
//       </p>

//     </div>

//     <a href="${origin}" 
//        style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; 
//        font-size: 16px; text-decoration: none;">
//       View Task
//     </a>

//     <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
//       Please make sure to review and complete it before the due date.
//     </p>
//   </div>
// `

//     })
//     if (new Date(task.due_date).toLocaleDateString() !== new Date().toDateString()) {
//       await step.sleepUntil('wait-for-the-due-date', new Date(task.due_date));
//       await step.run('check-if-task-is-completed', async () => {
//         const task = await prisma.task.findUnique({
//           where: { id: taskId },
//           include: { assignee: true, project: true }
//         })
//         if (!task) {
//           if (task.status !== "DONE") {
//             await step.run('send-task-reminder-mail', async () => {
//               await sendEmail({
//                 to: task.assignee.email,
//                 sunject: `reminder for ${task.project.name}`,
//                 body: `
//   <div style="max-width: 600px;">

//     <h2>Hi ${task.assignee.name}, 👋</h2>

//     <p style="font-size: 16px;">You have a task due in ${task.project.name}:</p>

//     <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">
//       ${task.title}
//     </p>

//     <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 8px; margin-bottom: 30px;">

//       <p style="margin: 6px 0;">
//         <strong>Description:</strong> ${task.description}
//       </p>

//       <p style="margin: 6px 0;">
//         <strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}
//       </p>

//     </div>

//     <a href="${origin}"
//        style="background-color: #007bff; padding: 12px 24px; border-radius: 5px;
//        color: #fff; font-weight: 600; font-size: 16px; text-decoration: none;">
//       View Task
//     </a>

//     <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
//       Please make sure to review and complete it before the due date.
//     </p>

//   </div>
// `

//               })
//             })
//           }
//         }
//       })
//     }
//   }
// )


// // EXPORT FUNCTIONS
// const functions = [
//   syncUserCreation,
//   syncUserDeletion,
//   syncUserUpdation,
//   syncWorkspaceCreation,
//   syncWorkspaceUpdation,
//   syncWorkspaceDeletion,
//   syncWorkspaceMemberCreation,
//   sendTaskAssignmentEmail
// ];

// module.exports = {
//   inngest,
//   functions,
// };
const { Inngest } = require("inngest");
const prisma = require("../configs/prisma");
const sendEmail = require("../configs/nodemailer");

// Create a client to send and receive events
const inngest = new Inngest({ id: "project-management" });

// Inngest: Save user to DB
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event;
    
    try {
      // ✅ Check if user already exists (from pre-invitation)
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email_addresses[0]?.email_address }
      });

      if (existingUser) {
        // If user exists with different ID, update it
        if (existingUser.id !== data.id) {
          // This shouldn't normally happen, but handle it
          console.log('User exists with different ID, updating...');
          await prisma.user.update({
            where: { email: data.email_addresses[0]?.email_address },
            data: {
              name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim() || existingUser.name,
              image: data?.image_url || existingUser.image,
            }
          });
        }
      } else {
        // Create new user with Clerk ID
        await prisma.user.create({
          data: {
            id: data.id, // ✅ Use Clerk ID directly
            email: data.email_addresses[0]?.email_address,
            name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
            image: data?.image_url || "",
          },
        });
        console.log('✅ Created new user:', data.id);
      }
    } catch (error) {
      console.error('Error syncing user creation:', error);
      throw error;
    }
  }
);

// Inngest: Delete user
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.delete({
      where: { id: data.id },
    });
  }
);

// Inngest: Update user
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email_addresses[0]?.email_address,
        name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
        image: data?.image_url,
      },
    });
  }
);

// Inngest: Create workspace
const syncWorkspaceCreation = inngest.createFunction(
  { id: "sync-workspace-from-clerk" },
  { event: "clerk/organization.created" },
  async ({ event }) => {
    const { data } = event;

    try {
      await prisma.workspace.create({
        data: {
          id: data.id, // ✅ Use Clerk org ID directly
          name: data.name,
          slug: data.slug,
          ownerId: data.created_by,
          image_url: data.image_url || "",
        },
      });

      // Add creator as ADMIN
      await prisma.workspaceMember.create({
        data: {
          userId: data.created_by,
          workspaceId: data.id,
          role: "ADMIN",
        },
      });
      
      console.log('✅ Created workspace:', data.id);
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  }
);

// Inngest: Update workspace
const syncWorkspaceUpdation = inngest.createFunction(
  { id: "update-workspace-from-clerk" },
  { event: "clerk/organization.updated" },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        image_url: data.image_url,
      },
    });
  }
);

// Inngest: Delete workspace
const syncWorkspaceDeletion = inngest.createFunction(
  { id: "delete-workspace-with-clerk" },
  { event: "clerk/organization.deleted" },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.delete({
      where: { id: data.id },
    });
  }
);

// Inngest: Add workspace member when membership is created
const syncWorkspaceMemberCreation = inngest.createFunction(
  { id: "sync-workspace-member-from-clerk" },
  { event: "clerk/organizationMembership.created" },
  async ({ event }) => {
    const { data } = event;
    
    try {
      console.log('📧 Processing membership creation:', {
        userId: data.public_user_data.user_id,
        orgId: data.organization.id,
        role: data.role,
        email: data.public_user_data.identifier
      });

      // ✅ Check if workspace exists
      const workspace = await prisma.workspace.findUnique({
        where: { id: data.organization.id }
      });

      if (!workspace) {
        console.error('❌ Workspace not found:', data.organization.id);
        throw new Error('Workspace not found');
      }

      // ✅ Check if user exists in database
      let user = await prisma.user.findUnique({
        where: { id: data.public_user_data.user_id }
      });

      if (!user) {
        console.log('⚠️ User not found in database, creating placeholder...');
        // Create user if they don't exist yet (shouldn't happen normally)
        user = await prisma.user.create({
          data: {
            id: data.public_user_data.user_id,
            email: data.public_user_data.identifier,
            name: `${data.public_user_data.first_name || ''} ${data.public_user_data.last_name || ''}`.trim() || data.public_user_data.identifier.split('@')[0],
            image: data.public_user_data.image_url || "",
          }
        });
        console.log('✅ Created user:', user.id);
      }

      // ✅ Check if already a workspace member
      const existingMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId: workspace.id
          }
        }
      });

      if (existingMember) {
        console.log('⚠️ User already a workspace member');
        return;
      }

      // ✅ Map Clerk role to your database role
      const workspaceRole = data.role === "org:admin" ? "ADMIN" : "MEMBER";

      // ✅ Add user to workspace
      const member = await prisma.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: workspaceRole,
        },
      });

      console.log('✅ Successfully added member to workspace:', member.id);
    } catch (error) {
      console.error('❌ Error syncing workspace member:', error);
      throw error;
    }
  }
);

// Inngest: Remove workspace member when membership is deleted
const syncWorkspaceMemberDeletion = inngest.createFunction(
  { id: "sync-workspace-member-deletion" },
  { event: "clerk/organizationMembership.deleted" },
  async ({ event }) => {
    const { data } = event;
    
    try {
      await prisma.workspaceMember.deleteMany({
        where: {
          userId: data.public_user_data.user_id,
          workspaceId: data.organization.id
        }
      });
      console.log('✅ Removed member from workspace');
    } catch (error) {
      console.error('Error removing workspace member:', error);
      throw error;
    }
  }
);

// Inngest: Update workspace member role
const syncWorkspaceMemberUpdate = inngest.createFunction(
  { id: "sync-workspace-member-update" },
  { event: "clerk/organizationMembership.updated" },
  async ({ event }) => {
    const { data } = event;
    
    try {
      const workspaceRole = data.role === "org:admin" ? "ADMIN" : "MEMBER";
      
      await prisma.workspaceMember.updateMany({
        where: {
          userId: data.public_user_data.user_id,
          workspaceId: data.organization.id
        },
        data: {
          role: workspaceRole
        }
      });
      console.log('✅ Updated member role');
    } catch (error) {
      console.error('Error updating workspace member:', error);
      throw error;
    }
  }
);

// Inngest function to send email on Task Creation
const sendTaskAssignmentEmail = inngest.createFunction(
  { id: "send-task-assignment-mail" },
  { event: "app/task.assigned" },
  async ({ event, step }) => {
    const { taskId, origin } = event.data;
    
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true, project: true }
    });

    if (!task || !task.assignee) {
      console.error('Task or assignee not found');
      return;
    }

    await sendEmail({
      to: task.assignee.email,
      subject: `New task Assignment in ${task.project.name}`,
      body: `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
    <h2>Hi ${task.assignee.name}, 👋</h2>

    <p style="font-size: 16px;">You've been assigned a new task:</p>

    <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">
      ${task.title}
    </p>

    <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 8px; margin-bottom: 30px;">
      <p style="margin: 6px 0;">
        <strong>Description:</strong> ${task.description}
      </p>
      <p style="margin: 6px 0;">
        <strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}
      </p>
    </div>

    <a href="${origin}" 
       style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; 
       font-size: 16px; text-decoration: none;">
      View Task
    </a>

    <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
      Please make sure to review and complete it before the due date.
    </p>
  </div>
`
    });

    // Only set reminder if due date is in the future
    if (new Date(task.due_date).getTime() > new Date().getTime()) {
      await step.sleepUntil('wait-for-the-due-date', new Date(task.due_date));
      
      await step.run('check-if-task-is-completed', async () => {
        const updatedTask = await prisma.task.findUnique({
          where: { id: taskId },
          include: { assignee: true, project: true }
        });

        if (updatedTask && updatedTask.status !== "DONE") {
          await sendEmail({
            to: updatedTask.assignee.email,
            subject: `Reminder for ${updatedTask.project.name}`,
            body: `
  <div style="max-width: 600px;">
    <h2>Hi ${updatedTask.assignee.name}, 👋</h2>
    <p style="font-size: 16px;">You have a task due in ${updatedTask.project.name}:</p>
    <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">
      ${updatedTask.title}
    </p>
    <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 8px; margin-bottom: 30px;">
      <p style="margin: 6px 0;">
        <strong>Description:</strong> ${updatedTask.description}
      </p>
      <p style="margin: 6px 0;">
        <strong>Due Date:</strong> ${new Date(updatedTask.due_date).toLocaleDateString()}
      </p>
    </div>
    <a href="${origin}"
       style="background-color: #007bff; padding: 12px 24px; border-radius: 5px;
       color: #fff; font-weight: 600; font-size: 16px; text-decoration: none;">
      View Task
    </a>
    <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
      Please make sure to review and complete it before the due date.
    </p>
  </div>
`
          });
        }
      });
    }
  }
);

// EXPORT FUNCTIONS
const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
  syncWorkspaceMemberDeletion, // ✅ Added
  syncWorkspaceMemberUpdate,    // ✅ Added
  sendTaskAssignmentEmail
];

module.exports = {
  inngest,
  functions,
};
