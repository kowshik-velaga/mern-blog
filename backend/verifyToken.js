const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    let token = req.cookies.token;
    
    // If token is not present in cookies, check headers
    if (!token && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token is present
    if (!token) {
        return res.status(401).json("You are not authenticated!");
    }
    
    // Verify token
    jwt.verify(token, process.env.SECRET, (err, data) => {
        if (err) {
            return res.status(403).json("Token is not valid!");
        }
        
        // If token is valid, set user ID in request
        req.userId = data._id;
        next();
    });
};

module.exports = verifyToken;
