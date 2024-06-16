const AdminModel = require('../Models/Admin')
const UserModel = require('../Models/User')
const PostModel = require('../Models/Post')
const ProfileModel = require('../Models/Profile')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Middleware d'authentification
exports.authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token.split(' ')[1], 'hamza');
        req.user = decoded.user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalid' });
    }
};

// Login function
exports.loginAdminFunction = async (req, res) => {
    const adminLogin = {
        "email": req.body.email,
        "password": req.body.password
    }
    try {
        const admin = await AdminModel.findOne({ email: adminLogin.email });
        if (!admin) {
            return res.status(202).json('The admin does not exist.');
        }
        const passwordMatch = await bcrypt.compare(adminLogin.password, admin.password);
        if (passwordMatch) {
            const sessAdmin = { id: admin._id, name: admin.nameAdmin, email: admin.email };
            const token = jwt.sign({ id: admin._id }, "hamza")
            console.log(sessAdmin)
            return res.status(200).json({ message: "Welcome To Our App.", sessAdmin, token });
        } else {
            return res.status(201).json('Incorrect password.');
        }
    } catch (error) {
        return res.status(400).json({ error: error.message, auth: false });
    }
}


//add User
exports.addAdmin = async (req, res) => {
    console.log(req.body)
    const adminObj = {
        nameAdmin: req.body.nameAdmin,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
    }

    try {
        const admin = await AdminModel.findOne({
            $or: [
                { nameAdmin: adminObj.nameAdmin },
                { email: adminObj.email }
            ]
        });

        if (!admin) {
            const admin = new AdminModel(adminObj)
            admin.save();
            const sessAdmin = { id: admin._id, name: admin.nameAdmin, email: admin.email };
            const token = jwt.sign({ id: admin._id }, "hamza")
            return res.status(200).json({ message: "Admin added successufuly.", sessAdmin, token });
        }
        else {
            return res.status(201).json('The Admin Name or email is Already Exist  !! ')
        }

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

// get Statistiques
exports.getStats = async (req, res) => {
    try {
        const stats = {};

        // Nombre des Users
        const countUsers = await UserModel.countDocuments().exec();
        stats.countUsers = countUsers;

        // Nombre des Postes
        const countPosts = await PostModel.countDocuments().exec();
        stats.countPosts = countPosts;

        // Nombre total des commentaires
        const countComments = await PostModel.aggregate([
            { $unwind: "$commentaires" },
            { $count: "totalComments" }
        ]).exec();
        stats.countComments = countComments[0] ? countComments[0].totalComments : 0;

        // Nombre total des likes
        const countLikes = await PostModel.aggregate([
            { $unwind: "$likes" },
            { $count: "totalLikes" }
        ]).exec();
        stats.countLikes = countLikes.length > 0 ? countLikes[0].totalLikes : 0;

        // Nombre moyen de commentaires par post
        const avgCommentsPerPost = await PostModel.aggregate([
            { $project: { commentsCount: { $size: "$commentaires" } } },
            { $group: { _id: null, avgComments: { $avg: "$commentsCount" } } }
        ]).exec();
        stats.avgCommentsPerPost = avgCommentsPerPost.length > 0 ? avgCommentsPerPost[0].avgComments.toFixed(2) : 0;

        // Nombre moyen de posts par utilisateur
        const avgPostsPerUser = countUsers > 0 ? (countPosts / countUsers).toFixed(2) : 0;
        stats.avgPostsPerUser = avgPostsPerUser;

        // Utilisateur avec le plus de posts
        const topUser = await PostModel.aggregate([
            { $group: { _id: "$authorPost", postCount: { $sum: 1 } } },
            { $sort: { postCount: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: "profiles",
                    localField: "_id",
                    foreignField: "authorProfile",
                    as: "profile"
                }
            },
            { $unwind: "$profile" },
            { $project: { "profile.nameInProfile": 1, postCount: 1 } }
        ]).exec();

        stats.topUser = topUser.length > 0 ? { name: topUser[0].profile.nameInProfile, postCount: topUser[0].postCount } : null;

        // Utilisateur avec le plus grand nombre de followers
        const topFollowerUser = await ProfileModel.aggregate([
            { $project: { nombreFollowers: { $size: "$followers" } } },
            { $sort: { nombreFollowers: -1 } },
            { $limit: 1 }
        ]).exec();
        stats.topFollowerUser = topFollowerUser.length > 0 ? topFollowerUser[0].nombreFollowers : 0;

        // Nombre des nationalités
        const countNationalities = await ProfileModel.aggregate([
            { $group: { _id: "$nationnality" } },
            { $count: "uniqueNationalities" }
        ]).exec();
        stats.countNationalities = countNationalities.length > 0 ? countNationalities[0].uniqueNationalities : 0;

        // Âge moyen des utilisateurs
        const avgAge = await ProfileModel.aggregate([
            { $match: { age: { $exists: true, $ne: null } } },
            { $group: { _id: null, avgAge: { $avg: "$age" } } }
        ]).exec();
        stats.avgAge = avgAge.length > 0 ? avgAge[0].avgAge.toFixed(2) : 0;

        return res.status(200).json({ stats });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


//Add Comment into Post 
exports.addCommentToPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const newComment = {
            content: req.body.content,
            author: req.body.authorComment
        };

        const post = await PostModel.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }
        post.commentaires.push(newComment);
        await post.save();
        const i = 1
        io.emit('postAdded', i)
        return res.status(200).json({ message: "Comment added successfully." });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
