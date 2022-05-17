const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const user = require('./models/user');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const MongoStore = require('connect-mongo');
const session = require('express-session')

app.set('view engine', 'ejs');
app.use('/app/firstSection', express.static('views'));
app.use('/app/secondSection', express.static('views'));
app.use('/app/thirdSection', express.static('views'));
app.use('/register', express.static('views'));
app.use('/auth', express.static('views'));
app.use('/app/settings', express.static('views'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}))

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

app.use(
    session({
        secret: "secretKey",
        resave: true,
        saveUninitialized: false,
        store: new MongoStore({
            mongoUrl: 'mongodb+srv://varvara:varvara@cluster0.tvukb.mongodb.net/todoDB?retryWrites=true&w=majority'
        }),
        cookie: { 
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
    })
)

app.get('/', (req, res) => {
    res.redirect('register')
})
app.get('/register',(req, res) => {
    res.render('register', {
        validationErrors: undefined
    })
})
app.get('/auth',(req, res) => {
    res.render('auth', {
        validationError: undefined
    })
})
app.get('/app/firstSection', (req, res) => {
    res.render('app', {
        username: req.session.name,
        sections: req.session.sections
    })
})
app.get('/app/secondSection', (req, res) => {
    res.render('secondSection', {
        username: req.session.name,
        sections: req.session.sections
    })
})
app.get('/app/thirdSection', (req, res) => {
    res.render('thirdSection', {
        username: req.session.name,
        sections: req.session.sections
    })
})
app.get('/app/settings', (req, res) => {
    res.render('settings', {
        username: req.session.name,
        sections: req.session.sections
    })
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
    check('password', 'Не менее 8 символов').isLength({min: 8})
], async (req, res) => {
    const validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()){
        return res.render('register', {
            validationErrors: validationErrors
        })
    }
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    await user.create({username: req.body.username, email: req.body.email, password: hashPassword, sections: ['Дом', 'Учеба', 'Работа']}).then(res.redirect('auth'))
});

app.post('/auth', [
    check('email', 'Email не может быть пустым').isEmail().bail().trim().escape()
    .custom(email => {
        return user.findOne({email: email}).then(candidate =>{
            if (!candidate) {
                return Promise.reject(`Пользователь с email: ${email} не найден`);
            }
        })
    }).bail().escape()
    .custom(( email, {req} ) => {
            return user.findOne({email: req.body.email}).then(candidate => {
            const validPass = bcrypt.compareSync(req.body.password, candidate.password);
            if(!validPass){
                return Promise.reject(`Пользователь с паролем: ${req.body.password} не найден`);
            }
        })
    }).escape(),
    check('password', 'Не менее 8 символов').isLength({min: 8})
], async (req, res) => {
    const validationError = validationResult(req);
    if(!validationError.isEmpty()){
        res.render('auth', {
            validationError: validationError
        })
    } else {
        const User = await user.findOne({email: req.body.email})
        req.session.name = User.username
        req.session.sections = User.sections
        // req.session.photo = user.photo
        res.redirect('/app/firstSection')
    }
});