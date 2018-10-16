const express = require('express');

const router = express.Router();
const model = require('./model.js');

const chkBodyParams = require('./params').chkBodyParams;

/* **************************************************
*  POST /posts
*  Add a new blog post
*  @body title
*  @body content
*  @return the new blog post record with id or forwards w/ next(Error)
http POST localhost:3000/posts title='My entry' content='My thoughts...'
***************************************************** */
router.post('', (req, res, next) => {
  const oParams = {
    title: 'string',
    content: 'string',
  };
  if (!chkBodyParams(oParams, req, res, next))
    return;
  const oPost = {
    title: req.body.title,
    content: req.body.content,
  };
  model.createPost(oPost)
    .then((newPost) => {
      res.status(201).json(newPost);
    })
    .catch((error) => {
      error.status = 400;
      next(error);
    });
});

/* **************************************************
*  GET /posts
*  Return array of all posts
http GET localhost:3000/posts
***************************************************** */
router.get('', (req, res, next) => {
  model.readPost()
    .then((aPosts) => {
      res.status(200).json(aPosts);
    })
    .catch((error) => {
      error.status = 400;
      next(error);
    });
});

/* **************************************************
*  GET /posts/:id
*  Return the post
http GET localhost:3000/posts/123
***************************************************** */
router.get('/:id', (req, res, next) => {
  model.readPost(req.params.id)
    .then((oPost) => {
      res.status(200).json(oPost);
    })
    .catch((error) => {
      error.status = 404;
      next(error);
    });
});

/* **************************************************
*  PUT /posts/:id
*  Update the post
*  @body title
*  @body content
*  Return, the updated post record
http PUT localhost:3000/posts/123 title='new title' content='new content'
***************************************************** */
router.put('/:id', (req, res, next) => {
  const oParams = {
    title: 'string',
    content: 'string',
  };
  if (!chkBodyParams(oParams, req, res, next))
    return;

  const oPost = {
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
  };
  model.updatePost(oPost)
    .then((updatedPost) => {
      res.status(201).json(updatedPost);
    })
    .catch((error) => {
      error.status = 400;
      next(error);
    });
});

/* **************************************************
*  DELETE /posts/:id
*  Delete the post
*  Return, the deleted record
http DELETE localhost:3000/posts/d2ce2414-f1f8-4ac3-baf4-7e2c0dee0594
***************************************************** */
router.delete('/:id', (req, res, next) => {
  model.deletePost(req.params.id)
    .then((oPost) => {
      res.status(200).json(oPost);
    })
    .catch((error) => {
      error.status = 404;
      next(error);
    });
});




// /* **************************************************
// *  POST /posts/:postid/authors
// *  Add a new author
// *  @body first
// *  @body last
// *  @return the new author record with id or forwards w/ next(Error)
// http POST localhost:3000/posts/91eabf57-f817-42ca-914b-5517120acde6/authors first='Ed' last='Phelps'
// ***************************************************** */
// router.post('/:postId/authors', (req, res, next) => {
//   const oParams = {
//     first: 'string',
//     last: 'string',
//   };
//   if (!chkBodyParams(oParams, req, res, next))
//     return;
//
//   model.createPostAuthor(req.params.postId, req.body.first, req.body.last)
//     .then((newAuthor) => {
//       res.status(201).json(newAuthor);
//     })
//     .catch((error) => {
//       error.status = 400;
//       next(error);
//     });
// });
//
// /* **************************************************
// *  GET /posts/:postId/authors
// *  Return array of all authors of post
// http GET localhost:3000/posts/91eabf57-f817-42ca-914b-5517120acde6/authors
// ***************************************************** */
// router.get('/:postId/authors', (req, res, next) => {
//   model.readPostAuthor(req.params.postId)
//     .then((aAuthors) => {
//       res.status(200).json(aAuthors);
//     })
//     .catch((error) => {
//       error.status = 400;
//       next(error);
//     });
// });
//
// /* **************************************************
// *  GET /posts/:postId/authors/:id
// *  Return specific author of post
// http GET localhost:3000/posts/91eabf57-f817-42ca-914b-5517120acde6/authors/91eabf57-f817-42ca-914b-5517120acde8
// ***************************************************** */
// router.get('/:postId/authors/:id', (req, res, next) => {
//   model.readPostAuthor(req.params.postId, req.params.id)
//     .then((oAuthor) => {
//       res.status(200).json(oAuthor);
//     })
//     .catch((error) => {
//       error.status = 400;
//       next(error);
//     });
// });
//
// /* **************************************************
// *  PUT /posts/:postId/aithors/:id
// *  Update the author
// *  @body first
// *  @body last
// *  Return, the updated author record
// http PUT localhost:3000/posts/91eabf57-f817-42ca-914b-5517120acde6/authors/995e7eb0-8bf5-4444-a513-d347b8b605f8 first='Edwin' last='DuBow'
// ***************************************************** */
// router.put('/:postId/authors/:id', (req, res, next) => {
//   const oParams = {
//     first: 'string',
//     last: 'string',
//   };
//   if (!chkBodyParams(oParams, req, res, next))
//     return;
//
//   const oAuthor = {
//     id: req.params.id,
//     first: req.body.first,
//     last: req.body.last,
//   };
//   model.updatePostAuthor(req.params.postId, oAuthor)
//     .then((updatedAuthor) => {
//       res.status(201).json(updatedAuthor);
//     })
//     .catch((error) => {
//       error.status = 400;
//       next(error);
//     });
// });
//
// /* **************************************************
// *  DELETE /posts/:postId/authors/:id
// *  Delete the aither from the post
// *  Return, the deleted record
// http DELETE localhost:3000/posts/91eabf57-f817-42ca-914b-5517120acde6/authors/995e7eb0-8bf5-4444-a513-d347b8b605f8
// ***************************************************** */
// router.delete('/:postId/authors/:id', (req, res, next) => {
//   model.deletePostAuthor(req.params.postId, req.params.id)
//     .then((oAuthor) => {
//       res.status(200).json(oAuthor);
//     })
//     .catch((error) => {
//       error.status = 404;
//       next(error);
//     });
// });

module.exports = router;
