
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require('body-parser');
const morgan = require('morgan');

const viewBooks = require('./view-books');
// const viewBookAuthors = require('./view-book-authors');

// setup middleware
app.use(morgan('dev'));
app.use(bodyParser.json());

// routes
app.use('/books', viewBooks);

// ===========================================================
// 404
// ===========================================================
app.use((req, res, next) => {
  console.log("=========== 404 ==========");
  res.status(404).json({ message: "Page not found" });
  next();
});

/* **************************************************
*  restructureError()
*  @param Error -- actual Error object
*  Returns object { message: 'xxxx', stack: 'xxx' }
***************************************************** */
function restructureError(error) {
  if (!error.stack)
    return error;

  const i = error.stack.search(' at ');
  if (i === -1)
    return { message: error.message, stack: 'undetermined', status: error.status };

  const restructured = {
    error: {
      message: error.message,
      stack: error.stack.slice(i + 4),
    },
  };
  if (error.status)
    restructured.error.status = error.status;
  return restructured;
}

// ===========================================================
// Error handler for next(object) / 500
// ===========================================================
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.log("=========== APP ERROR ==========");
  console.log(err);
  console.log("^^^^^^^^^^^ APP ERROR ^^^^^^^^^");
  res.status(status).json(restructureError(err));
  next();
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Bookstore API listening on port ${port}!`);
  });
}

module.exports = app;
