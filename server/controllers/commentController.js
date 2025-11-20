//Add comments

const prisma = require("../configs/prisma");

const addComents = async(req,res)=>{
    try {
        const {userId} = await req.auth();
        const {content,taskId} = req.body;
        //check if user is projectmember
        const task = await prisma.task.findUnique({
            where:{id:taskId},

        })
        const project = await prisma.project.findUnique({
            where:{id:task.projectId},
            include:{members:{include:{user:true}}}
        })
        if(!project){
            return res.status(404).json({
                message:"project not found"
            })
        }
        const member = project.members.find((member)=>member.userId === userId);
        if(!member){
            return res.status(403).json({
                message:"Yoy are not member of this project"
            })
        }
        const comment = await prisma.comment.create({data:{taskId:content,userId},include:{user:true}})
 res.json({comment})
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:error.message
        })
       
    }
}

//get comments for tasks


const getTaskComments = async(req,res)=>{
    try {
        const {taskId} = req.params;
        const comments = await prisma.comment.findMany({
            where:{taskId},include:{user:true}
        })
        res.json({comments})
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:error.message
        })
    }
}
module.exports = {addComents,getTaskComments}