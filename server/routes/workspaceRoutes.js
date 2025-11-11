
const express = require("express");
const { getUserWorkspaces, addMember } = require("../controllers/workspaceController");

const router = express.Router()

router.get('/',getUserWorkspaces)
router.post('/add-member',addMember)

module.exports = router