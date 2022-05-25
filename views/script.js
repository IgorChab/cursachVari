// когда мы заходим в проложение по дефолту подгружаются активные задачи
let urlPath = location.pathname;
if (urlPath == "/app/firstSection/") {
    defaultUploadActiveTasks()
} else if (urlPath == "/app/secondSection/"){
    defaultUploadActiveTasks()
} else if (urlPath == "/app/thirdSection/") {
    defaultUploadActiveTasks()
}

// в этой функции делается запрос на сервер, на сервере из бд достаются задачи и возвращаются в эту функцию, затем выводятся на экран
function defaultUploadActiveTasks(){
    if(location.pathname == "/app/firstSection/"){
        var firstSectionName = document.querySelector('.firstSection').textContent;
    }
    if(location.pathname == "/app/secondSection/"){
        var secondSectionName = document.querySelector('.secondSection').textContent;
    }
    if(location.pathname == "/app/thirdSection/"){
        var thirdSectionName = document.querySelector('.thirdSection').textContent;
    }
    fetch('/uploadActiveTasks', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstSectionName: firstSectionName,
            secondSectionName: secondSectionName,
            thirdSectionName: thirdSectionName
        })
    }).then(res => { return res.json() }).then(response => {
        response.forEach(el => {
            var div = document.createElement('div');
            div.classList.add('task');
            let html = `
                <div class="taskDesc">
                    <p class="taskNumber">№${el.taskNumber}</p>
                    <p class="deadline">Дедлайн: ${el.taskDeadline}</p>
                </div>
                <div class="taskText">
                    <p class="enterTask">${el.taskValue}</p>
                </div>
                <div class="radio" onclick="doneTask(event)"></div>
                <i class="fa-solid fa-trash-can trash" onclick="deleteTask(event)"></i>
            `;
            div.innerHTML = html;
            document.querySelector('.taskWrapper').appendChild(div);
        })
    })
}

// эта функция отвечает за перемещение по вкладкам активные, предстоящие и завершенные задачи и вывод задач этой вкладки на экран
function choiceCategory(event){
    let currentElem = event.currentTarget;
    if (currentElem.getAttribute('class') != 'category active') {
        document.querySelectorAll('.category').forEach(el => {
            el.classList.remove('active');
        })
        currentElem.classList.add('active');
        document.querySelector('.addToTop').outerHTML = '<div class="addToTop" onclick="addTask(event)"><p>+ Добавить задачу</p></div>';
        if(currentElem.querySelector('.taskStatus').textContent == 'Активные задачи'){
            uploadActiveTasks()
            document.querySelector('.addToTop').style.display = 'flex';
            document.querySelector('.addToTop').classList.remove('newaddToTop');
            if(document.querySelector('.wrapaddTask'))
                document.querySelector('.wrapaddTask').remove();
        }
        if(currentElem.querySelector('.taskStatus').textContent == 'Предстоящие задачи'){
            uploadUncomingTasks()
            document.querySelector('.addToTop').style.display = 'flex';
            document.querySelector('.addToTop').classList.remove('newaddToTop');
            if(document.querySelector('.wrapaddTask'))
                document.querySelector('.wrapaddTask').remove();
        }
        if(currentElem.querySelector('.taskStatus').textContent == 'Завершенные задачи'){
            uploadCompletedTasks()
            document.querySelector('.addToTop').style.display = 'none';
            document.querySelector('.addToTop').classList.remove('newaddToTop');
            if(document.querySelector('.wrapaddTask'))
                document.querySelector('.wrapaddTask').remove();
        }
        counterTask = 0;
        if(document.querySelectorAll('.task')){
            document.querySelectorAll('.task').forEach(el => {
                el.remove()
            })
        }
    }
}

// в этой функции выбранная задача попадает в категорию завершенных и удаляется из списка активных или предстоящих
function doneTask(event){
    if (event.currentTarget.getAttribute('class') != "radio radioDone") {
        event.currentTarget.parentNode.classList.add('doneTask');
        event.currentTarget.parentNode.querySelector('.taskDesc').classList.add('done');
        event.currentTarget.previousElementSibling.classList.add('taskDone');
        event.currentTarget.classList.add('radioDone');
        event.currentTarget.innerHTML = '<i class="fa-solid fa-check"></i>';
        var task = event.currentTarget.parentNode;
        if(location.pathname == "/app/firstSection/"){
            var firstSectionName = document.querySelector('.firstSection').textContent;
        }
        if(location.pathname == "/app/secondSection/"){
            var secondSectionName = document.querySelector('.secondSection').textContent;
        }
        if(location.pathname == "/app/thirdSection/"){
            var thirdSectionName = document.querySelector('.thirdSection').textContent;
        }
        let taskNumber = task.querySelector('.taskNumber').textContent[1];
        let taskDeadline = task.querySelector('.deadline').textContent;
        let taskValue = task.querySelector('.enterTask').textContent;
        let Category = document.querySelector('.active');
        let activeCategory = Category.querySelector('.taskStatus').textContent;
        fetch('/pushToCompleted', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstSectionName: firstSectionName,
                secondSectionName: secondSectionName,
                thirdSectionName: thirdSectionName,
                taskNumber: taskNumber,
                taskDeadline: taskDeadline,
                taskValue: taskValue,
                activeCategory: activeCategory
            })
        })
        setTimeout(() => {
            task.remove();
        }, 500);
    }

}

// здесь получаются данные которые были введены в форму и отправляются на сервер для изменения пароля
if(document.querySelector('#updatePass')){
    const form = document.querySelector('#updatePass');
    const oldPass = document.querySelector('.oldPass');
    const newPass = document.querySelector('.newPass');
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if(oldPass.value.trim().length < 8 || newPass.value.trim().length < 8){
                return false;
            }

            fetch('/updatePass', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPass: oldPass.value.trim(),
                    newPass: newPass.value.trim()
                })
            }).then(res => { return res.json() }).then(response => {
                oldPass.value = '';
                newPass.value = '';
                if(response.error){
                    alert(response.error)
                } else {
                    alert(response.success)
                }
            })
        })
        
}


//// здесь получаются данные которые были введены в форму и отправляются на сервер для изменения почты
if(document.querySelector('#updateEmail')){
    const form = document.querySelector('#updateEmail');
    const oldEmail = document.querySelector('.oldEmail');
    const newEmail = document.querySelector('.newEmail');
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if(oldEmail.value.trim().length < 8 || newEmail.value.trim().length < 8){
                return false;
            }

            fetch('/updateEmail', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldEmail: oldEmail.value.trim(),
                    newEmail: newEmail.value.trim()
                })
            }).then(res => { return res.json() }).then(response => {
                oldEmail.value = '';
                newEmail.value = '';
                if(response.error){
                    alert(response.error)
                } else {
                    alert(response.success)
                }
            })
        })
        
}

// обновление аватарки, выбранная фотография отправляется на сервер и добавляется в бд
if(document.querySelector('#updatePhoto')){
    function updateImage(event) {
        let file = event.target.files[0];
        let fileType = file.type;
        let maxSize = 3145728;
        if(!fileType.includes('image/') || file.size > maxSize){
            alert('Только изображения!!!\nне больше 3мб');
            return;
        }
        let reader = new FileReader(file);
        reader.onload = function(){
                let data = this.result;
                document.querySelector('.avatar').src = data;
                document.querySelector('.avatar').style.display="block";
            }
            document.querySelector('#updatePhoto').addEventListener('submit', e => {
                e.preventDefault();
                fetch('/updateAvatar',{
                    method: 'post',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({photo: reader.result})
                })
                if(document.querySelector('.logo')){
                    document.querySelector('.logo').remove();
                } else if (document.querySelector('.profilePhoto')){
                    document.querySelector('.profilePhoto').remove();
                }
                let img = document.createElement('img');
                img.classList.add('profilePhoto')
                img.src = reader.result
                document.querySelector('.logoWrapper').prepend(img);
            })
        reader.readAsDataURL(file);
    }
}

// здесь получаются данные которые были введены в форму и отправляются на сервер для изменения имени
if(document.querySelector('#updateUsername')){
    const form = document.querySelector('#updateUsername');
    const oldName = document.querySelector('.oldName');
    const newName = document.querySelector('.newName');
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if(oldName.value.trim().length == 0 || newName.value.trim().length == 0){
                return false;
            }

            fetch('/updateUsername', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldName: oldName.value.trim(),
                    newName: newName.value.trim()
                })
            }).then(res => { return res.json() }).then(response => {
                oldName.value = '';
                newName.value = '';
                if(response.error){
                    alert(response.error)
                } else {
                    document.querySelector('.currentUser').textContent = response.newName;
                    alert(response.success)
                }
            })
        })
        
}

// загрузка активных задач
function uploadActiveTasks(){
    if(location.pathname == "/app/firstSection/"){
        var firstSectionName = document.querySelector('.firstSection').textContent;
    }
    if(location.pathname == "/app/secondSection/"){
        var secondSectionName = document.querySelector('.secondSection').textContent;
    }
    if(location.pathname == "/app/thirdSection/"){
        var thirdSectionName = document.querySelector('.thirdSection').textContent;
    }
    fetch('/uploadActiveTasks', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstSectionName: firstSectionName,
            secondSectionName: secondSectionName,
            thirdSectionName: thirdSectionName
        })
    }).then(res => { return res.json() }).then(response => {
        response.forEach(el => {
            let div = document.createElement('div');
            div.classList.add('task');
            let html = `
            <div class="taskDesc">
                <p class="taskNumber">№${el.taskNumber}</p>
                <p class="deadline">Дедлайн: ${el.taskDeadline}</p>
            </div>
            <div class="taskText">
                <p class="enterTask">${el.taskValue}</p>
            </div>
            <div class="radio" onclick="doneTask(event)"></div>
            <i class="fa-solid fa-trash-can trash" onclick="deleteTask(event)"></i>
            `;
            div.innerHTML = html;
            document.querySelector('.taskWrapper').appendChild(div);
        })
    })
}

// загрузка предстоящих задач
function uploadUncomingTasks(){
    if(location.pathname == "/app/firstSection/"){
        var firstSectionName = document.querySelector('.firstSection').textContent;
    }
    if(location.pathname == "/app/secondSection/"){
        var secondSectionName = document.querySelector('.secondSection').textContent;
    }
    if(location.pathname == "/app/thirdSection/"){
        var thirdSectionName = document.querySelector('.thirdSection').textContent;
    }
    fetch('/uploadUncomingTasks', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstSectionName: firstSectionName,
            secondSectionName: secondSectionName,
            thirdSectionName: thirdSectionName
        })
    }).then(res => { return res.json() }).then(response => {
        response.forEach(el => {
            let div = document.createElement('div');
            div.classList.add('task');
            let html = `
                <div class="taskDesc">
                    <p class="taskNumber">№${el.taskNumber}</p>
                    <p class="deadline">Дедлайн: ${el.taskDeadline}</p>
                </div>
                <div class="taskText">
                    <p class="enterTask">${el.taskValue}</p>
                </div>
                <div class="radio" onclick="doneTask(event)"></div>
                <i class="fa-solid fa-trash-can trash" onclick="deleteTask(event)"></i>
            `;
            div.innerHTML = html;
            document.querySelector('.taskWrapper').appendChild(div);
        })
    })
}

// загрузка выполненных задач
function uploadCompletedTasks(){
    if(location.pathname == "/app/firstSection/"){
        var firstSectionName = document.querySelector('.firstSection').textContent;
    }
    if(location.pathname == "/app/secondSection/"){
        var secondSectionName = document.querySelector('.secondSection').textContent;
    }
    if(location.pathname == "/app/thirdSection/"){
        var thirdSectionName = document.querySelector('.thirdSection').textContent;
    }
    fetch('/uploadCompletedTasks', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstSectionName: firstSectionName,
            secondSectionName: secondSectionName,
            thirdSectionName: thirdSectionName
        })
    }).then(res => { return res.json() }).then(response => {
        response.forEach(el => {
            let div = document.createElement('div');
            div.classList.add('task');
            let html = `
                <div class="taskDesc">
                    <p class="taskNumber">№${el.taskNumber}</p>
                    <p class="deadline">${el.taskDeadline}</p>
                </div>
                <div class="taskText">
                    <p class="enterTask">${el.taskValue}</p>
                </div>
                <i class="fa-solid fa-trash-can trash" onclick="deleteTask(event)"></i>
            `;
            div.innerHTML = html;
            document.querySelector('.taskWrapper').appendChild(div);
        })
    })
}

// запрос на сервер для удалении задачи
function deleteTask(event){
    let task = event.currentTarget.parentNode;
    let taskNumber = task.querySelector('.taskNumber').textContent[1];
    let Category = document.querySelector('.active');
    let activeCategory = Category.querySelector('.taskStatus').textContent;
    if(location.pathname == "/app/firstSection/"){
        var firstSectionName = document.querySelector('.firstSection').textContent;
    }
    if(location.pathname == "/app/secondSection/"){
        var secondSectionName = document.querySelector('.secondSection').textContent;
    }
    if(location.pathname == "/app/thirdSection/"){
        var thirdSectionName = document.querySelector('.thirdSection').textContent;
    }
    fetch('/deleteTask', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            taskNumber: taskNumber,
            firstSectionName: firstSectionName,
            secondSectionName: secondSectionName,
            thirdSectionName: thirdSectionName,
            activeCategory: activeCategory
        })
    })
    task.remove();
}
 
function addTask(event) {
    let elm = document.createElement('div');
    elm.classList.add('wrapaddTask')
    let html = `
        <input type="text" class="addTask" placeholder="Запишите задачу">
        <input type="date" class="enterDeadline">
        <p class="plusTask" onclick="plusTask()">Добавить</p>
    `;
    elm.innerHTML = html;
    event.currentTarget.classList.add('newaddToTop')
    elm.classList.add('newwrapaddTask')
    event.currentTarget.appendChild(elm)
    event.currentTarget.removeAttribute("onclick")
}

var counterTask = 0;
// добавляет задачу на экран, когда введена задача и дедлайн
function plusTask() {
    let lastElem = document.querySelector('.taskWrapper').lastElementChild;
    if(lastElem){
        let taskNumber = lastElem.querySelector('.taskNumber').textContent[1];
        counterTask = taskNumber;
    } else {
        counterTask = 0;
    }
    counterTask++;
    let taskValue = document.querySelector('.addTask').value;
    let taskDeadline = document.querySelector('.enterDeadline').value;
    if(taskValue.length == 0 || taskDeadline.length == 0){
        alert('Чтобы добавить задачу, заполните все поля!')
        return;
    }
    let div = document.createElement('div');
    div.classList.add('task');
    let html = `
        <div class="taskDesc">
            <p class="taskNumber">№${counterTask}</p>
            <p class="deadline">Дедлайн: ${taskDeadline}</p>
        </div>
        <div class="taskText">
            <p class="enterTask">${taskValue}</p>
        </div>
        <div class="radio" onclick="doneTask(event)"></div>
        <i class="fa-solid fa-trash-can trash" onclick="deleteTask(event)"></i>
    `;
    div.innerHTML = html;

    document.querySelector('.addTask').value = '';
    document.querySelector('.enterDeadline').value = '';
    document.querySelector('.wrapaddTask').remove();
    document.querySelector('.addToTop').classList.remove('newaddToTop');
    document.querySelector('.taskWrapper').appendChild(div);
    document.querySelector('.addToTop').outerHTML = '<div class="addToTop" onclick="addTask(event)"><p>+ Добавить задачу</p></div>';

    let Category = document.querySelector('.active');
    let activeCategory = Category.querySelector('.taskStatus').textContent;
    if(location.pathname == "/app/firstSection/"){
        var firstSectionName = document.querySelector('.firstSection').textContent;
    }
    if(location.pathname == "/app/secondSection/"){
        var secondSectionName = document.querySelector('.secondSection').textContent;
    }
    if(location.pathname == "/app/thirdSection/"){
        var thirdSectionName = document.querySelector('.thirdSection').textContent;
    }
    fetch('/enterTask', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            taskValue: taskValue,
            firstSectionName: firstSectionName,
            secondSectionName: secondSectionName,
            thirdSectionName: thirdSectionName,
            activeCategory: activeCategory,
            taskNumber: counterTask,
            taskDeadline: taskDeadline
        })
    })

}

// запросы на сервер для редактировании разделов
function editFirstSectionName(event) {
    let sectionName = event.currentTarget.value.trim();
    if(sectionName.length == 0){
        alert("Название не может быть пустым")
        event.currentTarget.value = firstSection;
        return;
    } else {
        document.querySelector('.fieldItemFirst').textContent = sectionName
        fetch('/editFirstSectionName', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sectionName: sectionName,
            })
        })
    }
}

// запросы на сервер для редактировании разделов
function editSecondSectionName(event) {
    let sectionName = event.currentTarget.value.trim();
    if(sectionName.length == 0){
        alert("Название не может быть пустым")
        event.currentTarget.value = secondSection;
        return;
    } else {
        document.querySelector('.fieldItemSecond').textContent = sectionName
        fetch('/editSecondSectionName', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sectionName: sectionName,
            })
        })
    }
}
// запросы на сервер для редактировании разделов
function editThirdSectionName(event) {
    let sectionName = event.currentTarget.value.trim();
    if(sectionName.length == 0){
        alert("Название не может быть пустым")
        event.currentTarget.value = thirdSection;
        return;
    } else {
        document.querySelector('.fieldItemThird').textContent = sectionName
        fetch('/editThirdSectionName', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sectionName: sectionName,
            })
        })
    }
}
