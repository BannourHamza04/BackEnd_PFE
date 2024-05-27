const AdminModel = require('../Models/Admin')
const UserModel = require('../Models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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

// Login function
exports.loginAdminFunction = async (req, res) => {
    const adminLogin = {
        "email": req.body.email,
        "password": req.body.password
    }
    try {
        const admin = await AdminModel.findOne({ email: adminLogin.email });
        if (!admin) {
            return res.status(202).json('The admin does not exist.');
        }
        const passwordMatch = await bcrypt.compare(adminLogin.password, admin.password);
        if (passwordMatch) {
            const sessAdmin = { id: admin._id, name: admin.nameAdmin, email: admin.email };
            const token = jwt.sign({ id: admin._id }, "hamza")
            console.log(sessAdmin)
            return res.status(200).json({ message: "Welcome To Our App.", sessAdmin, token });
        } else {
            return res.status(201).json('Incorrect password.');
        }
    } catch (error) {
        return res.status(400).json({ error: error.message, auth: false });
    }
}


//add User
exports.addAdmin = async (req, res) => {
    console.log(req.body)
    const adminObj = {
        nameAdmin: req.body.nameAdmin,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
    }

    try {
        const admin = await AdminModel.findOne({
            $or: [
                { nameAdmin: adminObj.nameAdmin },
                { email: adminObj.email }
            ]
        });

        if (!admin) {
            const admin = new AdminModel(adminObj)
            admin.save();
            const sessAdmin = { id: admin._id, name: admin.nameAdmin, email: admin.email };
            const token = jwt.sign({ id: admin._id }, "hamza")
            return res.status(200).json({ message: "Admin added successufuly.", sessAdmin, token });
        }
        else {
            return res.status(201).json('The Admin Name or email is Already Exist  !! ')
        }

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

// get Statistiques
exports.getStats = async (req, res) => {
    try {
        const stats = {}

        const countUsers = await UserModel.countDocuments().exec();

        
        if (countUsers > 0) {
            stats.countUsers = countUsers
            return res.status(200).json({ stats });
        }
        return res.status(404).json({ message: "None User Founded."});
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}