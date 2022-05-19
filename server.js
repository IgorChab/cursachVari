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
const authMiddleware = require('./middleware/authMiddleware');

app.set('view engine', 'ejs');
app.use(express.static('views'));
app.use('/app/firstSection', express.static('views'));
app.use('/app/secondSection', express.static('views'));
app.use('/app/thirdSection', express.static('views'));
app.use('/app/settings', express.static('views'));
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
app.get('/register', (req, res) => {
    res.render('register', {
        validationErrors: undefined
    })
})
app.get('/auth', (req, res) => {
    res.render('auth', {
        validationError: undefined
    })
})
app.get('/app/firstSection', authMiddleware, (req, res) => {
    res.render('app', {
        username: req.session.name,
        firstSection: req.session.firstSection,
        secondSection: req.session.secondSection,
        thirdSection: req.session.thirdSection,
        photo: req.session.photo
    })
})
app.get('/app/secondSection', authMiddleware, (req, res) => {
    res.render('secondSection', {
        username: req.session.name,
        firstSection: req.session.firstSection,
        secondSection: req.session.secondSection,
        thirdSection: req.session.thirdSection,
        photo: req.session.photo
    })
})
app.get('/app/thirdSection', authMiddleware, (req, res) => {
    res.render('thirdSection', {
        username: req.session.name,
        firstSection: req.session.firstSection,
        secondSection: req.session.secondSection,
        thirdSection: req.session.thirdSection,
        photo: req.session.photo
    })
})
app.get('/app/settings', authMiddleware, (req, res) => {
    res.render('settings', {
        username: req.session.name,
        firstSection: req.session.firstSection,
        secondSection: req.session.secondSection,
        thirdSection: req.session.thirdSection,
        photo: req.session.photo
    })
})
app.post('/register', [
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
    await user.create({
        username: req.body.username, 
        email: req.body.email, 
        password: hashPassword,
        profilePhoto: '',
        sections: {
            firstSection: {
                sectionName: "Дом",
                activeTask: [],
                uncomingTask: [],
                completedTask: []
            },
            secondSection: {
                sectionName: "Работа",
                activeTask: [],
                uncomingTask: [],
                completedTask: []
            },
            thirdSection: {
                sectionName: "Учеба",
                activeTask: [],
                uncomingTask: [],
                completedTask: []
            }
        }})
        .then(res.redirect('auth'))
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
        const User = await user.findOne({email: req.body.email});
        req.session.email = req.body.email
        req.session.name = User.username
        req.session.firstSection = User.sections.firstSection.sectionName;
        req.session.secondSection = User.sections.secondSection.sectionName;
        req.session.thirdSection = User.sections.thirdSection.sectionName;
        req.session.login = true;
        req.session.save();
        res.redirect('/app/firstSection')
    }
});

app.post('/enterTask', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        switch (req.body.sectionName) {
            case 'Дом':
                if (req.body.activeCategory == 'Активные задачи') {
                    user.sections.firstSection.activeTask.push({
                        taskNumber: req.body.taskNumber, 
                        taskDeadline: req.body.taskDeadline, 
                        taskValue: req.body.taskValue
                    })
                    user.save()
                }
                if (req.body.activeCategory == 'Предстоящие задачи') {
                    user.sections.firstSection.uncomingTask.push({
                        taskNumber: req.body.taskNumber, 
                        taskDeadline: req.body.taskDeadline, 
                        taskValue: req.body.taskValue
                    })
                    user.save()
                }
                if (req.body.activeCategory == 'Завершенные задачи') {
                    user.sections.firstSection.completedTask.push({
                        taskNumber: req.body.taskNumber, 
                        taskDeadline: req.body.taskDeadline, 
                        taskValue: req.body.taskValue
                    })
                    user.save()
                }
                break;
        
            case 'Работа':
                if (req.body.activeCategory == 'Активные задачи') {
                    user.sections.secondSection.activeTask.push({
                        taskNumber: req.body.taskNumber, 
                        taskDeadline: req.body.taskDeadline, 
                        taskValue: req.body.taskValue
                    })
                    user.save()
                }
                if (req.body.activeCategory == 'Предстоящие задачи') {
                    user.sections.secondSection.uncomingTask.push({
                        taskNumber: req.body.taskNumber, 
                        taskDeadline: req.body.taskDeadline, 
                        taskValue: req.body.taskValue
                    })
                    user.save()
                }
                if (req.body.activeCategory == 'Завершенные задачи') {
                    user.sections.secondSection.completedTask.push({
                        taskNumber: req.body.taskNumber, 
                        taskDeadline: req.body.taskDeadline, 
                        taskValue: req.body.taskValue
                    })
                    user.save()
                }
                break;

            case 'Учеба':
                user.sections.thirdSection.sectionName = req.body.sectionName;
                if (req.body.activeCategory == 'Активные задачи') {
                    user.sections.thirdSection.activeTask.push({
                        taskNumber: req.body.taskNumber, 
                        taskDeadline: req.body.taskDeadline, 
                        taskValue: req.body.taskValue
                    })
                    user.save()
                }
                if (req.body.activeCategory == 'Предстоящие задачи') {
                    user.sections.thirdSection.uncomingTask.push({
                        taskNumber: req.body.taskNumber, 
                        taskDeadline: req.body.taskDeadline, 
                        taskValue: req.body.taskValue
                    })
                    user.save()
                }
                if (req.body.activeCategory == 'Завершенные задачи') {
                    user.sections.thirdSection.completedTask.push({
                        taskNumber: req.body.taskNumber, 
                        taskDeadline: req.body.taskDeadline, 
                        taskValue: req.body.taskValue
                    })
                    user.save()
                }
                break;

        }
        req.session.firstSection = user.sections.firstSection.sectionName;
        req.session.secondSection = user.sections.firstSection.sectionName;
        req.session.thirdSection = user.sections.firstSection.sectionName;
        req.session.save();
    })
})

app.post('/updatePass', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        let validOldPass = bcrypt.compareSync(req.body.oldPass, user.password)
        if(validOldPass == false){
            res.end(JSON.stringify({error: "Старый пароль не совпадает :("}))
        } else {
            bcrypt.hash(req.body.newPass, 10).then(newPassword => {
                user.password = newPassword;
                user.save();
            })
            res.end(JSON.stringify({success: "Пароль успешно изменен :)"}))
        }
    })
})

app.post('/updateEmail', (req, res) => {
    user.findOne({email: req.body.oldEmail}).then(user => {
        if(!user){
            res.end(JSON.stringify({error: "Старый email не совпадает :("}))
        } else {
            user.email = req.body.newEmail;
            user.save();
            res.end(JSON.stringify({success: "Email успешно изменен :)"}))
        }    
    })
})

app.post('/updateAvatar', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        user.profilePhoto = req.body.photo;
        user.save();
        req.session.photo = req.body.photo;
        req.session.save();
    })   
})

app.post('/updateUsername', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if(user.username != req.body.oldName){
            res.end(JSON.stringify({error: "Старое имя не совпадает :("}))
        } else {
            user.username = req.body.newName;
            user.save();
            res.end(JSON.stringify({success: "Email успешно изменен :)"}))
        }   
    }) 
})

app.post('/uploadActiveTasks', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if(req.body.currentSection == 'Дом'){
            res.end(JSON.stringify(user.sections.firstSection.activeTask))
        }
        if(req.body.currentSection == 'Работа'){
            res.end(JSON.stringify(user.sections.secondSection.activeTask))
        }
        if(req.body.currentSection == 'Учеба'){
            res.end(JSON.stringify(user.sections.thirdSection.activeTask))
        }
    })
})

app.post('/uploadUncomingTasks', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if(req.body.currentSection == 'Дом'){
            res.end(JSON.stringify(user.sections.firstSection.uncomingTask))
        }
        if(req.body.currentSection == 'Работа'){
            res.end(JSON.stringify(user.sections.secondSection.uncomingTask))
        }
        if(req.body.currentSection == 'Учеба'){
            res.end(JSON.stringify(user.sections.thirdSection.uncomingTask))
        }
    })
})

app.post('/uploadCompletedTasks', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if(req.body.currentSection == 'Дом'){
            res.end(JSON.stringify(user.sections.firstSection.completedTask))
        }
        if(req.body.currentSection == 'Работа'){
            res.end(JSON.stringify(user.sections.secondSection.completedTask))
        }
        if(req.body.currentSection == 'Учеба'){
            res.end(JSON.stringify(user.sections.thirdSection.completedTask))
        }
    })
})

app.post('/deleteTask', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if(req.body.currentSection == 'Дом' && req.body.activeCategory == 'Активные задачи'){
            user.sections.firstSection.activeTask.forEach(el => {
                if(el.taskNumber == req.body.taskNumber){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.currentSection == 'Дом' && req.body.activeCategory == 'Предстоящие задачи'){
            user.sections.firstSection.uncomingTask.forEach(el => {
                if(el.taskNumber == req.body.taskNumber){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.currentSection == 'Дом' && req.body.activeCategory == 'Завершенные задачи'){
            user.sections.firstSection.completedTask.forEach(el => {
                if(el.taskNumber == req.body.taskNumber){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.currentSection == 'Работа' && req.body.activeCategory == 'Активные задачи'){
            user.sections.secondSection.activeTask.forEach(el => {
                if(el.taskNumber == req.body.taskNumber){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.currentSection == 'Работа' && req.body.activeCategory == 'Предстоящие задачи'){
            user.sections.secondSection.uncomingTask.forEach(el => {
                if(el.taskNumber == req.body.taskNumber){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.currentSection == 'Работа' && req.body.activeCategory == 'Завершенные задачи'){
            user.sections.secondSection.completedTask.forEach(el => {
                if(el.taskNumber == req.body.taskNumber){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.currentSection == 'Учеба' && req.body.activeCategory == 'Активные задачи'){
            user.sections.thirdSection.activeTask.forEach(el => {
                if(el.taskNumber == req.body.taskNumber){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.currentSection == 'Учеба' && req.body.activeCategory == 'Предстоящие задачи'){
            user.sections.thirdSection.uncomingTask.forEach(el => {
                if(el.taskNumber == req.body.taskNumber){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.currentSection == 'Учеба' && req.body.activeCategory == 'Завершенные задачи'){
            user.sections.thirdSection.completedTask.forEach(el => {
                if(el.taskNumber == req.body.taskNumber){
                    el.remove()
                }
            })
            user.save();
        }
    })
})


app.post('/pushToCompleted', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if(req.body.sectionName == 'Дом'){
            user.sections.firstSection.completedTask.push({
                taskNumber: req.body.taskNumber,
                taskDeadline: req.body.taskDeadline, 
                taskValue: req.body.taskValue
            })
            user.save();
        }
        if(req.body.sectionName == 'Работа'){
            user.sections.secondSection.completedTask.push({
                taskNumber: req.body.taskNumber,
                taskDeadline: req.body.taskDeadline, 
                taskValue: req.body.taskValue
            })
            user.save();
        }
        if(req.body.sectionName == 'Учеба'){
            user.sections.thirdSection.completedTask.push({
                taskNumber: req.body.taskNumber,
                taskDeadline: req.body.taskDeadline,
                taskValue: req.body.taskValue
            })
            user.save();
        }
    })
})