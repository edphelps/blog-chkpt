
const URL = "http://localhost:3000/posts/";


// NOTE: minimal commenting used, easiest to read by
//       compressing all the functions down with the arrow in left margin.


// return post# from hash "#/posts/123/edit"
function determinePost() {
  // remove "#/posts/" and remove everything following
  return window.location.hash.replace('#/posts/','').replace(/\/.+/,'')
}
// returned command at the end of the hash: "#/posts/123/edit"
function determineCmd() {
  return window.location.hash.replace('#/posts/','').replace(/[0-9]\//,'');
}
// add the post number to the hash "#/posts/123"
function goToPost(post) {
  window.location.hash = `#/posts/${post.id}`
}

// manage the selection list of assignments
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

// manage displaying the current post
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

// manage editing and saving an existing post
function savePost() {
  const url = URL + determinePost();
  const oPost = {
    title: document.getElementById('title').value,
    content: document.getElementById('content').value,
  };
  console.log("*** put url: ", url);
  console.log("*** put val: ", oPost);
  return axios.put(url, oPost);
}
function onclickSave() {
  window.location.hash = `#/posts/${determinePost()}/save`;
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

// manage creating a new post
function addPost() {
  const url = URL;
  const oPost = {
    title: document.getElementById('title').value,
    content: document.getElementById('content').value,
  };
  console.log("*** post url: ", url);
  console.log("*** post val: ", oPost);
  return axios.post(url, oPost);
}
function onclickSaveNew() {
  console.log("----- onclickSaveNew!");
  window.location.hash = `#/posts/add`;
}
function newPostTemplate() {
  return `<input id="title" value="">`
    + `<textarea id="content"></textarea><br>`
    + `<button onclick="onclickSaveNew()">Add</button>`;
}
function renderNewPost(oPost) {
  const divBlogPost = document.getElementById("div-blog-post");
  divBlogPost.innerHTML = newPostTemplate(oPost);
}
function onclickCreate() {
  // handle the "create-post" button in the heading
  window.location.hash = `#/posts/new`;
}

// handle the delete link for an existing post
function deletePost(id) {
  console.log("Deleting post: ", id);
  const url = URL + id
  return axios.delete(url);
}

// Render page and handle commands, called on all hash changes
function init() {
  const { hash } = window.location;
  console.log(`--- init(${hash})`, (new Date()).toString().slice(16, 24)); // display w/ time

  // get all blog posts and handle command or render fresh display
  // since the goal of the hash is to be able to bookmark the URL we can't assume
  // that the app has an existing state or already loaded list of blog posts to
  // grab information from.

  // load all posts (more efficient to cache these or only load titles
  // then get content for current blog post)
  axios.get(URL)
    .then((oResponse) => {
      // sort posts in reverse data order so most recent is first
      const aPosts = oResponse.data.sort((p1, p2) => p2.added.localeCompare(p1.added));

      // get the optional command
      let sCmd = determineCmd(hash);

      // get the current post id
      let idCurrPost = determinePost();
      if (!idCurrPost) { // if loading page w/o a post number
        goToPost(aPosts[0]);
        idCurrPost = determinePost();
        sCmd = ""; // clear the command so we don't execute a command on aPost[0]
      }

      // get current post
      const currPost = aPosts.find(post => post.id === idCurrPost);

      // react to cmd
      console.log('~~~~ sCmd: ', sCmd);
      switch (sCmd) {

        // handle create-post btn and setup empty data entry section for a new post
        case 'new':
          renderNewPost();
          return;

        // handle Save button of a new post
        case 'add':
          addPost()
            .then((response) => {
              console.log("axios add success response: ", (response) ? response : "missing response");
              // this will generate a data/render refresh
              window.location.hash = `#/posts/${response.data.id}`;
              console.log("NEW HASH AFTER add: ", window.location.hash);
            })
            .catch((error) => { // TODO: can this be removed and have the final catch below catch the error???
              // display AJAX error msg
              console.log("---------- AJAX add error ----------");
              console.log(error);
              console.log("^^^^^^^^^^ AJAX add error ^^^^^^^^^^");
            });
          return;

        // handle Edit button of an existing post
        case 'edit':
          // render the edit post display area
          renderEditPost(currPost);
          return;

        // handle the Save button when editing existing post
        case 'save':
          savePost()
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
          return;

        // handle delete button of an existing post
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

        // the parse is dumb so it gets other things as commands like the post# for "/#posts/123"
        default:
          // ignore unknown command
      }

      // If there was no command then render list of posts and render the current post

      // render selection list of posts on left side
      renderList(aPosts, idCurrPost);

      // render the current post in the display area on the right
      renderDisplayPost(currPost);
    })
    .catch((error) => {
      // display AJAX error msg
      console.log("---------- AJAX load error ----------");
      console.log(error);
      console.log("^^^^^^^^^^ AJAX load error ^^^^^^^^^^");
    });
}

// DOM loaded
document.addEventListener('DOMContentLoaded', () => {

  // handler the the create-post button in the heading
  document.getElementById("create-post").onclick = onclickCreate;

  init(); // do a manual call in case user refreshed page, which causes it
          // to clear but doesn't change the hash so onhashchange() won't fire

  // render everything when the window url hash changes
  window.onhashchange = init;
});
