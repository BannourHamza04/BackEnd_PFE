const mongoose = require('mongoose');
const Profile = require('./Profile');


const commentaireSchema = new mongoose.Schema({
    content: String,
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: Profile },
    createdAt: { type: Date, default: Date.now },
});

const likeSchema = new mongoose.Schema({
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: Profile },
    createdAt: { type: Date, default: Date.now },
});


const PostSchema = new mongoose.Schema({
    image : {
        type : String,
        required : false
    },
    content : {
        type  : String,
        required : true
    },
    authorPost: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: Profile },
        
    commentaires : [commentaireSchema],
    likes : [likeSchema],
    nombreLikes: {
        type  : Number,
    },
    nombreComments: {
        type  : Number,
    }

},{timestamps : true})

module.exports = mongoose.model('Post',PostSchema)
