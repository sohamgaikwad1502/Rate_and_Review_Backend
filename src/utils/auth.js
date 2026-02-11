const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        return hashedPassword;
    } catch (error) {
        throw new Error('Password hashing failed');
    }
};

const comparePassword = async (password, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

const generateToken = (payload, expiresIn = '24h') => {
    try {
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
        return token;
    } catch (error) {
        throw new Error('Token creation failed');
    }
};


const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken
};