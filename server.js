const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const user = require('./models/user');
const bcrypt = require('bcrypt');
const { check, validationResult} = require('express-validator');

app.set('view engine', 'ejs');
app.use(express.static('views'));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))

const start = async () => {
    try {
        await mongoose
            .connect('mongodb+srv://varvara:varvara@cluster0.tvukb.mongodb.net/todoDB?retryWrites=true&w=majority', {
                useNewUrlParser: true,
            })
            .then(() => console.log('MongoDb connected'))

            app.listen(port, () => console.log(`server is up. port: ${port}`));
    } catch (e) {
        console.log(e);
    }
}

start()

app.get('/', (req, res) => {
    res.redirect('register')
})
app.get('/register',(req, res) => {
    res.render('register', {
        validationErrors: undefined
    })
})
app.get('/auth',(req, res) => {
    res.render('auth')
})
app.get('/app', (req, res) => {
    res.render('app')
})
app.post('/register',[
    check('username', 'Username не может быть пустым').trim().notEmpty().escape(),
    check('email','email не может быть пустым').trim().notEmpty().bail().escape().custom(email => {
        return user.findOne({email: email}).then(user => {
            if(user){
                return Promise.reject("Пользователь с таким email уже существует");
            }
        })
    }),
    check('password').custom(password => {
        const rex = /^(?=.*\d)\w{3,20}$/m;
        if(rex.test(password) == false){
            return Promise.reject("Пороль должен содержать латиницу и цифры");
        }
    })
], async (req, res) => {
    const validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()){
        // res.send(validationErrors);
        return res.render('register', {
            validationErrors: validationErrors
        })
    }
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    await user.create({username: req.body.username, email: req.body.email, password: hashPassword}).then(res.redirect('auth'))
})

// app.post('/auth', async (req, res) => {
    
// })