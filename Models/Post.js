const mongoose = require('mongoose');
const Profile = require('./Profile');


const commentaireSchema = new mongoose.Schema({
    content: String,
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

},{timestamps : true})

module.exports = mongoose.model('Post',PostSchema)
