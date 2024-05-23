const mongoose =  require('mongoose')

const UserSchema = new mongoose.Schema({
    
    nameUser : {
        type : String,
        required : true
    },
    
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    resetPasswordToken: {
        type : String
    }, 
    resetPasswordExpires : {
        type : Date
    }
},{timestamps : true})

module.exports = mongoose.model('User',UserSchema)

