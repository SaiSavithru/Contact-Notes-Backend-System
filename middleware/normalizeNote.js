// Normalize body of notes
module.exports = function (req, res, next) {
  if (req.body.note_body) {
    req.body.body = req.body.note_body;
    delete req.body.note_body;
  }

  if (req.body.note_text) {
    req.body.body = req.body.note_text;
    delete req.body.note_text;
  }
  next();
};
  