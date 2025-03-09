const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const session = require('express-session');
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: '1234',
    saveUninitialized:false,
    resave:false,
}));
app.use((req, res, next)=>{
        res.locals.loggedIn = req.session.isAuth|| false;
    next();
});
const isLogged = (req, res, next)=>{
    if(!req.session.isAuth)
    {
        console.log(req.path);
        req.session.returnTo = req.path;
        return res.redirect('/login');
    }
    next();
};
const isAlreadyLoggedIn = (req, res, next)=>{
    if(req.session.isAuth)
    {
        return res.redirect('/home');
    }
    next();
}
mongoose.connect('mongodb://127.0.0.1:27017/Intern-Authentication').then(() => {
    console.log("Mongoose Server Started!");
}).catch((err) => {
    console.log("Err mongoose!");
});

app.get('/home', (req, res) => {
    console.log(req.session.isAuth);
       return res.render('home');
    
});
app.get('/topSecret', isLogged, (req, res)=>{
    return res.send('THIS IS TOP SECRET SHOWN ONLY TO LOGGED IN USERS');
});

app.get('/logout', (req, res)=>{
    req.session.destroy((err)=>{
        if(err)
        {
            console.log(err);
        }
        res.redirect('/login');
    })
})

app.get('/register',isAlreadyLoggedIn, (req, res) => {
    res.render('register');
});
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(username);
        console.log(password);
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        req.session.isAuth = true;
        return res.redirect('/home');
    } catch (error) {
        console.log(error);
    }
});
app.get('/login',isAlreadyLoggedIn, (req, res) =>{
    res.render('login');
});
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('the login username: ', username);
        console.log('the login password: ', password);
        const findUser = await User.findOne({ username });
        if (findUser) {
            if (bcrypt.compare(password, findUser.password)) {
                req.session.isAuth = true;
                if(req.session.returnTo)
                {
                    return res.redirect(`${req.session.returnTo}`);
                }
                else{
                    return res.redirect('/home');
                }
            };
        }else{
            return res.send('user does not exist. try again');
        }
    } catch (error) {
        console.log(error);
    }
});
app.listen(3000, () => {
    console.log('connected on port 3000');
})