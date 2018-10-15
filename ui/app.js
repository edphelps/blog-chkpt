

/* ====================================================
*  onchangeSelRole()
*
*  Change in selection list changes the image
* ===================================================== */
function onchangeSelRole() {
  const selRole = document.getElementById("sel-role");
  const sImgPath = selRole.options[selRole.selectedIndex].value;
  // console.log(`New img: ${sImgPath}`);
  const imgRole = document.getElementById("img-role");
  imgRole.src = sImgPath;
}

let gIntervalKey = 0;
let gFadeOpacity = 0;
let gFadeUp = true;

function fadeStatus() {

  const elemStatus = document.getElementById("save-status");

  if (gFadeOpacity >= 2.5) {
    gFadeUp = false;
  }

  if (gFadeUp)
    gFadeOpacity += 0.2;
  else
    gFadeOpacity -= 0.2;

  elemStatus.style.opacity = gFadeOpacity;

  if (gFadeOpacity <= 0) {
    clearInterval(gIntervalKey);
    gIntervalKey = 0;
    updateStatus("");
  }
}


/* ====================================================
*  updateStatus()
*
*  Update the status Display
* ===================================================== */
function updateStatus(msg) {
  console.log("updateStatus: "+msg);
  // console.log("^^update status ^^^");

  const elemStatus = document.getElementById("save-status");
  if (msg) {
    elemStatus.style.display = "block";
    elemStatus.innerText = msg;
    gFadeUp = true;
    gFadeOpacity = 0
    elemStatus.style.opacity = 0;
    gIntervalKey = setInterval(fadeStatus,100);
  } else {
    elemStatus.style.display = "none";
    elemStatus.innerText = "";
  }
}

/* ====================================================
*  onsubmit()
*
*  Change in selection list changes the image
* ===================================================== */
function onsubmit(e) {
  e.preventDefault(); // either this or return false to prevent an actual submit from ocurring
  console.log("onsubmit()");

  updateStatus("");

  const sFname = document.getElementById("fname").value.trim();
  const sLname = document.getElementById("lname").value.trim();

  const selRole = document.getElementById("sel-role");
  const sRole = selRole.options[selRole.selectedIndex].innerText;
  // console.log("role: "+sRole);
  // if (!sFname || !sLname || selRole.selectedIndex===0) {
  //   console.log("** form not valid **");
  //   return;
  // }

  let oPost = {};
  oPost.firstName = sFname;
  oPost.lastName = sLname;
  oPost.role = sRole;

  console.log("### Post object: "+JSON.stringify(oPost));

  const URL = "https://galvanize-student-apis.herokuapp.com/gpersonnel/users";

  axios.post(URL,oPost)
    .then((oResponse) => {
      // console.log("-- POST response --");
      // console.log(`Data:${JSON.stringify(oResponse)}`);
      // console.log("^^^POST response ^^^^^^^^");
      // console.log("--- SUCCESS ----");
      updateStatus(oResponse.data.message);
      // console.log("^^^ SUCCESS ^^^^");
      // console.log("yay, success");
    }) // then
    .catch((error) => {
      // display AJAX error msg
      // console.log("-- POST error --");
      // console.log(`${error}`); // I don't understand what error is??
      // console.log("--- ERROR ---");
      updateStatus(error.response.data.message);
      // console.log("^^^^ ERROR ^^^^");
    }); // catch

  // return false; // either this or e.preventdefault() above since the submit
                   // was handled above, don't want the form to actually submit.
}

/* ====================================================
*  init()
*
*  Load the selection list of roles via axios
* ===================================================== */
function init() {
  return;
  // LOAD ROLES IN SELECTION LIST
  const URL = "https://galvanize-student-apis.herokuapp.com/gpersonnel/roles";
  axios.get(URL)
    .then((oResponse) => {
      // console.log("-- response --");
      // console.log(`Data:${JSON.stringify(oResponse)}`);
      // console.log("^^^^^^^^^^^^^^");
      const selRole = document.getElementById("sel-role");
      for (const selection of oResponse.data) {
        // console.log(JSON.stringify(selection));
        const elemOption = document.createElement("option");
        elemOption.value = selection.img;
        elemOption.innerText = selection.title;
        selRole.appendChild(elemOption);
      }

    }) // then
    .catch((error) => {
      // display AJAX error msg
      console.log("---------- AJAX error ----------");
      console.log(`${error}`);
      console.log("^^^^^^^^^^ AJAX error ^^^^^^^^^^");
    }); // catch
}

/* ====================================================
*  toggleAddNew()
*
*  Toggle visibility of div-add-new and div-existing-post
*  in resopnse to clicknig "Add a new blog post" or "Save"
*  when adding a new post
*
* ===================================================== */
function toggleAddNewFields() {
  const btnAddNew = document.getElementById("btn-add-new");
  const divNewPost = document.getElementById("div-new-post");
  const divExistingPosts = document.getElementById("div-existing-posts");

  // Show fields to add new post
  if (divNewPost.hidden) {
    btnAddNew.innerText = "Cancel new post";
    divNewPost.hidden = false;
    divExistingPosts.hidden = true;

  // cancel adding new post
  } else {
    btnAddNew.innerText = "Add a new blog post";
    document.getElementById("title").value = "";
    document.getElementById("content").value = "";
    divNewPost.hidden = true;
    divExistingPosts.hidden = false;
  }
}

/* ====================================================
*  onclickAddNew()
*
*  Click to add a new post.
*    toggle visibility of div-add-new and div-existing-post
*
* ===================================================== */
function onclickAddNew() {
  toggleAddNewFields();
}

/* ====================================================
*  onclickSaveNew()
*
*  Click to add a new post.
*    toggle visibility of div-add-new and div-existing-post
*
* ===================================================== */
function onclickSaveNew() {

  const sTitle = document.getElementById("title").value.trim();
  const sContent = document.getElementById("content").value.trim();

  // verify title and content fields are filled in
  if (!sTitle || !sContent) {
    window.alert("You must enter both a title and content");
    return;
  }

  // create new blog post in database
  const URL = "https://galvanize-student-apis.herokuapp.com/gpersonnel/users";

  axios.post(URL,oPost)
    .then((oResponse) => {
      // console.log("-- POST response --");
      // console.log(`Data:${JSON.stringify(oResponse)}`);
      // console.log("^^^POST response ^^^^^^^^");
      // console.log("--- SUCCESS ----");
      updateStatus(oResponse.data.message);
      // console.log("^^^ SUCCESS ^^^^");
      // console.log("yay, success");
    }) // then
    .catch((error) => {
      // display AJAX error msg
      // console.log("-- POST error --");
      // console.log(`${error}`); // I don't understand what error is??
      // console.log("--- ERROR ---");
      updateStatus(error.response.data.message);
      // console.log("^^^^ ERROR ^^^^");
    }); // catch


  toggleAddNewFields();
  return;
}

/* ====================================================
*  DOM Loaded
*
*  Init UI and setup event handlers
* ===================================================== */
document.addEventListener('DOMContentLoaded', () => {

  init(); // asynch

  document.getElementById("btn-add-new").onclick = onclickAddNew;
  document.getElementById("btn-save-new").onclick = onclickSaveNew;

  // document.getElementById("sel-role").onchange = onchangeSelRole;
  // document.getElementById("save-btn").onclick = onclickSaveBtn;
  // document.getElementById("form").onsubmit = onsubmit;

});
