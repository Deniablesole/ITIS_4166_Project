import jwt from 'jsonwebtoken';

// Middleware to authenticate user based on JWT token
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if the authorization header is present and starts with 'Bearer ' to ensure it's a valid token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token has been inputted or provided.' });
    }

    // Extract the token from the authorization header and verify it using the JWT_SECRET
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information to the request object for further use in the route handlers
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token not valid, please input a valid token.' });
  }
};

// Middleware to check if the authenticated user has the 'admin' role and grant access accordingly
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'You do not have the sufficient permissions to access this resource.' });
  }

  // Check if the user's role is 'admin' and grant access if true, otherwise return a 403 Forbidden error
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Insufficient Permissions' });
  }

  next();
};

// Middleware to check if the authenticated user is the owner of the resource or has the 'admin' role and grant access accordingly
export const requireOwnership = (getUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'You do not have the sufficient permissions to access this resource.' });
    }

    // Extract the user ID from the resource and compare it with the authenticated user's ID or check if the user has the 'admin' role
    const resourceUserId = getUserId(req);

    // Grant access if the user is the owner of the resource or has the 'admin' role, otherwise return a 403 Forbidden error
    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      next();
    } else {
      return res.status(403).json({ error: 'Insufficient Permissions' });
    }
  };
};

//End of File.
