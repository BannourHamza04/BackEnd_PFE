const UserModel = require('../Models/User')
const bcrypt = require('bcryptjs')

//add User
exports.addUser = async (req, res) => {
    console.log(req.body)
    const userObj = {
        nameUser: req.body.nameUser,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        nationnality: req.body.nationnality
    }

    try {
        const user = await UserModel.findOne({
            $or: [
                { nameUser: userObj.nameUser },
                { email: userObj.email }
            ]
        });

        if (!user) {
            const user = new UserModel(userObj)
            user.save();
            return res.status(200).json('User added successufuly.');
        }
        else {
            return res.status(200).json('The User Name or email is Already Exist  !! ')
        }

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}


// Liste User
exports.listerUser = async (req, res) => {
    try {
        const userList = await UserModel.find({}).exec();
        return res.status(200).json({ userList });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

//Supprimer User 
exports.deleteUser = async (req, res) => {
    try {
        const param = req.params.id;
        // const cm = await UserModel.findById(param).exec();
        UserModel.findByIdAndDelete(param).exec();
        return res.status(200).json('User deleted successufuly.');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

//Update User
exports.updateUser = async (req, res) => {
    try {
        const param = req.params.id;
        const updatedUser = {
            "nameUser": req.body.nameUser,
            "email": req.body.email,
            "password": bcrypt.hashSync(req.body.password, 10),
            nationnality: req.body.nationnality
        }
        UserModel.findByIdAndUpdate(param, updatedUser).exec();
        // const cup = await UserModel.findById(param).exec();
        return res.status(200).json('User updated successufuly.');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

// Trouver l'user par son nom
exports.findUserByName = async (req, res) => {
    const param = req.params.nomUser;
    try {
        const user = await UserModel.findOne({ nameUser: param }).exec();
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

// Login function
exports.loginFunction = async (req, res) => {
    const userLogin = {
        "email": req.body.email,
        "password": req.body.password
    }
    try {
        const user = await UserModel.findOne({ email: userLogin.email });
        if (!user) {
            return res.status(200).json('The User does not exist.');
        }

        // Comparaison du mot de passe fourni par l'utilisateur avec le mot de passe haché stocké dans la base de données
        const passwordMatch = await bcrypt.compare(userLogin.password, user.password);
        if (passwordMatch) {
            const sessUser = { id: user._id, name: user.nameUser, email: user.email };
            console.log(sessUser)
            return res.status(200).json({ message:"Welcome To Our App.",sessUser});
        } else {
            return res.status(200).json('Incorrect password.');
        }
    } catch (error) {
        return res.status(400).json({ error: error.message ,auth : false});
    }
}

// Logout Function
exports.logoutFunction = async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ message: 'Server error' });
        } else {
            res.status(200).json({ message: 'Logout successful' });
        }
    });
};

exports.getUserIdSession = async (req,res) => {
    const userId = req.sessionID
    // console.log({ userId })
    if (!req.sessionID) {
        // console.log({ userId })
        return res.status(401).json({ message: 'Unauthorized' , auth : false});
    }
    console.log({ userId })
    res.status(200).json({ userId ,auth : true});
}



