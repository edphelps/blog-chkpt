
const URL = "http://localhost:3000/posts/";

/* ====================================================
*  utils

* ===================================================== */
function determinePost() {
  // return post# from hash "#/posts/123/edit"
  return window.location.hash.replace('#/posts/','').replace(/\/.+/,'')
}
function determineCmd() {
  // return 'edit' from hash "#/posts/123/edit"
  // return 'delete' from hash "#/posts/123/delete"
  // return 'save' from hash "#/posts/123/save"
  // return 'new' from hash "#/posts/new"
  // return '' from "#/posts/123"
  return window.location.hash.replace('#/posts/','').replace(/[0-9]\//,'');
}
function goToPost(post) {
  // set hash to "#/posts/123"
  window.location.hash = `#/posts/${post.id}`
}

function listItem(post) {
  return `
    <a href="#/posts/${post.id}" class="list-group-item list-group-item-action">
      ${post.title}
    </a>
  `;
}
function listTemplate(posts) {
  const opening = `<ul class="list-group" id='list-of-posts'>`;
  const closing = `</ul>`;
  const items = posts.map(listItem).join('');
  return opening + items + closing;
}
function renderList(aPosts, idCurrPost) {

  // create the <ul> list of <a> tags of blog titles
  // <a> tags are "#/posts/123"
  const divPostSel = document.getElementById("div-post-sel");
  divPostSel.innerHTML = listTemplate(aPosts);
  const listOfPosts = document.getElementById('list-of-posts');
  console.log("listOfPosts: ", listOfPosts);

  // select/highlight the current post from the list
  const ahrefs = listOfPosts.querySelectorAll('a');
  for (const ahref of ahrefs) {
    const ahrefPostId = ahref.href.split("#/posts/")[1];
    if (ahrefPostId === idCurrPost) {
      ahref.classList.add("active");
      break;
    }
  }
}

function displayPostTemplate(oPost) {
  return `<h3 id="title">${oPost.title}</h3>`
    + `<p id="content">${oPost.content}</p><br>`
    + `<p class="text-right"><a id="edit-post" href="#/posts/${oPost.id}/edit">edit</a>&nbsp;&nbsp;`
    + `<a id="delete-post" href="#/posts/${oPost.id}/delete">delete</a></p>`
}
function renderDisplayPost(oPost) {
  const divBlogPost = document.getElementById("div-blog-post");
  divBlogPost.innerHTML = displayPostTemplate(oPost);
}

function onclickSave() {
  const url = URL + determinePost();
  const oPost = {
    title: document.getElementById('title').value,
    content: document.getElementById('content').value,
  };
  console.log("*** put url: ", url);
  console.log("*** put val: ", oPost);
  axios.put(url, oPost)
    .then((response) => {
      console.log("axios put success response: ", (response) ? response : "missing response");
      // this will generate a data/render refresh
      window.location.hash = `#/posts/${determinePost()}`;
      console.log("NEW HASH AFTER PUT: ", window.location.hash);
    })
    .catch((error) => {
      // display AJAX error msg
      console.log("---------- AJAX put error ----------");
      console.log(error);
      console.log("^^^^^^^^^^ AJAX put error ^^^^^^^^^^");
    });
}

function editPostTemplate(oPost) {
  return `<input id="title" value="${oPost.title}">`
    + `<textarea id="content">${oPost.content}</textarea><br>`
    + `<button onclick="onclickSave()">Save</button>`;
}
function renderEditPost(oPost) {
  const divBlogPost = document.getElementById("div-blog-post");
  divBlogPost.innerHTML = editPostTemplate(oPost);
}

function deletePost(id) {
  console.log("Deleting post: ", id);
  const url = URL + id
  return axios.delete(url);
}

/* ====================================================
*  init()
*
*  Initialize the page, called on all hash changes
* ===================================================== */
function init() {
  const hash = window.location.hash;
  console.log(`--- init(${hash})`, (new Date()).toString().slice(16,24));

  // get all posts and render display
  axios.get(URL)
    .then((oResponse) => {
      // get posts sorted with most recently added first
      const aPosts = oResponse.data.sort((p1, p2) => p2.added.localeCompare(p1.added));

      // get the optional command
      let sCmd = determineCmd(hash);

      // get the current post id
      let idCurrPost = determinePost();
      if (!idCurrPost) {
        goToPost(aPosts[0]);
        idCurrPost = determinePost();
        sCmd = ""; // clear the command so we don't execute command on aPost[0]
      }

      // get current post
      const currPost = aPosts.find(post => post.id === idCurrPost);

      console.log('~~~~ sCmd: ', sCmd);
      switch (sCmd) {
        case 'edit':
          // render the edit post display area
          renderEditPost(currPost);
          return;
        case 'delete':
          deletePost(determinePost())
            .then((response) => {
              console.log("axios delete success response: ", response);
              // this will generate a data/render refresh
              window.location.hash = "#";
            })
            .catch((error) => {
              console.log("---------- AJAX delete error ----------");
              console.log(error);
              console.log("^^^^^^^^^^ AJAX delete error ^^^^^^^^^^");
            });
          return;
        default:
          // ignore unknown command
      }

      // render selection list of posts
      renderList(aPosts, idCurrPost);

      // render the post display area
      // const currPost = aPosts.find(post => post.id === idCurrPost);
      renderDisplayPost(currPost);
    })
    .catch((error) => {
      // display AJAX error msg
      console.log("---------- AJAX load error ----------");
      console.log(error);
      console.log("^^^^^^^^^^ AJAX load error ^^^^^^^^^^");
    });
}

/* ====================================================
*  toggleAddNew() */
/*
*  Toggle visibility of div-add-new and div-existing-post
*  in resopnse to clicking "Add a new blog post" or "Save"
*  when adding a new post
*
* ===================================================== */
// function toggleAddNewFields() {
//   const btnAddNew = document.getElementById("btn-create-post");
//   const divNewPost = document.getElementById("div-new-post");
//   const divExistingPosts = document.getElementById("div-existing-posts");
//
//   // Show fields to add new post
//   if (divNewPost.hidden) {
//     btnAddNew.innerText = "Cancel new post";
//     divNewPost.hidden = false;
//     divExistingPosts.hidden = true;
//
//   // cancel adding new post
//   } else {
//     btnAddNew.innerText = "Add a new blog post";
//     document.getElementById("title").value = "";
//     document.getElementById("content").value = "";
//     divNewPost.hidden = true;
//     divExistingPosts.hidden = false;
//   }
// }

/* ====================================================
*  onclickCreate()
*
*  Click to add a new post.
*    toggle visibility of div-add-new and div-existing-post
*
* ===================================================== */
function onclickCreate() {
  // toggleAddNewFields();
}

/* ====================================================
*  onclickSave()
*
*  Click to add a new post
*    toggle visibility of div-add-new and div-existing-post
*
* ===================================================== */
function XXXonclickSave() {

  const sTitle = document.getElementById("title").value.trim();
  const sContent = document.getElementById("content").value.trim();

  // verify title and content fields are filled in
  if (!sTitle || !sContent) {
    window.alert("You must enter both a title and content");
    return;
  }

  // create new blog post in database
  const url = URL;
  const oPost = {
    title: sTitle,
    content: sContent,
  };
  axios.post(url, oPost)
    .then((oResponse) => {
      // console.log("-- POST response --");
      // console.log(`Data:${JSON.stringify(oResponse)}`);
      // console.log("^^^POST response ^^^^^^^^");
      console.log("--- AJAX SUCCESS ----");
    })
    .catch((error) => {
      // display AJAX error msg
      console.log("---------- AJAX POST error ---------");
      console.log(`${error}`);
      console.log("--------------- ERROR --------------");
      // updateStatus(error.response.data.message);
      // console.log("^^^^ ERROR ^^^^");
    })
    .then(() => {
      // console.log("~~ toggleAddNewFields");
      toggleAddNewFields();
    });
}

/* ====================================================
*  DOM Loaded
*
*  Init UI and setup event handlers
* ===================================================== */
document.addEventListener('DOMContentLoaded', () => {

  // init(); // asynch

  // document.getElementById("btn-create").onclick = onclickCreate;
  // document.getElementById("btn-save").onclick = onclickSave;

  init(); // do a manual call in case user refreshed page, which causes it
          // to clear but doesn't change the hash so onhashchange() won't fire

  // render everything when the window url hash changes
  window.onhashchange = init;
});
