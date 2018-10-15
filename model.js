const uuidv4 = require('uuid/v4');
const fs = require('fs');
const { promisify } = require('util');

const DB_FILE_NAME = './books.json';

/* **************************************************
*  loadDb()
*  Load database
*  @return Promise: [ {book}, ... ]
*  .catch(error) -- file not found or can't be read
***************************************************** */
function loadDb() {
  return promisify(fs.readFile)(DB_FILE_NAME, 'utf8')
    .then(buffer => JSON.parse(buffer));
}

/* **************************************************
*  saveDb()
*  Save database
*  @return Promise: [ {book}, ... ]
*  .catch(error) file not found or can't be read
***************************************************** */
function saveDb(aBooks) {
  return promisify(fs.writeFile)(DB_FILE_NAME, JSON.stringify(aBooks, null, 2), 'utf8');
}



/* **************************************************
*  createBook()
*  @param sTitle, new book title
*  @param sDesc, new book desc
*  @return Promise: oNewBook, book that was added including its assigned id
*  .catch(error) from loadDb(), saveDb() or
*                Error("book already exists")
***************************************************** */
function createBook(sTitle, sDesc) {
  let aBooks = [];
  let oNewBook = {};
  return loadDb()
    .then((_aBooks) => {
      aBooks = _aBooks;
      if (aBooks.find(oBook => oBook.title.toLowerCase() === sTitle.toLowerCase())) {
        console.log("internal error: book exists");
        throw new Error(`book already exists: ${sTitle}`);
      }
      oNewBook = {};
      oNewBook.id = uuidv4();
      oNewBook.title = sTitle;
      oNewBook.borrowed = false;
      oNewBook.desc = sDesc;
      oNewBook.authors = [];
      aBooks.unshift(oNewBook);
    })
    .then(() => saveDb(aBooks))
    .then(() => oNewBook);
}

/* **************************************************
*  readBook()
*  @param [sId], book id, if not passsed then array of all books returned
*  @return Promise: oBook
*  .catch(error) from loadDb() or
*                Error("book not found")
***************************************************** */
function readBook(sId) {
  return loadDb()
    .then((aBooks) => {

      // read all books
      if (!sId)
        return aBooks;

      // read specific book
      const oFndBook = aBooks.find(oBook => oBook.id === sId);
      if (!oFndBook) {
        throw new Error(`book not found: ${sId}`);
      }
      return oFndBook;
    });
}

/* **************************************************
*  updateBook()
*  @param _oUpdateBook, book object with updates to title, borrowed, and desc.
*         Search for _oUpdateBook.id.
*         Authors list will not be changed.
*  @return Promise: oUpdatedBook, book that was updated
*  .catch(error) from loadDb(), saveDb() or
*                Error("book not found")
***************************************************** */
function updateBook(_oUpdateBook) {
  let aBooks = [];
  let oUpdateBook = _oUpdateBook;
  return loadDb()
    .then((_aBooks) => {
      aBooks = _aBooks;
      const idxFndBook = aBooks.findIndex(oBook => oBook.id === oUpdateBook.id);
      if (idxFndBook === -1) {
        console.log("internal error: book not found");
        throw new Error(`book not found: ${oUpdateBook.id}`);
      }
      // shallow update, leave authors array as is
      const aCurrAuthors = aBooks[idxFndBook].authors;
      aBooks[idxFndBook] = oUpdateBook;
      aBooks[idxFndBook].authors = aCurrAuthors;
      oUpdateBook = aBooks[idxFndBook]; // needs to include the authors object
    })
    .then(() => saveDb(aBooks))
    .then(() => oUpdateBook);
}

/* **************************************************
*  deleteBook()
*  @param sId, book id
*  @return Promise: deleted oBook
*  .catch(error) from loadDb(), saveDb() or
*                Error("book not found")
***************************************************** */
function deleteBook(sId) {
  let aBooks = [];
  let oDeletedBook = {};
  return loadDb()
    .then((_aBooks) => {
      aBooks = _aBooks;
      const idxFndBook = aBooks.findIndex(oBook => oBook.id === sId);
      if (idxFndBook === -1) {
        console.log("internal error: book not found");
        throw new Error(`book not found: ${sId}`);
      }
      oDeletedBook = aBooks[idxFndBook];
      aBooks.splice(idxFndBook, 1);
    })
    .then(() => saveDb(aBooks))
    .then(() => oDeletedBook);
}







/* **************************************************
*  createBookAuthor()
*  @param sBookID
*  @param sFirst
*  @param sLast
*  @return Promise: oNewAuthor, author that was added including its assigned id
*  .catch(error) from loadDb(), saveDb() or
*                Error("book not found")
*                Error("author already exists")
***************************************************** */
function createBookAuthor(sBookId, sFirst, sLast) {
  const oNewAuthor = {};
  return loadDb()
    .then((aBooks) => {
      const oFndBook = aBooks.find(oBook => oBook.id === sBookId);
      if (!oFndBook)
        throw new Error(`book not found: ${sBookId}`);
      if (oFndBook.authors.find(oAuthor => oAuthor.first === sFirst && oAuthor.last === sLast))
        throw new Error(`author already exists: ${sFirst} ${sLast}`);
      oNewAuthor.id = uuidv4();
      oNewAuthor.first = sFirst;
      oNewAuthor.last = sLast;
      oFndBook.authors.push(oNewAuthor);
      return aBooks;
    })
    .then(aBooks => saveDb(aBooks))
    .then(() => oNewAuthor);
}

/* **************************************************
*  readBookAuthor()
*  @param sBookId
*  @param [sAuthorId], if not provided return all authors
*  @return Promise: oAuthor
*  .catch(error) from loadDb() or
*                Error("book not found")
*                Error("author not found")
***************************************************** */
function readBookAuthor(sBookId, sAuthorId) {
  return loadDb()
    .then((aBooks) => {
      const oFndBook = aBooks.find(oBook => oBook.id === sBookId);
      if (!oFndBook) {
        console.log("internal error: book not found");
        throw new Error(`book not found: ${sBookId}`);
      }

      // all authors
      if (!sAuthorId)
        return oFndBook.authors;

      // specific author
      const oFndAuthor = oFndBook.authors.find(oAuthor => oAuthor.id === sAuthorId);
      if (!oFndAuthor) {
        console.log("internal error: author not found");
        throw new Error(`author not found: ${sAuthorId}`);
      }
      return oFndAuthor;
    });
}

/* **************************************************
*  updateBookAuthor()
*  @param sBookId
*  @param oAuthor, author object with updates to first, last.
*  @return Promise: oUpdatedAuthor, author that was updated
*  .catch(error) from loadDb(), saveDb() or
*                Error("book not found")
*                Error("author not found")
***************************************************** */
function updateBookAuthor(sBookId, oupdateBookAuthor) {
  let aBooks = [];
  // const oupdateBookAuthor = _oupdateBookAuthor;
  return loadDb()
    .then((_aBooks) => {
      aBooks = _aBooks;
      const oFndBook = aBooks.find(oBook => oBook.id === sBookId);
      if (!oFndBook) {
        console.log("internal error: book not found");
        throw new Error(`book not found: ${sBookId}`);
      }
      const idxFndAuthor = oFndBook.authors.findIndex(oAuthor => oAuthor.id === oupdateBookAuthor.id);
      if (idxFndAuthor === -1) {
        console.log("internal error: author not found");
        throw new Error(`author not found: ${oupdateBookAuthor.id}`);
      }
      oFndBook.authors[idxFndAuthor] = oupdateBookAuthor;
    })
    .then(() => saveDb(aBooks))
    .then(() => oupdateBookAuthor);
}

/* **************************************************
*  deleteBookAuthor()
*  @param sBookId
*  @param sAuthorId
*  @return Promise: deleted oAuthor
*  .catch(error) from loadDb(), saveDb() or
*                Error("book not found")
*                Error("author not found")
***************************************************** */
function deleteBookAuthor(sBookId, sAuthorId) {
  let aBooks = [];
  let oDeletedAuthor = {};
  return loadDb()
    .then((_aBooks) => {
      aBooks = _aBooks;
      const oFndBook = aBooks.find(oBook => oBook.id === sBookId);
      if (!oFndBook) {
        console.log("internal error: book not found");
        throw new Error(`book not found: ${sBookId}`);
      }
      const idxFndAuthor = oFndBook.authors.findIndex(oAuthor => oAuthor.id === sAuthorId);
      if (idxFndAuthor === -1) {
        console.log("internal error: author not found");
        throw new Error(`author not found: ${sAuthorId}`);
      }
      oDeletedAuthor = oFndBook.authors[idxFndAuthor];
      oFndBook.authors.splice(idxFndAuthor, 1);
    })
    .then(() => saveDb(aBooks))
    .then(() => oDeletedAuthor);
}

module.exports = {
  createBook,
  readBook,
  updateBook,
  deleteBook,
  createBookAuthor,
  readBookAuthor,
  updateBookAuthor,
  deleteBookAuthor,
};

/* ========= TEST CODE ========== */

// createBookAuthor('91eabf57-f817-42ca-914b-5517120acde6', 'Ed', 'Phelps')
//   .then(author => console.log(author));

// readBookAuthor('91eabf57-f817-42ca-914b-5517120acde6')
//   .then(authors => console.log(authors));

// readBookAuthor('91eabf57-f817-42ca-914b-5517120acde6', '506f4103-3447-4ac5-9a93-bed9db6bd315')
//   .then(author => console.log(author));

// updateBookAuthor('91eabf57-f817-42ca-914b-5517120acde6', {
//   id: '506f4103-3447-4ac5-9a93-bed9db6bd315',
//   first: 'Wendy',
//   last: 'Dubow',
// })
// .then(author => console.log(author));

// deleteBookAuthor('91eabf57-f817-42ca-914b-5517120acde6', '506f4103-3447-4ac5-9a93-bed9db6bd315')
//   .then(author => console.log(author));


// createBook('Bible', 'The definitive guide to life.')
//   .then((oBook) => {
//     console.log("added book: ", oBook);
//   })
//   .then(() => createBook('Bible', 'The definitive guide to life.'))
//   .then((oBook) => {
//     console.log("added another book: ", oBook);
//   })
//   .catch((error) => {
//     console.log("catch(): failed to insert book: ", error);
//   });

// readBook()
//   .then((aBooks) => {
//     console.log("Found books: ", aBooks);
//   })
//   .catch((error) => {
//     console.log("catch(): can't find books: ", error);
//   });

// readBook('91eabf57-f817-42ca-914b-5517120acde7')
//   .then((oBook) => {
//     console.log("Found book: ", oBook);
//   })
//   .catch((error) => {
//     console.log("catch(): can't find book: ", error);
//   });

// const oBookToUpdate = {
//   id: '91eabf57-f817-42ca-914b-5517120acde3',
//   title: 'updated',
//   borrowed: 'true',
//   decr: "new desc",
// };
// updateBook(oBookToUpdate)
//   .then((oBook) => {
//     console.log("Uppdated book: ", oBook);
//   })
//   .catch((error) => {
//     console.log("catch(): can't find book: ", error);
//   });

// deleteBook('0b8cb6bd-e0c6-45fa-8f2c-e510a77255dd')
//   .then((oBook) => {
//     console.log("Deleted book: ", oBook);
//   })
//   .catch((error) => {
//     console.log("catch(): can't find book: ", error);
//   });
