const express = require('express');
const AdminController = require('../Controllers/AdminController');
const router = express.Router();

router.post('/loginAdmin', AdminController.loginAdminFunction);
router.post('/addAdmin', AdminController.addAdmin);
router.post('/:postId/addCommentToPost', AdminController.addCommentToPost);
router.get('/getStats', AdminController.getStats);

module.exports = router;
