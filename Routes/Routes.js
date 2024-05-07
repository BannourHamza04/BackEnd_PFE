const express = require('express')
const router = express.Router();
const UserController = require('../Controllers/UserController')
const PostController = require('../Controllers/PostController')
const ProfilController = require('../Controllers/ProfilController')
const multer = require('multer');

// Multer Disk Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null,uniqueSuffix + file.originalname)
    }
})
const upload = multer({ storage: storage })

// User Routes
router.post('/User/Ajouter', UserController.addUser)
router.get('/User/Lister', UserController.listerUser)
router.get('/User/:id/delete', UserController.deleteUser)
router.post('/User/:id/update', UserController.updateUser)
router.get('/User/:nomUser/findUserByName', UserController.findUserByName)
router.post('/User/login', UserController.loginFunction)
router.get('/User/logout', UserController.logoutFunction)
router.get('/User/getUserIdSession', UserController.getUserIdSession)

// Post Routes
router.post('/Post/Ajouter', PostController.addPost)
router.get('/Post/Lister', PostController.listerPost)
router.get('/Post/:id/delete', PostController.deletePost)
router.post('/Post/:id/update', PostController.updatePost)
router.post('/Post/:postId/addComment', PostController.addCommentToPost)
router.get('/Post/:postId/deleteComment/:commentId', PostController.deleteCommentFromPost)

// Profile Routes
router.post('/Profil/Ajouter', upload.single('pdp'), ProfilController.addProfile)
router.get('/Profil/Lister', ProfilController.listerProfile)
router.get('/Profil/:id/delete', ProfilController.deleteProfile)
router.post('/Profil/:id/update', ProfilController.updateProfile)
router.get('/Profil/:authorId/getProfilByAuthorId', ProfilController.getProfilByAuthorId)
module.exports = router;
