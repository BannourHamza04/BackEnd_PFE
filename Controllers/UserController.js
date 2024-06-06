const UserModel = require('../Models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const crypto = require('crypto');

//add User
exports.addUser = async (req, res) => {
    console.log(req.body)
    const userObj = {
        nameUser: req.body.nameUser,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        nationnality: req.body.nationnality,
        profileCreated: false,
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
            const sessUser = { id: user._id, name: user.nameUser, email: user.email };
            const token = jwt.sign({ id: user._id }, "hamza")
            return res.status(200).json({ message: "User added successufuly.", sessUser, token });
        }
        else {
            return res.status(201).json('The User Name or email is Already Exist  !! ')
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
        const userId = req.params.id;
        const user = await UserModel.findById(userId).exec()
        const userUpdated = {
            email: req.body.email,
            oldPassword: req.body.oldPassword,
            newPassword: req.body.newPassword
        }
        const passwordMatch = await bcrypt.compare(userUpdated.oldPassword, user.password);
        if (passwordMatch) {
            const updatedUser = {
                "email": req.body.email,
                "password": bcrypt.hashSync(req.body.newPassword, 10),
            }
            UserModel.findByIdAndUpdate(userId, updatedUser).exec();
            return res.status(201).json('User updated successufuly.');
        }
        else {
            return res.status(200).json('The Old Password is incorrect');
        }
    } catch (error) {
        console.log({ error: error.message })
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
            return res.status(202).json('The User does not exist.');
        }

        // Comparaison du mot de passe fourni par l'utilisateur avec le mot de passe haché stocké dans la base de données
        const passwordMatch = await bcrypt.compare(userLogin.password, user.password);
        if (passwordMatch) {
            const sessUser = { id: user._id, name: user.nameUser, email: user.email };
            const token = jwt.sign({ id: user._id }, "hamza")
            console.log(sessUser)
            return res.status(200).json({ message: "Welcome To Our App.", sessUser, token });
        } else {
            return res.status(201).json('Incorrect password.');
        }
    } catch (error) {
        return res.status(400).json({ error: error.message, auth: false });
    }
}

// Forget Password
exports.forgetPassword = async (req, res) => {
    const email = req.body.email
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(201).send('User not found');
        }
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 360000; // 10min
        await user.save();

        var transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false, // true pour le port 465, false pour les autres ports
            auth: {
                user: '757525001@smtp-brevo.com',
                pass: 'v2VhBTPjUxaYNX5I'
            }
        });

        const mailOptions = {
            to: user.email,
            from: '757525001@smtp-brevo.com',
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                `Please use the following token to reset your password:\n\n` +
                `${token}\n\n` +
                `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };
        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                return res.status(500).send('Error sending email');
            }
            res.status(200).send('An email has been sent to ' + user.email + ' with further instructions.');
        });
    } catch (err) {
        console.log(err)
        res.status(500).send('Error requesting password reset');
    }
}

// Changement de Mot de pass
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    console.log(token)
    try {
        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(201).send('Password reset token is invalid or has expired.');
        }

        user.password = bcrypt.hashSync(req.body.newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).send('Password has been reset');
    } catch (err) {
        res.status(500).send('Error resetting password');
    }
}

