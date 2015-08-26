module.exports = function(req, res, next) {
  res.sendHttpError = function(error) {
    res.status(error.status);
    if (res.req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json(error);
    } else {
      return res.render('error', {
        error: error
      });
    }
  };
  return next();
};
