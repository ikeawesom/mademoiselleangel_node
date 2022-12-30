const { initializeApp } = require("firebase/app");
const path = require('path');
const { getDatabase, set, get, update, remove, ref, child } = require('firebase/database');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence, updateEmail, updatePassword } = require('firebase/auth');
const { getStorage, ref:sref, getDownloadURL, uploadBytes, deleteObject  } = require('firebase/storage');


function envs() {
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
    globalThis.ADMIN = declareEnv("ADMIN")
    globalThis.ADMIN_ = declareEnv("ADMIN_")
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

// -------------- Initialize Firebase -------------- //

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const DB = getDatabase()
const storage = getStorage(app);
// getDownloadURL(sref(storage,"product-Chocolate-Cookies-1.png"))
// .then((url)=>{
//     console.log(url);
// })

exports.signOut = auth;

// -------------- Cron Scheduling -------------- //

var cron = require('node-cron');
const colDates = ['10 February 2023', '10 March 2023', '7 April 2023', '5 May 2023', '2 June 2023', '30 June 2023', '28 July 2023', '25 August 2023', '22 September 2023', '20 October 2023', '17 November 2023', '15 December 2023']

var index = 0;
var day = 0;
var task = cron.schedule(`* */24 * * *`, () =>  {
    if (day<28) {
        day+=1
    }else {
        signInWithEmailAndPassword(auth,ADMIN,ADMIN_)
        .then(()=>{
            update(ref(DB,"Dates/"),{
                Collection: colDates[index]
            })
            .then(()=>{
                index += 1
            })
            .catch((error)=>{
                console.log("ERROR CHANING DATES");
                console.log(error);
            })
        })
        .catch((error)=>{
            console.log("auth error");
            console.log(error);
        })
        day = 0;
    }
  }, {
    scheduled: false
});
var countdown = cron.schedule('0 0 13 1 *', ()=>{
    task.start()
},{
    scheduled: false
})
   
// -------------- Export Routing Functions -------------- //

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
                        id: snapshot.val()["displayName"],
                        email: snapshot.val()["email"],
                        uid: user.uid
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
    else if (option === "orders") {
        get(ref(DB,"paynowOrders/"))
        .then((snapshot) => {
            res.status(200).json(snapshot.val());
        })
        .catch((error)=>{
            console.log(error);
        })
    }
    else if (option === "newsletter"){
        get(ref(DB,"Newsletter/"))
        .then((snapshot) => {
            res.status(200).json(snapshot.val());
        })
        .catch((error)=>{
            console.log(error);
            res.sendStatus(400);
        });
    } 
    else if (option === "admin") {
        const { new_email, new_pass } = req.body;

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Email Change
                if (new_email) {
                    // Update auth
                    updateEmail(user, new_email)
                    .then(() => {
                        // Update DB
                        update(ref(DB,`Admins/${user.uid}`),{
                            email: new_email
                        }).then(()=> {
                            auth.signOut().then(()=>{
                                res.sendStatus(200);
                            })
                            .catch((error)=>{
                                console.log(error);
                                res.sendStatus(400);
                            })
                        })
                        .catch((error)=>{
                            console.log(error)
                            res.sendStatus(400)
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        res.sendStatus(400);
                    });
                }
                // Pass Change
                else if (new_pass) {
                    updatePassword(user, new_pass)
                    .then(() => {
                        // Update DB
                        update(ref(DB,`Admins/${user.uid}`),{
                            password: new_pass
                        }).then(()=> {
                            auth.signOut().then(()=>{
                                res.sendStatus(200);
                            })
                            .catch((error)=>{
                                console.log(error);
                                res.sendStatus(400);
                            })
                        })
                        .catch((error)=>{
                            console.log(error)
                            res.sendStatus(400)
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        res.sendStatus(400);
                    });
                } else {
                    // get password from DB
                    console.log("here");
                    get(ref(DB,`Admins/${user.uid}`))
                    .then((snapshot) => {
                        console.log(snapshot.val()["password"]);
                        res.status(200).json({
                            status: snapshot.val()["password"]
                        })
                    })
                    .catch((error)=>{
                        console.log(error);
                        res.sendStatus(400);
                    })
                }
                
            } else {
                console.log("user logged out")
                res.sendStatus(400);
            }
        })
        
        unsubscribe(); 
    }
    else if (option === "dates") {
        const { auto, dateinput } = req.body;
        if (auto) {
            // Updating
            signInWithEmailAndPassword(auth,ADMIN,ADMIN_)
            .then(()=>{
                const date = new Date();
                const date_start = new Date("13 January 2023");

                if (auto === "true") {
                    update(ref(DB,`Dates/`),{
                        Auto:auto,
                    }).then(()=>{
                        console.log("to auto") 
                        if (date >= date_start) {
                            console.log("Repeated 4 weeks task started")
                            task.start();
                        } else {
                            console.log("Countdown to 13 Jan started")
                            countdown.start();
                        }
                        res.sendStatus(200)
                    })
                    .catch((error)=>{
                        console.log("from control: could not update")
                        console.log(error);
                        res.sendStatus(400);
                    })
                } else {
                    update(ref(DB,`Dates/`),{
                        Auto:auto,
                        Collection:dateinput
                    })
                    .then(()=>{
                        console.log("to man")
                        if (date >= date_start) {
                            console.log("Repeated 4 weeks task stopped")
                            task.stop();
                        } else {
                            console.log("Countdown to 13 Jan stopped")
                            countdown.stop();
                        }
                        res.sendStatus(200)                        
                    })
                    .catch((error)=>{
                        console.log("in control: could not update ")
                        console.log(error);
                        res.sendStatus(400);
                    })
                    // console.log("1")
                }
            })
            .catch((error)=>{
                console.log("in control:Could not sign in")
                console.log(error);
                res.sendStatus(400);
            })
        } else {
            // Get current date
            get(ref(DB,"Dates/"))
            .then((snapshot)=>{
                res.status(200).json(snapshot.val())
            })
            .catch((error)=>{
                console.log("Could not fetch date")
                console.log(error);
                res.sendStatus(400);
            })
        }
    }
    else {
        return res.sendStatus(400);
    }
}

exports.newProduct_control = (req,res) =>{
    // const { dynamic } = req.params;
    const { title, desc, prices, updatestatus, deleteRec } = req.query;
    // console.log(title, desc, prices);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("logged into product")
            get(ref(DB,`Admins/${user.uid}`))
            .then((snapshot) => {
                if (snapshot.val()) {
                    if (updatestatus) {
                        console.log("updating")
                        // Update item in firebase DB
                        update(ref(DB,`Products/${title}`),{
                            Title: title,
                            Desc: desc,
                            Prices: prices
                        })
                        .then(()=>{
                            console.log("Added",title,"to DB");
                            res.sendStatus(200)
                        })
                        .catch((error)=>{
                            console.log(error);
                            res.sendStatus(400);
                        })
                        return
                    }
                    if (desc) {
                        console.log("new")
                        // Create new item in firebase DB
                        set(ref(DB,`Products/${title}`),{
                            Title: title,
                            Desc: desc,
                            Prices: prices
                        })
                        .then(()=>{
                            console.log("Added",title,"to DB");
                            res.sendStatus(200)
                        })
                        .catch((error)=>{
                            console.log(error);
                            res.sendStatus(400);
                        })
                        return
                    }
                    if (deleteRec) {
                        get(ref(DB,`Products/${deleteRec}/Filename`))
                        .then((snapshot)=>{
                            const filename = snapshot.val();
                            deleteObject(sref(storage, filename))
                            .then(()=>{
                                remove(ref(DB,`Products/${deleteRec}`))
                                .then(()=>{
                                    console.log("Deleted item:",deleteRec)
                                    res.sendStatus(200);
                                })
                                .catch((error)=>{
                                    console.log(error);
                                    console.log("Could not delete item:",deleteRec);
                                    res.sendStatus(400)
                                })
                            })
                        })
                        .catch((error)=>{
                            console.log(error);
                            console.log("Filename does not exist in DB");
                            res.sendStatus(400);
                        })
                    }
                } else {
                    console.log("in product: not admin")
                    res.sendStatus(400);
                }
            })
            .catch((error)=> {
                console.log("ERROR:",error);
                res.sendStatus(400);
            })
        } else {
            console.log("in product:logged out dashboard")
            res.sendStatus(400);
        }
    })
    
    unsubscribe();  
}

exports.resetSession_control = (req,res) =>{
    auth.signOut().then(()=>{
        console.log("Signed user out")
        res.sendStatus(200)
    })
    .catch((error)=>{
        console.log("Could not log out user")
        console.log(error);
        res.sendStatus(400)
    })
}

exports.imageupload_control = async (req,res) => {
    const file = req.file;
    console.log("image upload")
    const timestamp = Date.now();
    const name = file.originalname.split(".")[0];
    const type = file.originalname.split(".")[1];
    const fileName = `${name}_${timestamp}.${type}`;

    uploadBytes(sref(storage,fileName),file.buffer)
    .then((snapshot)=>{
        const path = snapshot.metadata.fullPath;
        getDownloadURL(sref(storage,path))
        .then((url)=>{
            console.log("uploaded image");
            console.log("filename",fileName);
            res.status(200).json({durl:url,filename:fileName})
        })
        .catch((error) =>{
            res.status(400).json({code:error});
        })
    })
    .catch((error)=>{
        res.status(400).json({code:error});
    })
    
}

exports.sendimage_control = (req,res) => {
    console.log("send image")
    const { key, title, filename } = req.query;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("logged into product")
            update(ref(DB,`Products/${title}`),{
                File: key,
                Filename: filename
            })
            .then(()=>{
                console.log("Set image file for",title)
                res.status(200).json({status:`Added ${title}.`})
            })
            .catch((error) => {
                console.log("4")
                res.status(400).json({status:error})
            });
        } else {
            console.log("1")
            res.status(400).json({status:"Please sign in again."})
        }
    })

    unsubscribe();
}