const mongoose = require('mongoose')
const User = require = ('./User.js')

const ProfileSchema = new mongoose.Schema({
    nameInProfile : {
        type : String,
        required : true
    },
    pdp : {
        type: String
    },
    age : {
        type : Number,
    },
    nationnality : {
        type : String,
    },
    city : {
        type : String,
    },
    birthdate : {
        type : String,
    },
    bio : {
        type : String
    },
    followers: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    followings: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    authorProfile: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: User },
},{timestamps : true})

module.exports = mongoose.model('Profile',ProfileSchema)

