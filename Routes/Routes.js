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

// Authentification
router.get('/protected-route', ProfilController.authMiddleware, (req, res) => {
    res.json({ message: 'Vous êtes authentifié et accédez à une route protégée.' });
});

// User Routes
router.post('/User/Ajouter', UserController.addUser)
router.get('/User/Lister',ProfilController.authMiddleware, UserController.listerUser)
router.get('/User/:id/delete', UserController.deleteUser)
router.post('/User/:id/update', UserController.updateUser)
router.get('/User/:nomUser/findUserByName', UserController.findUserByName)
router.post('/User/login', UserController.loginFunction)
router.post('/User/forgetPassword',UserController.forgetPassword)
router.post('/User/reset-password',UserController.resetPassword)

// Post Routes
router.post('/Post/:idAuthor/Ajouter',upload.single('image'), PostController.addPost)
router.get('/Post/:authorId/Lister',PostController.listerPost)
router.get('/Post/:postId/findPostById',PostController.findPostById)
router.get('/Post/:postId/delete', PostController.deletePost)
router.post('/Post/:postId/update', PostController.updatePost)
router.post('/Post/:postId/addComment', PostController.addCommentToPost)
router.get('/Post/:postId/deleteComment/:commentId', PostController.deleteCommentFromPost)
router.get('/Post/:postId/listCommentsPost', PostController.listCommentsPost)
router.get('/Post/:postId/likeAndDisLike/:likerId',PostController.likeAndDisLike)
router.get('/Post/:postId/ifIsLikePost/:likerId',PostController.ifIsLikePost)
router.get('/Post/:postId/isAuthorPost/:authorId',PostController.isAuthorPost)
router.get('/Post/:authorId/listerPostsByAuthor',PostController.listerPostsByAuthor)
router.get('/Post/:authorId/listerPostsByUser',PostController.listerPostsByUser)

// Profile Routes
router.post('/Profil/Ajouter', upload.single('pdp'), ProfilController.addProfile)
router.get('/Profil/Lister', ProfilController.listerProfile)
router.get('/Profil/:id/delete', ProfilController.deleteProfile)
router.post('/Profil/:id/update',upload.single('pdp'), ProfilController.updateProfile)
router.get('/Profil/:authorId/getProfilByAuthorId',ProfilController.getProfilByAuthorId)
router.get('/Profil/:profilId/getProfilById', ProfilController.getProfilById)
router.get('/Profil/:authorId/getProfilesExecProfAuthor', ProfilController.getProfilesExecProfAuthor)
router.get('/Profil/:authorId/addFollowing/:followingId',ProfilController.addFollowing)
router.get('/Profil/:authorId/deleteFollowing/:followingId',ProfilController.deleteFollowing)
router.get('/Profil/:authorId/ifIsFollowing/:followingId',ProfilController.ifIsFollowing)
router.get('/Profil/:authorId/getFollowingsByAuthor', ProfilController.getFollowingsByAuthor)
router.get('/Profil/:authorId/getFollowersByAuthor', ProfilController.getFollowersByAuthor)

module.exports = router;
