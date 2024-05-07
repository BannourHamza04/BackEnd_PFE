const PostModel = require('../Models/Post')
const UserModel = require('../Models/User')
const bcrypt = require('bcryptjs')

//add Post
exports.addPost = async (req,res) =>{
    const postObj = {
        image : req.body.image,
        content : req.body.content,
        
    }
    if (req.body.authorPost) {
        postObj.authorPost = req.body.authorPost;
    }
    // const user = await UserModel.findById(postObj.authorPost)
    // console.log(user)

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
    try {
        const postList = await PostModel.find({}).exec();
        return res.status(200).json({ postList });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

//Supprimer Post 
exports.deletePost = async (req,res) => {
    try {
        const param = req.params.id;
        PostModel.findByIdAndDelete(param).exec();
        return res.status(200).json('Post deleted successufuly.');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

//Update Post
exports.updatePost =  async (req,res) =>{
    try{
        const param = req.params.id;
        const updatedPostObj = {
            "image" : req.body.image,
            "content" : req.body.content,
            "authorPost" : req.body.authorPost
        }
        PostModel.findByIdAndUpdate(param,updatedPostObj).exec();
        // const cup = await PostModel.findById(param).exec();
        return res.status(200).json('Post updated successufuly.');
    }catch(error){
        return res.status(400).json({ error: error.message });
    }
}

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
