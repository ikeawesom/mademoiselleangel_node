const { initializeApp } = require("firebase/app");
const path = require('path');
const { getDatabase, set, get, onValue, update, remove, ref, child } = require('firebase/database');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence, updateEmail, updatePassword } = require('firebase/auth');
require('dotenv').config();
// import {getDatabase, set, get, onValue, update, remove, ref, child} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence, updateEmail, updatePassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

require('dotenv').config({path: path.resolve(__dirname,'.env')});

// console.log(__dirname);
// // console.log(curDir);
// console.log(process.cwd());

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
const auth = getAuth(app);

exports.signOut = auth;

// Initialise DB from firebase
const DB = getDatabase();

exports.allProducts_control = (req,res) => {
    get(ref(DB,"Products/"))
    .then((snapshot) => {
        return res.status(200).json(snapshot.val());
    })
    .catch((error)=>{
        console.log(error);
    })
}

exports.lastOrder_control = (req,res) => {
    get(ref(DB,"Dates/Collection"))
    .then((snapshot) => {
        return res.status(200).json({date:snapshot.val()});
    })
    .catch((error) => {
        console.log(error);
    });
}

exports.newsletter_control = (req,res) => {
    const { parcel } = req.body;

    if (!parcel) {
        return res.status(400).json({status:"failed"});
    }
    set(ref(DB,`Newsletter/${parcel}`), {
        Mail: true,
    }).then(()=>{
        return res.status(200).json({status:"success"});
    }).catch((error) => {
        console.log(error);
        return res.status(400).json({status:"failed"});
    });
}

exports.paynow_control = (req,res) => {
    const { curDay, curTime, email, id, cart, paid } = req.body;
    if (!curDay) {
        return res.status(400).json({status:"failed"});
    }
    set(ref(DB,`paynowOrders/${curDay}/${curTime}`), {
        email: email,
        id: id,
        cart: cart,
        paid: paid
    })
    .then(()=> {
        return res.status(200).json({status:"success"});
    })
    .catch((error) => {
        console.log(error);
    })
}


exports.auth_control = (req,res) => {
    console.log("auth control")
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            get(ref(DB,`Admins/${user.uid}`))
            .then((snapshot) => {
                if (snapshot.val()) {
                    console.log("inside dashboard");
                    res.status(200).json({
                        allow:"true",
                        id: snapshot.val()["displayName"]
                    })
                } else {
                    console.log("invalid access");
                    res.status(200).json({
                        allow:"false",
                        id: user.displayName
                    })
                }
            })
            .catch((error)=> {
                console.log("ERROR:",error);
                res.sendStatus(400);
            })
        } else {
            console.log("logged out dashboard")
            res.sendStatus(400);
        }
    })
    
    unsubscribe();    
}

exports.login_control = (req,res) => {
    const { email, pass } = req.body;

    setPersistence(auth, browserSessionPersistence)
    .then(() => {
        signInWithEmailAndPassword(auth, email, pass)
        .then(() => {
            console.log("success sign in")
            return res.sendStatus(200)
        })
        .catch((error)=>{
            console.log(error)
            return res.sendStatus(400);
        })
    })
    .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(`ERROR ${errorCode}: ${errorMessage}`);
        return res.sendStatus(400);
    });
}