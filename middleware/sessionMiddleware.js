module.exports = (req, res, next) => {
    if (req.session.login) {
      res.redirect("/app/firstSection");
    } else {
      next()
    }
  };