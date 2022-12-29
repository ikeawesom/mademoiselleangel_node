// // helper functions
// export function ValidateEmail(input) {
//     var validRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//     if (input.match(validRegex)) {return true;}
//     else {return false;}
// }

// export function resetSession() {
//     auth.signOut().then(function() {
//         alert("You will been signed out!");
//         sessionStorage.clear();
//     }).catch((error) =>{
//         alert("An error "+error+" occured. Please contact Ike for assistance.");
//     });  
//     onAuthStateChanged(auth ,() => {
//         window.location.href = "/";
//     })
// }

// export function checkLength(value) {
//     return value.length >= 8;
// }

// export function checkCaps(value) {
//     const caps = /[A-Z]/g;
//     return value.match(caps);
// }

// export function checkLow(value) {
//     const low = /[a-z]/g;
//     return value.match(low);
// }

// export function checkNumber(value) {
//     const numbers = /[0-9]/g;
//     return value.match(numbers);
// }

// export function clearProductSession(){
//     sessionStorage.removeItem("title");
//     sessionStorage.removeItem("desc");
//     sessionStorage.removeItem("prices");
//     sessionStorage.removeItem("filename");
//     sessionStorage.removeItem("add-item");
// }

// export function fileExists(url) {
//     if(url){
//         var req = new XMLHttpRequest();
//         req.open('GET', url, false);
//         req.send()
//         return req.status==200;
//     } else {
//         return false;
//     }
// }

// export function updateMenu(title,element,text_div) {
//     get(ref(DB,`Products/${title}`))
//     .then((snapshot) => {
//         const status = snapshot.val()["Menu"];
//         // Inside the menu
//         if (status) {
//             // Remove from menu
//             update(ref(DB,`Products/${title}`), {
//                 Menu: 0
//             })
//             .then(()=>{
//                 element.style.transition = "0.4s"
//                 element.classList.remove("in-menu");
//                 element.classList.add("no-menu");
//                 text_div.innerHTML = "Add to Menu";
//                 setTimeout(() => {
//                     element.style.transition = "0s";
//                 }, 500);
//             })
//             .catch((error)=>{
//                 alert(`ERROR ${error.code}: ${error.message}`);
//             })
//         } else {
//             // Add to menu
//             update(ref(DB,`Products/${title}`), {
//                 Menu: 1
//             })
//             .then(()=>{
//                 element.style.transition = "0.4s"
//                 element.classList.remove("no-menu");
//                 element.classList.add("in-menu");
//                 setTimeout(() => {
//                     element.style.transition = "0s";
//                 }, 500);
//                 text_div.innerHTML = "Remove from Menu";
//             })
//             .catch((error)=>{
//                 alert(`ERROR ${error.code}: ${error.message}`);
//             })
//         }
//     })
//     .catch((error) => {
//         alert(`ERROR ${error.code}: ${error.message}`);
//     })
// }

// export function getCollection() {
//     const collection_text = document.querySelector("#collection-date");

//     // get date from firebase
//     get(ref(DB,"Dates/Collection"))
//     .then((snapshot) => {
//         collection_text.innerHTML = snapshot.val();
//     })
// }
