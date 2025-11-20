const express = require('express');
const { route } = require('./taskroutes');
const { addComents, getTaskComments } = require('../controllers/commentController');

const router = express.Router()

router.post('/',addComents);
router.get('/:taskId',getTaskComments);
module.exports = router