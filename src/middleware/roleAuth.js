const requireAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required. Only administrators can access this resource.'
            });
        }
        
        next();
        
    } catch (error) {
        console.error('Admin role check error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while checking admin permissions'
        });
    }
};

const requireStoreOwner = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        if (req.user.role !== 'store_owner') {
            return res.status(403).json({
                success: false,
                message: 'Store owner access required. Only store owners can access this resource.'
            });
        }
        
        next();
        
    } catch (error) {
        console.error('Store owner role check error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while checking store owner permissions'
        });
    }
};

module.exports = {
    requireAdmin,
    requireStoreOwner
};