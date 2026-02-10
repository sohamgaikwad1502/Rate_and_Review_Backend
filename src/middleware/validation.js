const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};


const validateSignup = [
    body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password')
        .isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
    body('address').isLength({ min: 1, max: 400 }).withMessage('Address required, max 400 characters'),
    handleValidationErrors
];

const validateLogin = [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
    handleValidationErrors
];

const validatePasswordChange = [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword')
        .isLength({ min: 8, max: 16 }).withMessage('New password must be 8-16 characters')
        .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('New password must contain at least one special character'),
    handleValidationErrors
];

const validateStoreCreation = [
    body('name').isLength({ min: 1, max: 100 }).withMessage('Store name is required (max 100 characters)'),
    body('email').isEmail().withMessage('Valid store email address is required'),
    body('address').isLength({ min: 1, max: 400 }).withMessage('Store address is required (max 400 characters)'),
    handleValidationErrors
];

const validateStoreUpdate = [
    body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Store name max 100 characters'),
    body('email').optional().isEmail().withMessage('Must be a valid email address'),
    body('address').optional().isLength({ min: 1, max: 400 }).withMessage('Store address max 400 characters'),
    handleValidationErrors
];


const validateRatingSubmission = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be a number between 1 and 5'),
    handleValidationErrors
];

const validateRatingUpdate = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be a number between 1 and 5'),
    handleValidationErrors
];


const validateRoleAssignment = [
    body('role')
        .isIn(['admin', 'user', 'store_owner'])
        .withMessage('Role must be one of: admin, user, store_owner'),
    handleValidationErrors
];

const validateUserCreation = [
    body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password')
        .isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
    body('address').isLength({ min: 1, max: 400 }).withMessage('Address required, max 400 characters'),
    body('role')
        .isIn(['admin', 'user', 'store_owner'])
        .withMessage('Role must be one of: admin, user, store_owner'),
    handleValidationErrors
];

module.exports = {
    validateSignup,
    validateLogin,
    validatePasswordChange,
    
    // Future validations 
    validateStoreCreation,
    validateStoreUpdate,
    validateRatingSubmission,
    validateRatingUpdate,
    validateRoleAssignment,
    validateUserCreation
};