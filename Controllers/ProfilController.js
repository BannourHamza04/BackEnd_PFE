const ProfileModel = require('../Models/Profile')
const UserModel = require('../Models/User')

//add Profile
exports.addProfile = async (req,res) =>{
    const profileObj = {
        nameInProfile : req.body.nameInProfile,
        nationnality : req.body.nationnality,
        city : req.body.city,
        age : req.body.age,
        birthdate : req.body.birthdate,
        bio : req.body.bio,
        pdp: req.file.path
    }
    if (req.body.authorProfile) {
        profileObj.authorProfile = req.body.authorProfile;
    }
    // const user = await UserModel.findById(ProfileObj.authorProfile)
    // console.log(user)
    try {
        const profile = new ProfileModel(profileObj)
        profile.save();
        console.log(profileObj.pdp)
        return res.status(200).json('Profile created successufuly.');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}


// Liste Profile
exports.listerProfile = async (req, res) => {
    try {
        const profileList = await ProfileModel.find({}).exec();
        return res.status(200).json({ profileList });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

//Supprimer Profile 
exports.deleteProfile = async (req,res) => {
    try {
        const param = req.params.id;
        ProfileModel.findByIdAndDelete(param).exec();
        return res.status(200).json('Profile deleted successufuly.');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

//Update Profile
exports.updateProfile =  async (req,res) =>{
    try{
        const param = req.params.id;
        const updatedProfileObj = {
            "nameInProfile" : req.body.nameInProfile,
            "pdp" : req.body.pdp,
            "nationnality" : req.body.nationnality,
            "city" : req.body.city,
            "age" : req.body.age,
            "birthdate" : req.body.birthdate,
            "bio" : req.body.bio
        }
        ProfileModel.findByIdAndUpdate(param,updatedProfileObj).exec();
        // const cup = await ProfileModel.findById(param).exec();
        return res.status(200).json('Profile updated successufuly.');
    }catch(error){
        return res.status(400).json({ error: error.message });
    }
}

// Get Profile By Author Id
exports.getProfilByAuthorId = async (req,res) => {
    const param = req.params.authorId;
    try {
        const profil = await ProfileModel.findOne({ authorProfile: param }).exec();
        if(!profil){
            return res.status(401).json("The Profile or the User doesent exist !!");
        }
        else{
            return res.status(200).json({ profil });
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}