const express = require('express');
const AdminController = require('../Controllers/AdminController');

module.exports = (io, connectedUsers) => {
    const router = express.Router();

    router.post('/loginAdmin', AdminController.loginAdminFunction);
    router.post('/addAdmin', AdminController.addAdmin);
    router.post('/:postId/addCommentToPost', AdminController.addCommentToPost(io, connectedUsers));
    router.get('/getStats', AdminController.authMiddleware, AdminController.getStats(io, connectedUsers));

    return router;
};
