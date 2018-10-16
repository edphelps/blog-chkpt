
const URL = "http://localhost:3000/posts/";

/* ====================================================
*  utils

* ===================================================== */
function determinePost() {
  // return post# from hash "#/posts/123/edit"
  return window.location.hash.replace('#/posts/','').replace(/\/.+/,'')
}
function goToPost(post) {
  // set hash to "#/posts/123"
  window.location.hash = `#/posts/${post.id}`
}

function sidebarItem(post) {
  return `
    <a href="#/posts/${post.id}" class="list-group-item list-group-item-action">
      ${post.title}
    </a>
  `;
}
function sidebarTemplate(posts, iCurrPost) {
  const opening = `<ul class="list-group" id='list-of-posts'>`;
  const closing = `</ul>`;
  const items = posts.map(sidebarItem).join('');
  return opening + items + closing;
}
function renderList(aPosts, iCurrPost) {
  const divPostSel = document.getElementById("div-post-sel")
  divPostSel.innerHTML = sidebarTemplate(aPosts, iCurrPost);
  const listOfPosts = document.getElementById('list-of-posts');
  console.log("listOfPosts: ", listOfPosts);

  const ahrefs = listOfPosts.querySelectorAll('a');
  for (const ahref of ahrefs) {
    console.log("ahref: ", ahref);
  }
  // for (let node of document.getElementById('list-of-posts').childNodes) {
  //   console.log("node: ", node);
  // }
}
function renderBlogPost(oPost) {
  document.getElementById("title").value = (oPost) ? oPost.title : "--";
  document.getElementById("content").value = (oPost) ? oPost.content : "--";
}

/* ====================================================
*  init()
*
*  Initialize the page, called on all hash changes
* ===================================================== */
function init() {
  const hash = window.location.hash;
  console.log(`--- init(${hash})`, (new Date()).toString().slice(16,24));

  // get all posts
  axios.get(URL)
    .then((oResponse) => {
      const aPosts = oResponse.data;

      // render selection list of posts
      let idCurrPost = determinePost();
      if (!idCurrPost) {
        goToPost(aPosts[0]);
        idCurrPost = determinePost();
      }
      renderList(aPosts, idCurrPost);

      // render the post edit area
      const currPost = aPosts.find(post => post.id === idCurrPost);
      renderBlogPost(currPost);
    })
    .catch((error) => {
      // display AJAX error msg
      console.log("---------- AJAX error ----------");
      console.log(`${error}`);
      console.log("^^^^^^^^^^ AJAX error ^^^^^^^^^^");
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
function onclickSave() {

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

  document.getElementById("btn-create").onclick = onclickCreate;
  document.getElementById("btn-save").onclick = onclickSave;

  init(); // do a manual call in case user refreshed page, which causes it
          // to clear but doesn't change the hash so onhashchange() won't fire

  // render everything when the window url hash changes
  window.onhashchange = init;
});
