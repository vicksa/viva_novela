const adminRequired = (req, res, next) => {
  if (!req.userPapel || req.userPapel !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar este recurso.' });
  }
  next();
};

module.exports = { adminRequired };
