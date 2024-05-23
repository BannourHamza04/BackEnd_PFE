const ProfileModel = require('../Models/Profile')
const UserModel = require('../Models/User')
const jwt = require('jsonwebtoken');

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

//add Profile
exports.addProfile = async (req, res) => {
    const profileObj = {
        nameInProfile: req.body.nameInProfile,
        nationnality: req.body.nationality,
        city: req.body.city,
        age: req.body.age,
        birthdate: req.body.birthdate,
        bio: req.body.bio,
        pdp: req.file.path
    }
    if (req.body.authorProfile) {
        profileObj.authorProfile = req.body.authorProfile;
    }
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
        if (profileList) {
            return res.status(200).json({ profileList });
        }
        return res.status(201).json("No Profil Found");
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

//Supprimer Profile 
exports.deleteProfile = async (req, res) => {
    try {
        const param = req.params.id;
        ProfileModel.findByIdAndDelete(param).exec();
        return res.status(200).json('Profile deleted successufuly.');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

//Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const param = req.params.id;
        console.log(req.body)
        const updatedProfileObj = {
            "nameInProfile": req.body.nameInProfile,
            "nationnality": req.body.nationality,
            "city": req.body.city,
            "age": req.body.age,
            "birthdate": req.body.birthdate,
            "bio": req.body.bio
        }
        if (req.file !== undefined && req.file.path !== null) {
            updatedProfileObj.pdp = req.file.path;
        }
        ProfileModel.findByIdAndUpdate(param, updatedProfileObj).exec();
        const cup = await ProfileModel.findById(param).exec();
        return res.status(200).json('Profile updated successufuly.');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

// Get Profile By Author Id
exports.getProfilByAuthorId = async (req, res) => {
    const param = req.params.authorId;
    try {
        const profil = await ProfileModel.findOne({ authorProfile: param }).exec();
        if (!profil) {
            return res.status(401).json("The Profile or the User doesent exist !!");
        }
        else {
            return res.status(200).json({ profil });
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

// Get Profile By Id
exports.getProfilById = async (req, res) => {
    const param = req.params.profilId;
    try {
        const profil = await ProfileModel.findById(param).exec()
        if (!profil) {
            return res.status(401).json("The Profile or the User doesent exist !!");
        }
        else {
            return res.status(200).json({ profil });
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

// Follow
exports.addFollowing = async (req, res) => {
    const authorId = req.params.authorId
    const followingId = req.params.followingId
    try {
        if (authorId != null && followingId != null) {
            const profilUser = await ProfileModel.findOne({ authorProfile: authorId }).exec()
            const profilFollowing = await ProfileModel.findById(followingId)

            if (!profilUser) {
                return res.status(404).json({ error: "Profil not found." });
            }
            if (!followingId) {
                return res.status(404).json({ error: "Following profile not found." });
            }

            const isFollowing = profilUser.followings.includes(followingId);
            if (!isFollowing) {
                // Ajouter à la liste des Followings de author
                profilUser.followings.push(followingId)
                await profilUser.save()

                // Ajouter à la liste des Followers de following
                profilFollowing.followers.push(profilUser._id)
                await profilFollowing.save()
            }
            else {
                return res.status(201).json('You have already followed this account !!');
            }
            return res.status(200).json('Follow successufuly');
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

// Unfollow
exports.deleteFollowing = async (req, res) => {
    const authorId = req.params.authorId;
    const followingId = req.params.followingId;
    try {
        if (authorId && followingId) {
            const profilUser = await ProfileModel.findOne({ authorProfile: authorId }).exec()
            const profilFollowing = await ProfileModel.findById(followingId);
            if (!profilUser) {
                return res.status(404).json({ error: "Profil not found." });
            }
            if (!profilFollowing) {
                return res.status(404).json({ error: "Following profile not found." });
            }
            const isFollowing = profilUser.followings.includes(followingId);
            if (isFollowing) {
                // Supprimer de la liste des Followings de l'auteur
                const followingIndex = profilUser.followings.indexOf(followingId);
                profilUser.followings.splice(followingIndex, 1);
                await profilUser.save();

                // Supprimer de la liste des Followers du following
                const authorIndex = profilFollowing.followers.indexOf(profilUser._id);
                profilFollowing.followers.splice(authorIndex, 1);
                await profilFollowing.save();

                return res.status(200).json('Following successfully deleted');
            } else {
                return res.status(404).json('You are not following this account');
            }
        } else {
            return res.status(400).json('Missing authorId or followingId');
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Verifier si le profile est deja un follwowing ou non
exports.ifIsFollowing = async (req, res) => {
    const authorId = req.params.authorId;
    const followingId = req.params.followingId;
    try {
        if (authorId != null && followingId != null) {
            const profilUser = await ProfileModel.findOne({ authorProfile: authorId }).exec()
            const profilFollowing = await ProfileModel.findById(followingId)
            if (!profilUser) {
                console.log("author" + profilUser)
                return res.status(404).json({ error: "Profil not found." });
            }
            if (!profilFollowing) {
                console.log("following" + profilFollowing)
                return res.status(404).json({ error: "Following profile not found." });
            }
            const isFollowing = profilUser.followings.includes(followingId);
            if (isFollowing) {
                return res.status(200).json(true);
            } else {
                return res.status(201).json(false);
            }
        } else {
            return res.status(400).json('Missing authorId or followingId');
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


// Liste Profile sans Profil de author
exports.getProfilesExecProfAuthor = async (req, res) => {
    const authorId = req.params.authorId;
    console.log()
    try {
        const profileList = await ProfileModel.find({ authorProfile: { $ne: authorId } }).exec();
        if (profileList.length > 0) {
            return res.status(200).json({ profileList });
        }
        return res.status(404).json({ message: "None profile found without the specified author." });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}


// Lister Followings d'un author
exports.getFollowingsByAuthor = async (req, res) => {
    const authorId = req.params.authorId;
    try {
        const authorProfil = await ProfileModel.findOne({ authorProfile: authorId }).exec();
        const followings = authorProfil.followings;
        const listFollowings = [];

        if (followings.length > 0) {
            for (const followingId of followings) {
                const followingProfil = await ProfileModel.findById(followingId);
                if (followingProfil) {
                    listFollowings.push(followingProfil);
                }
            }
            return res.status(200).json({ followings: listFollowings });
        }
        return res.status(404).json({ message: "You don't have any Following" });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

// Lister Followers d'un author
exports.getFollowersByAuthor = async (req, res) => {
    const authorId = req.params.authorId;
    try {
        const authorProfil = await ProfileModel.findOne({ authorProfile: authorId }).exec();
        const followers = authorProfil.followers;
        const listFollowers = [];

        if (followers.length > 0) {
            for (const followerId of followers) {
                const followerProfil = await ProfileModel.findById(followerId);
                if (followerProfil) {
                    listFollowers.push(followerProfil);
                }
            }
            return res.status(200).json({ followers: listFollowers });
        }
        return res.status(404).json({ message: "You don't have any Following" });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}