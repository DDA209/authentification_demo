const express = require('express');
const exphbs = require('express-handlebars');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models').User;

const port = process.env.PORT || 3000;

mongoose.connect(
    process.env.MONGODB_URI ||
      'mongodb://localhost:27017/authentication_exercise',
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    }
  );

// Express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(
    expressSession({
        secret: 'konexioasso07',
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    console.log("GET /");
    res.render("home");
});

app.get("/admin", (req, res) => {
    console.log("GET /admin");
    if (req.isAuthenticated()) {
        console.log(req.user);
        res.render("admin");
    } else {
        res.redirect("/");
    }
});

app.get("/signup", (req, res) => {
    console.log("GET /signup");
    if (req.isAuthenticated()) {
        res.redirect("/admin");
    } else {
        res.render("signup");
    }
});

app.post("/signup", (req, res) => {
    console.log("POST /signup");
    console.log("will signup");

    if (req.body.password.length < 8) {
        console.log("Password must have 8 characters");
        return res.render("signup");
    }


    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmation = req.body.confirmation;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;


    User.register(
    new User({
        username,
        email,
        firstName,
        lastName
        // other fields can be added here
    }),
    password, // password will be hashed
    (err, user) => {
        if (err) {
            console.log("/signup user register err", err);
            return res.render("signup");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/admin");
            });
        }
    }
    );
});

app.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/admin");
    } else {
        res.render("login");
    }
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/admin",
        failureRedirect: "/login"
    })
);
app.get("/logout", (req, res) => {
    console.log("GET /logout");
    req.logout();
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Serveur connecté au port ${port}`)
});