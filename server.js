// здесь подключаются различные модули
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
const sessionMiddleware = require('./middleware/sessionMiddleware');

// определяем промежуточное по (middleware)
app.set('view engine', 'ejs');
app.use(express.static('views'));
app.use('/app/firstSection', express.static('views'));
app.use('/app/secondSection', express.static('views'));
app.use('/app/thirdSection', express.static('views'));
app.use('/app/settings', express.static('views'));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))

// эта функция подключает базу данных и запускает сервер
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

// здесь подключаются сессии и определяются различные параметры
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

// объявляем глобальные переменные, которые потом будем рендерить в шаблон
let username;
let firstSection;
let secondSection;
let thirdSection;
let photo;

// здесь определяются маршруты приложения, и какаие функции работают на этих маршрутах
app.get('/', (req, res) => {
    res.redirect('register')
})
app.get('/register', sessionMiddleware, (req, res) => {
    res.render('register', {
        validationErrors: undefined
    })
})
app.get('/auth', sessionMiddleware, (req, res) => {
    res.render('auth', {
        validationError: undefined
    })
})
app.get('/app/firstSection', authMiddleware, async (req, res) => {
    const User = await user.findOne({email: req.session.email});
        username = User.username;
        firstSection = User.sections.firstSection.sectionName;
        secondSection = User.sections.secondSection.sectionName;
        thirdSection = User.sections.thirdSection.sectionName;
        photo = User.profilePhoto;
    res.render('app', {
        username: username,
        firstSection: firstSection,
        secondSection: secondSection,
        thirdSection: thirdSection,
        photo: photo
    })
})
app.get('/app/secondSection', authMiddleware, async (req, res) => {
    const User = await user.findOne({email: req.session.email});
        username = User.username;
        firstSection = User.sections.firstSection.sectionName;
        secondSection = User.sections.secondSection.sectionName;
        thirdSection = User.sections.thirdSection.sectionName;
        photo = User.profilePhoto;
    res.render('secondSection', {
        username: username,
        firstSection: firstSection,
        secondSection: secondSection,
        thirdSection: thirdSection,
        photo: photo
    })
})
app.get('/app/thirdSection', authMiddleware, async (req, res) => {
    const User = await user.findOne({email: req.session.email});
        username = User.username;
        firstSection = User.sections.firstSection.sectionName;
        secondSection = User.sections.secondSection.sectionName;
        thirdSection = User.sections.thirdSection.sectionName;
        photo = User.profilePhoto;
    res.render('thirdSection', {
        username: username,
        firstSection: firstSection,
        secondSection: secondSection,
        thirdSection: thirdSection,
        photo: photo
    })
})
app.get('/app/settings', authMiddleware, async (req, res) => {
    const User = await user.findOne({email: req.session.email});
        username = User.username;
        firstSection = User.sections.firstSection.sectionName;
        secondSection = User.sections.secondSection.sectionName;
        thirdSection = User.sections.thirdSection.sectionName;
        photo = User.profilePhoto;
    res.render('settings', {
        username: username,
        firstSection: firstSection,
        secondSection: secondSection,
        thirdSection: thirdSection,
        photo: photo
    })
})

// в этом роуте происходит регистрация, а также валидация формы регистрации
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
                completedTask: [],
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

// в этом роуте происходит авторизация, а также валидация формы авторизация
app.post('/auth', [
    check('email', 'Email не может быть пустым').isEmail().bail().trim().escape()
    .custom(email => {
        return user.findOne({email: email}).then(candidate =>{
            if (!candidate) {
                return Promise.reject(`Пользователь с email: ${email} не найден`);
            }
        })
    }).bail().escape(),
    check('password', 'Не менее 8 символов').isLength({min: 8}).bail()
    .custom(( password, {req} ) => {
        return user.findOne({email: req.body.email}).then(candidate => {
        const validPass = bcrypt.compareSync(password, candidate.password);
        if(!validPass){
            return Promise.reject(`Пользователь с паролем: ${password} не найден`);
        }
    })
}).escape(),
], async (req, res) => {
    const validationError = validationResult(req);
    if(!validationError.isEmpty()){
        res.render('auth', {
            validationError: validationError
        })
    } else {
        const User = await user.findOne({email: req.body.email});
        req.session.email = req.body.email
        username = User.username;
        firstSection = User.sections.firstSection.sectionName;
        secondSection = User.sections.secondSection.sectionName;
        thirdSection = User.sections.thirdSection.sectionName;
        photo = User.profilePhoto;
        req.session.login = true;
        req.session.save();
        res.redirect('/app/firstSection')
    }
});

// в этом роуте добавляются задачи в бд
app.post('/enterTask', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if (req.body.firstSectionName && req.body.activeCategory == 'Активные задачи') {
            user.sections.firstSection.activeTask.push({
                taskDeadline: req.body.taskDeadline, 
                taskValue: req.body.taskValue,
            })
            user.save()
            user.sections.firstSection.activeTask.forEach(el => {
                if(el.taskDeadline == req.body.taskDeadline && el.taskValue == req.body.taskValue){
                    res.end(JSON.stringify({
                        task: el
                    }))
                }
            })
            
        }
        if (req.body.firstSectionName && req.body.activeCategory == 'Предстоящие задачи') {
            user.sections.firstSection.uncomingTask.push({
                taskDeadline: req.body.taskDeadline, 
                taskValue: req.body.taskValue,
            })
            user.save()
            user.sections.firstSection.uncomingTask.forEach(el => {
                if(el.taskDeadline == req.body.taskDeadline && el.taskValue == req.body.taskValue){
                    res.end(JSON.stringify({
                        task: el
                    }))
                }
            })
        }
        
        if (req.body.secondSectionName && req.body.activeCategory == 'Активные задачи') {
            user.sections.secondSection.activeTask.push({
                taskDeadline: req.body.taskDeadline, 
                taskValue: req.body.taskValue,
            })
            user.save()
            user.sections.secondSection.activeTask.forEach(el => {
                if(el.taskDeadline == req.body.taskDeadline && el.taskValue == req.body.taskValue){
                    res.end(JSON.stringify({
                        task: el
                    }))
                }
            })
        }
        if (req.body.secondSectionName && req.body.activeCategory == 'Предстоящие задачи') {
            user.sections.secondSection.uncomingTask.push({
                taskDeadline: req.body.taskDeadline, 
                taskValue: req.body.taskValue,
            })
            user.save()
            user.sections.secondSection.uncomingTask.forEach(el => {
                if(el.taskDeadline == req.body.taskDeadline && el.taskValue == req.body.taskValue){
                    res.end(JSON.stringify({
                        task: el
                    }))
                }
            })
        }
    
        if (req.body.thirdSectionName && req.body.activeCategory == 'Активные задачи') {
            user.sections.thirdSection.activeTask.push({
                taskDeadline: req.body.taskDeadline, 
                taskValue: req.body.taskValue,
            })
            user.save()
            user.sections.thirdSection.activeTask.forEach(el => {
                if(el.taskDeadline == req.body.taskDeadline && el.taskValue == req.body.taskValue){
                    res.end(JSON.stringify({
                        task: el
                    }))
                }
            })
        }
        if (req.body.thirdSectionName && req.body.activeCategory == 'Предстоящие задачи') {
            user.sections.thirdSection.uncomingTask.push({
                taskDeadline: req.body.taskDeadline, 
                taskValue: req.body.taskValue,
            })
            user.save()
            user.sections.thirdSection.uncomingTask.forEach(el => {
                if(el.taskDeadline == req.body.taskDeadline && el.taskValue == req.body.taskValue){
                    res.end(JSON.stringify({
                        task: el
                    }))
                }
            })
        }
    })
})

// обновление пароля
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

// обновление почты
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

// загрузка аватарки
app.post('/updateAvatar', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        user.profilePhoto = req.body.photo;
        user.save();
        photo = req.body.photo;
    })   
})

// обновление имени пользователя
app.post('/updateUsername', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if(user.username != req.body.oldName){
            res.end(JSON.stringify({error: "Старое имя не совпадает :("}))
        } else {
            user.username = req.body.newName;
            user.save();
            res.end(JSON.stringify({success: "Username успешно изменен :)", newName: req.body.newName}))
        }   
    }) 
})

// здесь из бд достаются активные задачи и возвращаются на клиент
app.post('/uploadActiveTasks', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if(req.body.firstSectionName){
            res.end(JSON.stringify(user.sections.firstSection.activeTask))
        }
        if(req.body.secondSectionName){
            res.end(JSON.stringify(user.sections.secondSection.activeTask))
        }
        if(req.body.thirdSectionName){
            res.end(JSON.stringify(user.sections.thirdSection.activeTask))
        }
    })
})

// здесь из бд достаются предстоящие задачи и возвращаются на клиент
app.post('/uploadUncomingTasks', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if(req.body.firstSectionName){
            res.end(JSON.stringify(user.sections.firstSection.uncomingTask))
        }
        if(req.body.secondSectionName){
            res.end(JSON.stringify(user.sections.secondSection.uncomingTask))
        }
        if(req.body.thirdSectionName){
            res.end(JSON.stringify(user.sections.thirdSection.uncomingTask))
        }
    })
})

// здесь из бд достаются завершенные задачи и возвращаются на клиент
app.post('/uploadCompletedTasks', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if(req.body.firstSectionName){
            res.end(JSON.stringify(user.sections.firstSection.completedTask))
        }
        if(req.body.secondSectionName){
            res.end(JSON.stringify(user.sections.secondSection.completedTask))
        }
        if(req.body.thirdSectionName){
            res.end(JSON.stringify(user.sections.thirdSection.completedTask))
        }
    })
})

// удаление задач
app.post('/deleteTask', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if(req.body.firstSectionName && req.body.activeCategory == 'Активные задачи'){
            user.sections.firstSection.activeTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.firstSectionName && req.body.activeCategory == 'Предстоящие задачи'){
            user.sections.firstSection.uncomingTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.firstSectionName && req.body.activeCategory == 'Завершенные задачи'){
            user.sections.firstSection.completedTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.secondSectionName && req.body.activeCategory == 'Активные задачи'){
            user.sections.secondSection.activeTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.secondSectionName && req.body.activeCategory == 'Предстоящие задачи'){
            user.sections.secondSection.uncomingTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.secondSectionName && req.body.activeCategory == 'Завершенные задачи'){
            user.sections.secondSection.completedTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.thirdSectionName && req.body.activeCategory == 'Активные задачи'){
            user.sections.thirdSection.activeTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.thirdSectionName && req.body.activeCategory == 'Предстоящие задачи'){
            user.sections.thirdSection.uncomingTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.save();
        }
        if(req.body.thirdSectionName && req.body.activeCategory == 'Завершенные задачи'){
            user.sections.thirdSection.completedTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.save();
        }
    })
})

// добавление задач в раздел завершенные
app.post('/pushToCompleted', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if(req.body.firstSectionName && req.body.activeCategory == 'Активные задачи'){
            user.sections.firstSection.completedTask.push({
                taskDeadline: req.body.taskDeadline, 
                taskValue: req.body.taskValue
            })
            user.sections.firstSection.activeTask.forEach(el => {
                if (el.id == req.body.taskID) {
                    el.remove();
                }
            })
            user.save();
        }
        if(req.body.firstSectionName && req.body.activeCategory == 'Предстоящие задачи'){
            user.sections.firstSection.completedTask.push({
                taskDeadline: req.body.taskDeadline, 
                taskValue: req.body.taskValue
            })
            user.sections.firstSection.uncomingTask.forEach(el => {
                if (el.taskNumber == req.body.taskNumber) {
                    el.remove();
                }
            })
            user.save();
        }
        if(req.body.secondSectionName && req.body.activeCategory == 'Активные задачи'){
            user.sections.secondSection.completedTask.push({
                taskDeadline: req.body.taskDeadline, 
                taskValue: req.body.taskValue
            })
            user.sections.secondSection.activeTask.forEach(el => {
                if (el.taskNumber == req.body.taskNumber) {
                    el.remove();
                }
            })
            user.save();
        }
        if(req.body.secondSectionName && req.body.activeCategory == 'Предстоящие задачи'){
            user.sections.secondSection.completedTask.push({
                taskDeadline: req.body.taskDeadline, 
                taskValue: req.body.taskValue
            })
            user.sections.secondSection.uncomingTask.forEach(el => {
                if (el.taskNumber == req.body.taskNumber) {
                    el.remove();
                }
            })
            user.save();
        }
        if(req.body.thirdSectionName && req.body.activeCategory == 'Активные задачи'){
            user.sections.thirdSection.completedTask.push({
                taskDeadline: req.body.taskDeadline,
                taskValue: req.body.taskValue
            })
            user.sections.thirdSection.activeTask.forEach(el => {
                if (el.taskNumber == req.body.taskNumber) {
                    el.remove();
                }
            })
            user.save();
        }
        if(req.body.thirdSectionName && req.body.activeCategory == 'Предстоящие задачи'){
            user.sections.thirdSection.completedTask.push({
                taskDeadline: req.body.taskDeadline,
                taskValue: req.body.taskValue
            })
            user.sections.thirdSection.uncomingTask.forEach(el => {
                if (el.taskNumber == req.body.taskNumber) {
                    el.remove();
                }
            })
            user.save();
        }
    })
})


// редактирование разделов дом работа и учеба
app.post('/editFirstSectionName', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        user.sections.firstSection.sectionName = req.body.sectionName;
        user.save()
        firstSection = req.body.sectionName;
    })
})

app.post('/editSecondSectionName', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        user.sections.secondSection.sectionName = req.body.sectionName;
        user.save()
        secondSection = req.body.sectionName
    })
})

app.post('/editThirdSectionName', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        user.sections.thirdSection.sectionName = req.body.sectionName;
        user.save()
        thirdSection = req.body.sectionName
    })
})


// выход из приложения
app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})


app.post('/relocateToActive', (req, res) => {
    if(req.body.firstSectionName){
        user.findOne({email: req.session.email}).then(user => {
            user.sections.firstSection.uncomingTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.sections.firstSection.activeTask.push({
                taskDeadline: req.body.taskDeadline,
                taskValue: req.body.taskValue,
            })
            user.save();
        })
    }
    if(req.body.secondSectionName){
        user.findOne({email: req.session.email}).then(user => {
            user.sections.secondSection.uncomingTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.sections.secondSection.activeTask.push({
                taskDeadline: req.body.taskDeadline,
                taskValue: req.body.taskValue,
            })
            user.save();
        })
    }
    if(req.body.thirdSectionName){
        user.findOne({email: req.session.email}).then(user => {
            user.sections.thirdSection.uncomingTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.sections.thirdSection.activeTask.push({
                taskDeadline: req.body.taskDeadline,
                taskValue: req.body.taskValue,
            })
            user.save();
        })
    }
})


app.post('/relocateToUncoming', (req, res) => {
    if(req.body.firstSectionName){
        user.findOne({email: req.session.email}).then(user => {
            user.sections.firstSection.activeTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.sections.firstSection.uncomingTask.push({
                taskDeadline: req.body.taskDeadline,
                taskValue: req.body.taskValue,
            })
            user.save();
        })
    }
    if(req.body.secondSectionName){
        user.findOne({email: req.session.email}).then(user => {
            user.sections.secondSection.activeTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.sections.secondSection.uncomingTask.push({
                taskDeadline: req.body.taskDeadline,
                taskValue: req.body.taskValue,
            })
            user.save();
        })
    }
    if(req.body.thirdSectionName){
        user.findOne({email: req.session.email}).then(user => {
            user.sections.thirdSection.activeTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.remove()
                }
            })
            user.sections.thirdSection.uncomingTask.push({
                taskDeadline: req.body.taskDeadline,
                taskValue: req.body.taskValue,
            })
            user.save();
        })
    }
})

app.post('/acceptChanges', (req, res) => {
    user.findOne({email: req.session.email}).then(user => {
        if(req.body.firstSectionName && req.body.activeCategory == 'Активные задачи'){
            user.sections.firstSection.activeTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.taskValue = req.body.taskValue;
                    el.taskDeadline = req.body.taskDeadline;
                }
            })
        }
        if(req.body.firstSectionName && req.body.activeCategory == 'Предстоящие задачи'){
            user.sections.firstSection.activeTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.taskValue = req.body.taskValue;
                    el.taskDeadline = req.body.taskDeadline;
                }
            })
        }
        if(req.body.firstSectionName && req.body.activeCategory == 'Активные задачи'){
            user.sections.firstSection.activeTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.taskValue = req.body.taskValue;
                    el.taskDeadline = req.body.taskDeadline;
                }
            })
        }
        if(req.body.secondSectionName && req.body.activeCategory == 'Предстоящие задачи'){
            user.sections.secondSection.activeTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.taskValue = req.body.taskValue;
                    el.taskDeadline = req.body.taskDeadline;
                }
            })
        }
        if(req.body.thirdSectionName && req.body.activeCategory == 'Активные задачи'){
            user.sections.thirdSection.activeTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.taskValue = req.body.taskValue;
                    el.taskDeadline = req.body.taskDeadline;
                }
            })
        }
        if(req.body.thirdSectionName && req.body.activeCategory == 'Предстоящие задачи'){
            user.sections.thirdSection.activeTask.forEach(el => {
                if(el.id == req.body.taskID){
                    el.taskValue = req.body.taskValue;
                    el.taskDeadline = req.body.taskDeadline;
                }
            })
        }
        user.save();
    })
})