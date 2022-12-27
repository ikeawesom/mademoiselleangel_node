const { initializeApp } = require("firebase/app");
const {getDatabase, set, get, onValue, update, remove, ref, child} = require('firebase/database');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    onAuthStateChanged, setPersistence, browserSessionPersistence, updateEmail,
    updatePassword } = require('firebase/auth');
// import {getDatabase, set, get, onValue, update, remove, ref, child} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence, updateEmail, updatePassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

console.log("Entered firebase.js");

const firebaseConfig = {
    apiKey: "AIzaSyDsZ_OiNSr_TZKv5bEDeVmeewqqzMnPGt8",
    authDomain: "mademoiselle-ecommerce-724ce.firebaseapp.com",
    databaseURL: "https://mademoiselle-ecommerce-724ce-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mademoiselle-ecommerce-724ce",
    storageBucket: "mademoiselle-ecommerce-724ce.appspot.com",
    messagingSenderId: "218324369791",
    appId: "1:218324369791:web:068a52ce9a97dc0bb5da4a",
    measurementId: "G-0CN8EW3Q4J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const auth = getAuth(app);

// Initialise DB from firebase
const DB = getDatabase();
module.exports.database = DB;
module.exports.auth = getAuth(app);
