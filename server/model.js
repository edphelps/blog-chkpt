const uuidv4 = require('uuid/v4');
const fs = require('fs');
const { promisify } = require('util');

const DB_FILE_NAME = './be/blog.json';

/* **************************************************
*  loadDb()
*  Load database
*  @return Promise: [ {blog_entry}, ... ]
*  .catch(error) -- file not found or can't be read
***************************************************** */
function loadDb() {
  return promisify(fs.readFile)(DB_FILE_NAME, 'utf8')
    .then(buffer => JSON.parse(buffer));
}

/* **************************************************
*  saveDb()
*  Save database
*  @return Promise: [ {blog_entry}, ... ]
*  .catch(error) file not found or can't be read
***************************************************** */
function saveDb(aBooks) {
  return promisify(fs.writeFile)(DB_FILE_NAME, JSON.stringify(aBooks, null, 2), 'utf8');
}

/* **************************************************
*  createPost()
*  @param oPost: { id: --,
*                  title: string,
*                  content: string,
*                  added: --,
*                  edited: -- }
*  @return Promise: oNewPost { id: uuid,
*                              title: string,
*                              content: string,
*                              added: current date/time,
*                              edited: false }
*  .catch(error) from loadDb(), saveDb() or
*                Error("req'd field not supplied: field_name")
***************************************************** */
function createPost(_oNewPost) {
  let aPosts = [];
  const oNewPost = _oNewPost; // happy linter
  return loadDb()
    .then((_aPosts) => {
      aPosts = _aPosts;
      // fill in the rest of the post's fields
      oNewPost.id = uuidv4();
      oNewPost.added = new Date();
      oNewPost.edited = false;
      aPosts.unshift(oNewPost);
    })
    .then(() => saveDb(aPosts))
    .then(() => oNewPost);
}

/* **************************************************
*  readPost()
*  @param [sId], post id, if not passsed then array of all posts returned
*  @return Promise: oPost or aPosts
*  .catch(error) from loadDb() or
*                Error("post not found")
***************************************************** */
function readPost(sId) {
  return loadDb()
    .then((aPosts) => {

      // read all posts
      if (!sId)
        return aPosts;

      // read specific post
      const oFndPost = aPosts.find(oPost => oPost.id === sId);
      if (!oFndPost) {
        throw new Error(`post not found: ${sId}`);
      }
      return oFndPost;
    });
}

/* **************************************************
*  updatePost()
*  Update a post
*  @param _oUpdatePost, post object with updates:
*                { id: uuid,
*                  title: string,
*                  content: string,
*                  added: --,
*                  edited: -- }
*  @return Promise: oUpdatePost, post that was updated
*  .catch(error) from loadDb(), saveDb() or
*                Error("post not found")
***************************************************** */
function updatePost(_oUpdatePost) {
  let aPosts = [];
  let oUpdatePost = _oUpdatePost;
  return loadDb()
    .then((_aPosts) => {
      aPosts = _aPosts;
      const idxFndPost = aPosts.findIndex(oPost => oPost.id === oUpdatePost.id);
      if (idxFndPost === -1) {
        throw new Error(`post not found: ${oUpdatePost.id}`);
      }
      oUpdatePost.edited = true; // set flag that post was edited
      aPosts[idxFndPost] = oUpdatePost;
    })
    .then(() => saveDb(aPosts))
    .then(() => oUpdatePost);
}

/* **************************************************
*  deletePost()
*  @param sId, post id
*  @return Promise: deleted oPost
*  .catch(error) from loadDb(), saveDb() or
*                Error("post not found")
***************************************************** */
function deletePost(sId) {
  let aPosts = [];
  let oDeletedPost = {};
  return loadDb()
    .then((_aPosts) => {
      aPosts = _aPosts;
      const idxFndPost = aPosts.findIndex(oPost => oPost.id === sId);
      if (idxFndPost === -1) {
        throw new Error(`post not found: ${sId}`);
      }
      oDeletedPost = aPosts[idxFndPost];
      aPosts.splice(idxFndPost, 1);
    })
    .then(() => saveDb(aPosts))
    .then(() => oDeletedPost);
}

module.exports = {
  createPost,
  readPost,
  updatePost,
  deletePost,
};

/* ========= TEST CODE ========== */

// createPost({ title: "Today's weather", content: "warming" })
  // .then((oPost) => {
  //   console.log("Added: ", oPost);
  // });

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
