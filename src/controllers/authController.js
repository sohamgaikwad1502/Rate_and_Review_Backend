const { 
    createUser, 
    findUserByEmail, 
    findUserById, 
    updateUserPassword,
    userExistsByEmail 
} = require('../models/User');

const { comparePassword, generateToken } = require('../utils/auth');


const signup = async (req, res) => {
    try {
        const { name, email, password, address } = req.body;
        
        const existingUser = await userExistsByEmail(email);
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }
        
        const newUser = await createUser({ name, email, password, address, role: 'user' });
        const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
        
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
            token
        });
        
    } catch (error) {
        console.error('Error during signup:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create account' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        const token = generateToken({ id: user.id, email: user.email, role: user.role });
        
        res.json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token
        });
        
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};


const getProfile = async (req, res) => {
    try {
        const user = await findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ success: false, message: 'Failed to get profile' });
    }
};


const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await findUserByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        
        await updateUserPassword(req.user.id, newPassword);
        
        res.json({ success: true, message: 'Password changed successfully' });
        
    } catch (error) {
        console.error('Error changing password:', error.message);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
};

const logout = async (req, res) => {
    try {
        res.json({ 
            success: true, 
            message: 'Logged out successfully. Please remove the token from client storage.' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Logout failed' });
    }
};

module.exports = {
    signup,
    login,
    getProfile,
    changePassword,
    logout
};