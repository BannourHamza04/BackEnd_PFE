const PostModel = require('../Models/Post')
const ProfileModel = require('../Models/Profile')
const UserModel = require('../Models/User')
const bcrypt = require('bcryptjs')

//add Post
exports.addPost = async (req,res) =>{
    const postObj = {
        image : req.file.path,
        content : req.body.content,
        
    }
    if (req.params.idAuthor) {
        const authorProfil = await ProfileModel.findOne({ authorProfile: req.params.idAuthor }).exec();
        postObj.authorPost = authorProfil._id;
    }

    try {
        const post = new PostModel(postObj)
        post.save();
        return res.status(200).json('Post created successufuly.');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}


// Liste Post
exports.listerPost = async (req, res) => {
    const authorId = req.params.authorId;

    try {
        const authorProfil = await ProfileModel.findOne({ authorProfile: authorId }).exec();
        if (!authorProfil) {
            return res.status(404).json({ error: "Author profile not found" });
        }
        const followings = authorProfil.followings;
        const authorAndFollowings = [...followings, authorProfil._id];

        const postList = await PostModel.find({ authorPost: { $in: authorAndFollowings } })
        .sort({ createdAt: -1 })
        .populate('authorPost', ' _id nameInProfile pdp').populate('commentaires.author','_id nameInProfile pdp')
        .exec();

        return res.status(200).json({ postList });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

// Trouver LE POST  par Id
exports.findPostById = async (req, res) => {
    const postId = req.params.postId;
    try {
        const post = await PostModel.findById(postId).exec()
        return res.status(200).json({ post });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

//Delete Post 
exports.deletePost = async (req,res) => {
    try {
        const param = req.params.postId;
        PostModel.findByIdAndDelete(param).exec();
        return res.status(200).json('Post deleted successufuly.');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

//Update Post
exports.updatePost =  async (req,res) =>{
    try{
        const postId = req.params.postId
        const content = req.body.content
        const post = await PostModel.findById(postId);
        post.content = content
        await post.save()
        return res.status(200).json('Post Updated Successfully');
    }catch(error){
        return res.status(400).json({ error: error.message });
    }
}


//Add Comment into Post 
exports.addCommentToPost = async (req, res) => {
    try {
        const postId = req.params.postId; 
        const authorProfil = await ProfileModel.findOne({ authorProfile: req.body.authorComment }).exec();
        if(!authorProfil){
            return res.status(404).json({ error: "author not found." });
        }
        const newComment = {
            content: req.body.content,
            author: authorProfil 
        };

        const post = await PostModel.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }
        post.commentaires.push(newComment);
        await post.save();

        return res.status(200).json({ message: "Comment added successfully." });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

// Delete Comment From Post
exports.deleteCommentFromPost = async (req, res) => {
    try {
        const postId = req.params.postId; 
        const commentId = req.params.commentId;

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        const commentIndex = post.commentaires.findIndex(comment => comment._id.equals(commentId));

        if (commentIndex === -1) {
            return res.status(404).json({ error: "Comment not found in the post." });
        }

        // Supprimer le commentaire de la liste des commentaires du post
        post.commentaires.splice(commentIndex, 1);
        await post.save();

        return res.status(200).json({ message: "Comment deleted successfully." });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

//Afficher Commentaires d'un Post
exports.listCommentsPost = async (req, res) => {
    try {
        const postId = req.params.postId; 
        const post = await PostModel.findById(postId).populate('commentaires.author','nameInProfile pdp');

        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        const commentaires = post.commentaires

        return res.status(200).json({ commentaires });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}


// Verifier si l'user a deja liké un post ou non
exports.ifIsLikePost = async (req, res) => {
    const postId = req.params.postId;
    const likerId = req.params.likerId;
    try {
        if (postId != null && likerId != null) {
            const liker = await ProfileModel.findOne({ authorProfile: likerId }).exec()
            const post = await PostModel.findById(postId)
            if (!liker) {
                console.log("Liker: " + liker)
                return res.status(404).json({ error: "User not found." });
            }
            if (!post) {
                console.log("Post: " + post)
                return res.status(404).json({ error: "Post not found." });
            }
            const isLiker = post.likes.some(likes => likes.author.toString() === liker._id.toString());
            if (isLiker) {
                return res.status(200).json(true);
            } else {
                return res.status(201).json(false);
            }
        } else {
            return res.status(400).json('Missing postId or likerId');
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Like and Dislike
exports.likeAndDisLike = async (req, res) => {
    const postId = req.params.postId;
    const likerId = req.params.likerId;
    try {
        if (postId != null && likerId != null) {
            const liker = await ProfileModel.findOne({ authorProfile: likerId }).exec()
            const post = await PostModel.findById(postId);

            if (!liker) {
                return res.status(404).json({ error: "Liker not found." });
            }
            if (!post) {
                return res.status(404).json({ error: "Post not found." });
            }

            const isLiker = post.likes.some(likes => likes.author.toString() === liker._id.toString());

            if (!isLiker) {
                post.likes.push({ author: liker._id });
                post.nombreLikes = post.likes.length
                await post.save();
                return res.status(200).json('Like successful');
            } else {
                post.likes = post.likes.filter(likes => likes.author.toString() !== liker._id.toString());
                post.nombreLikes = post.likes.length
                await post.save();
                return res.status(200).json('Dislike successful');
            }
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


// isAuthor Post
exports.isAuthorPost = async (req, res) => {
    const postId = req.params.postId;
    const authorId = req.params.authorId;
    try {
        if (postId != null && authorId != null) {
            const author = await ProfileModel.findOne({ authorProfile: authorId }).exec()
            const post = await PostModel.findById(postId);
            if (!author) {
                return res.status(404).json({ error: "Liker not found." });
            }
            if (!post) {
                return res.status(404).json({ error: "Post not found." });
            }
            const isAuthor = post.authorPost.toString() === author._id.toString();
            if ( isAuthor ) {
                return res.status(200).json(true);
            } else {
                return res.status(200).json(false);
            }
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


// Liste Post By Author
exports.listerPostsByAuthor = async (req, res) => {
    const authorId = req.params.authorId;

    try {
        const authorProfil = await ProfileModel.findOne({ authorProfile: authorId }).exec();
        if (!authorProfil) {
            return res.status(404).json({ error: "Author profile not found" });
        }

        const postList = await PostModel.find({ authorPost:  authorProfil})
        .sort({ createdAt: -1 })
        .populate('authorPost', ' _id nameInProfile pdp').populate('commentaires.author','_id nameInProfile pdp')
        .exec();
        authorProfil.nombrePostes = postList.length
        await authorProfil.save()
        return res.status(200).json({ postList });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}


// Liste Post By User
exports.listerPostsByUser = async (req, res) => {
    const authorId = req.params.authorId;

    try {
        const authorProfil = await ProfileModel.findById(authorId).exec();
        if (!authorProfil) {
            return res.status(404).json({ error: "Author profile not found" });
        }

        const postList = await PostModel.find({ authorPost:  authorProfil})
        .sort({ createdAt: -1 })
        .populate('authorPost', ' _id nameInProfile pdp').populate('commentaires.author','_id nameInProfile pdp')
        .exec();
        authorProfil.nombrePostes = postList.length
        await authorProfil.save()
        return res.status(200).json({ postList });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}