const express = require("express");
const { createProject, updateProject, addMember } = require("../controllers/projectController");

const router = express.Router();

router.post('/',createProject);
router.put('/',updateProject);
router.post('/:projectId/addMember',addMember)

module.exports = router