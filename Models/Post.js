const mongoose = require('mongoose')
const User = require = ('./User.js')

const commentaireSchema = new mongoose.Schema({
    content: String,
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: User },
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
        ref: User },
        
    commentaires : [commentaireSchema],

},{timestamps : true})

module.exports = mongoose.model('Post',PostSchema)
