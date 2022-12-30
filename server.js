require('dotenv').config();
const path = require('path');
const express = require('express');
const { signOut } = require('./controllers/firebase_control')
// --------- Node mailer --------- //

const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')

// --------- Default --------- //

const app = express();
app.use(express.static(__dirname+'/public'));
const PORT = process.env.PORT || 80
app.set('view engine','hbs');

// --------- Backend Processes --------- //

app.use('/firebaseProcess',require('./routes/firebase'));
app.use('/',require('./routes/pages'))
app.use('/stripe',require('./routes/stripe'))

// --------- Get to pages --------- //

app.get('/', (req,res) => {
    signOut.signOut();
    res.render('index');
})

app.get('/paynow',(req,res) => {
    signOut.signOut();
    res.render('paynow');
})

app.get('/admin/login', (req,res) => {
    res.render('admin/login')
})

app.get('/admin/dashboard', (req,res) => {
    res.render('admin/dashboard')
})

app.get('/admin/dashboard/product', (req,res)=>{
    res.render('admin/dashboard/product')
})

app.get('/admin/dashboard/order', (req,res)=>{
    res.render('admin/dashboard/order');
})


app.get('/test',(req,res) =>{
    res.render('test')
})
app.get('/sendEmail/:dynamic', async (req,res) =>{
    
    const { key } = req.query;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    })

    const handlebarOptions = {
        viewEngine: {
            extName: ".hbs",
            partialsDir: path.resolve('./views'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views'),
        extName: ".hbs",
    };

    transporter.use('compile',hbs(handlebarOptions));   

    let mailOptions = {
        from: `Mademoiselle Angel <${process.env.EMAIL}>`,
        to: key,
        subject: 'Order Receipt',
        template: 'email_temp'
    };

    transporter.sendMail(mailOptions, function(err,data) {
        if (err) {
            console.log(err)
            res.status(400).json({status:"error"});
        } else {
            console.log(`Sent PayNow receipt to ${key}`);
            res.status(200).json({status:"success"});
            
        }
    })

})

app.get('/success',(req,res)=>{
    res.render('success')
})

app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
})