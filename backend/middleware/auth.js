const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};