const { initializeApp } = require("firebase/app");
const path = require('path');
const { getDatabase, set, get, onValue, update, remove, ref, child } = require('firebase/database');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence, updateEmail, updatePassword } = require('firebase/auth');
// import {getDatabase, set, get, onValue, update, remove, ref, child} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence, updateEmail, updatePassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

function envs() {
    require('dotenv').config();
    require('dotenv').config({path: path.resolve(__dirname,'.env')});
    const declareEnv = (name) => {return process.env[name]}
    globalThis.API_KEY = declareEnv("FB_API_KEY");
    globalThis.DOMAIN = declareEnv("FB_DOMAIN");
    globalThis.DB_URL = declareEnv("FB_DB_URL")
    globalThis.PROJ_ID = declareEnv("FB_PROJ_ID");
    globalThis.STR_B = declareEnv("FB_STR_B")
    globalThis.SID = declareEnv("FB_SID")
    globalThis.APP_I = declareEnv("FB_APP_ID")
    globalThis.M_ID = declareEnv("FB_M_ID")
}

envs();

const firebaseConfig = {
    apiKey: API_KEY,
    authDomain: DOMAIN,
    databaseURL: DB_URL,
    projectId: PROJ_ID,
    storageBucket: STR_B,
    messagingSenderId: SID,
    appId: APP_I,
    measurementId: M_ID
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

exports.admin_control = (req,res) => {
    const { option } = req.body;
    if (option === "logoff") {
        auth.signOut().then(()=>{
            return res.sendStatus(200)
        })
        .catch((error) => {
            return res.status(400).json({
                code: error.code,
                msg: error.message
            })
        })
    }
    else if (option === "announce") {
        get(ref(DB,"Announcements/"))
        .then((snapshot) => {
            res.status(200).send(snapshot.val());
        })
        .catch((error) => {
            res.status(400).json({
                code: error.code,
                msg: error.message
            })
        })
    }
    else if (option === "updateMenu") {
        const { title } = req.body;
        get(ref(DB,`Products/${title}`))
        .then((snapshot) => {
            const status = snapshot.val()["Menu"];
            console.log("Current:",title, status);
            // Inside the menu
            if (status) {
                // Remove from menu
                update(ref(DB,`Products/${title}`), {
                    Menu: 0
                })
                .then(()=>{
                    console.log(`${title} removed from menu`)
                    res.status(200).json({
                        added:"false"
                    });
                })
                .catch((error)=>{
                    res.status(400).json({
                        code:error.code,
                        msg:error.message
                    })
                })
            } else {
                // Add to menu
                update(ref(DB,`Products/${title}`), {
                    Menu: 1
                })
                .then(()=>{
                    res.status(200).json({
                        added:"true"
                    });
                })
                .catch((error)=>{
                    res.status(400).json({
                        code:error.code,
                        msg:error.message
                    })
                })
            }
        })
        .catch((error) => {
            alert(`ERROR ${error.code}: ${error.message}`);
        })
    }
    else {
        return res.sendStatus(400);
    }
}