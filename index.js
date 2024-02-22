const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require('path');
const session = require('express-session');

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.cggtgnu.mongodb.net/RegistrationformDB`);

const registrationschema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    gender: String,
    dob: String,
    qualification: String,
    password: String
});

const Registration = mongoose.model("Registration", registrationschema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/pages/index.html");
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, mobile, gender, dob, qualification, password } = req.body;

        const existingUser = await Registration.findOne({ email: email });
        if (!existingUser) {
            const registrationData = new Registration({ name, email, mobile, gender, dob, qualification, password });
            await registrationData.save();
            res.redirect("/success");
            console.log(" ");
        console.log("Data Added to DB");
        } else {
            console.log("User already exists");
            res.redirect("/error");
        }

    } catch (error) {
        console.log(error);
        res.redirect("/error");
    }
});

app.get("/success", (req, res) => {
    res.sendFile(__dirname + "/pages/success.html");
});

app.get("/error", (req, res) => {
    res.sendFile(__dirname + "/pages/error.html");
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});


app.post('/login', (req, res) => {
    const enteredUsername = req.body.username;
    const enteredPassword = req.body.password;

    if (enteredUsername === adminUsername && enteredPassword === adminPassword) {
        req.session.admin = true;
        res.redirect('/admin');
    } else {
        res.render('login', { error: 'Invalid username or password' });
    }
});

const protectAdminRoute = (req, res, next) => {
    if (req.session && req.session.admin) {
        next();
    } else {
        res.redirect('/login');
    }
};


app.get('/logout', (req, res) => {
    console.log(" ");
    console.log("Admin Logged out");

    req.session.admin = false;
    res.redirect('/login');
});

app.get('/admin', protectAdminRoute, async (req, res) => {
    try {
        const registrations = await Registration.find();
        res.render('admin', { registrations });
    } catch (error) {
        console.log(error);
        res.redirect('/error');
    }
    console.log(" ");
    console.log("Admin Logged in");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
