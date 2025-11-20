
const express = require('express');

require('dotenv').config();
const cors = require('cors');
const {clerkMiddleware} = require('@clerk/express')
const { inngest, functions } = require('./inngest/index');
const { serve } = require('inngest/express');
const workspaceRoute = require('./routes/workspaceRoutes');
const projectRoute = require('./routes/projectRoutes')
const taskRoute = require('./routes/taskroutes')
const commentRoute = require('./routes/commentRoutes')
const protect = require('./middelewere/auth');
const app = express();
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get('/',(req,res)=>res.send("Server is Live"));
app.use("/api/inngest", serve({ client: inngest, functions }));
//routes
app.use('/api/workspaces',protect, workspaceRoute)
app.use('/api/projects',protect,projectRoute)
app.use('/api/tasks',protect,taskRoute)
app.use('/api/comments',protect,commentRoute)
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

