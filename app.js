const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
mongoose.connect('mongodb://127.0.0.1:27017/Intern-Authentication').then(() => {
    console.log("Mongoose Server Started!");
}).catch((err) => {
    console.log("Err mongoose!");
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/login', (req, res) => {
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
                return res.render('home', {message: 'logged you in buddy'});
            };
        }
    } catch (error) {
        console.log(error);
    }
});
app.get('/home', (req, res) => {
    res.render('home');
})
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(username);
        console.log(password);
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        return res.render('home', { message: 'successfully registered' });
    } catch (error) {
        console.log(error);
    }
});
app.listen(3000, () => {
    console.log('connected on port 3000');
})