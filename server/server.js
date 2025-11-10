
const express = require('express');

require('dotenv').config();
const cors = require('cors');
const {clerkMiddleware} = require('@clerk/express')
const { inngest, functions } = require('./inngest/index');
const { serve } = require('inngest/express');
const app = express();
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get('/',(req,res)=>res.send("Server is Live"));
app.use("/api/inngest", serve({ client: inngest, functions }));
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

