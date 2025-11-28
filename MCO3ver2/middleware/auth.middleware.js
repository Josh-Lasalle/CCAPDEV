
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/users/login');
}

function isAdmin(req, res, next) {
  if (req.session && req.session.userId && req.session.role === 'Admin') {
    return next();
  }
  res.status(403).send('Access Denied: Admin only');
}

function isClient(req, res, next) {
  if (req.session && req.session.userId && req.session.role === 'Client') {
    return next();
  }
  res.status(403).send('Access Denied: Client only');
}

module.exports = { isAuthenticated, isAdmin, isClient };