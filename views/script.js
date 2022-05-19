let urlPath = location.pathname;
let currentField = document.querySelector('.currentField');
if (urlPath == "/app/firstSection/") {
    currentField.innerText = firstSection;
    defaultUploadActiveTasks()
} else if (urlPath == "/app/secondSection/"){
    currentField.innerText = secondSection;
    defaultUploadActiveTasks()
} else if (urlPath == "/app/thirdSection/") {
    currentField.innerText = thirdSection;
    defaultUploadActiveTasks()
}

function defaultUploadActiveTasks(){
    let currentSection = document.querySelector('.currentField').textContent;
    fetch('/uploadActiveTasks', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({currentSection: currentSection})
    }).then(res => { return res.json() }).then(response => {
        response.forEach(el => {
            let div = document.createElement('div');
            div.classList.add('task');
            let html = `
                <div class="taskDesc">
                    <p class="taskNumber">№${el.taskNumber}</p>
                    <input type="date" class="deadline" value="${el.taskDeadline}">
                </div>
                <div class="taskText">
                    <input type="text" class="enterTask" placeholder="Запишите задачу" onchange="enterTask(event)" value="${el.taskValue}">
                </div>
                <div class="radio" onclick="doneTask(event)"></div>
                <i class="fa-solid fa-trash-can trash" onclick="deleteTask(event)"></i>
            `;
            div.innerHTML = html
            document.querySelector('.taskWrapper').appendChild(div)
        })
    })
}


var counterTask = 0;
function addTask(event) {
    let lastElem = document.querySelector('.taskWrapper').lastElementChild;
    if(lastElem){
        let taskNumber = lastElem.querySelector('.taskNumber').textContent[1];
        counterTask = taskNumber;
    } else {
        counterTask = 0;
    }
    counterTask++;
    let elem = event.currentTarget;
    let div = document.createElement('div');
    div.classList.add('task');
    let html = `
        <div class="taskDesc">
            <p class="taskNumber">№${counterTask}</p>
            <input type="date" class="deadline">
        </div>
        <div class="taskText">
            <input type="text" class="enterTask" placeholder="Запишите задачу" onchange="enterTask(event)">
        </div>
        <div class="radio" onclick="doneTask(event)"></div>
        <i class="fa-solid fa-trash-can trash" onclick="deleteTask(event)"></i>
    `;
    div.innerHTML = html
    elem.parentNode.parentNode.nextElementSibling.appendChild(div)
}

function choiceCategory(event){
    let currentElem = event.currentTarget;
    if (currentElem.getAttribute('class') != 'category active') {
        document.querySelectorAll('.category').forEach(el => {
            el.classList.remove('active');
            if (el.querySelector('.addTask')) {
                el.querySelector('.addTask').remove()
            }
        })
        currentElem.classList.add('active');
        if(currentElem.querySelector('.taskStatus').textContent != 'Завершенные задачи'){
            currentElem.insertAdjacentHTML("beforeend", 
            `
            <div class="addTask" onclick="addTask(event)">
                <i class="fa-solid fa-plus"></i>
            </div>
            `)
        }
        if(currentElem.querySelector('.taskStatus').textContent == 'Активные задачи'){
            uploadActiveTasks()
        }
        if(currentElem.querySelector('.taskStatus').textContent == 'Предстоящие задачи'){
            uploadUncomingTasks()
        }
        if(currentElem.querySelector('.taskStatus').textContent == 'Завершенные задачи'){
            uploadCompletedTasks()
        }
        counterTask = 0;
        if(document.querySelectorAll('.task')){
            document.querySelectorAll('.task').forEach(el => {
                el.remove()
            })
        }
    }
}

function enterTask(event){
    let Category = document.querySelector('.active');
    let activeCategory = Category.querySelector('.taskStatus').textContent;
    let sectionName = document.querySelector('.currentField').textContent;
    let taskNumber = event.currentTarget.parentNode.parentNode.querySelector('.taskNumber').textContent[1];
    let taskDeadline = event.currentTarget.parentNode.parentNode.querySelector('.deadline').value
    fetch('/enterTask', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            taskValue: event.currentTarget.value,
            sectionName: sectionName,
            activeCategory: activeCategory,
            taskNumber: taskNumber,
            taskDeadline: taskDeadline
        })
    })
}


function doneTask(event){
    if (event.currentTarget.getAttribute('class') != "radio radioDone") {
        event.currentTarget.parentNode.classList.add('doneTask');
        event.currentTarget.parentNode.querySelector('.taskDesc').classList.add('done');
        event.currentTarget.previousElementSibling.classList.add('taskDone');
        event.currentTarget.classList.add('radioDone')
        let task = event.currentTarget.parentNode;
        let sectionName = document.querySelector('.currentField').textContent;
        let taskNumber = task.querySelector('.taskNumber').textContent[1];
        let taskDeadline = task.querySelector('.deadline').value;
        let taskValue = task.querySelector('.enterTask').value;
        fetch('/pushToCompleted', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                taskValue: event.currentTarget.value,
                sectionName: sectionName,
                taskNumber: taskNumber,
                taskDeadline: taskDeadline,
                taskValue: taskValue
            })
        })
    } else {
        event.currentTarget.parentNode.classList.remove('doneTask');
        event.currentTarget.parentNode.querySelector('.taskDesc').classList.remove('done');
        event.currentTarget.previousElementSibling.classList.remove('taskDone');
        event.currentTarget.classList.remove('radioDone')
    }
}

//изменение пароля
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


//изменение пароля
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


if(document.querySelector('#updateUsername')){
    const form = document.querySelector('#updateUsername');
    const oldName = document.querySelector('.oldName');
    const newName = document.querySelector('.newName');
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if(oldName.value.trim().length < 8 || newName.value.trim().length < 8){
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
                    alert(response.success)
                }
            })
        })
        
}

function uploadActiveTasks(){
    let currentSection = document.querySelector('.currentField').textContent;
    fetch('/uploadActiveTasks', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({currentSection: currentSection})
    }).then(res => { return res.json() }).then(response => {
        response.forEach(el => {
            let div = document.createElement('div');
            div.classList.add('task');
            let html = `
                <div class="taskDesc">
                    <p class="taskNumber">№${el.taskNumber}</p>
                    <input type="date" class="deadline" value="${el.taskDeadline}">
                </div>
                <div class="taskText">
                    <input type="text" class="enterTask" placeholder="Запишите задачу" onchange="enterTask(event)" value="${el.taskValue}">
                </div>
                <div class="radio" onclick="doneTask(event)"></div>
                <i class="fa-solid fa-trash-can trash" onclick="deleteTask(event)"></i>
            `;
            div.innerHTML = html
            document.querySelector('.taskWrapper').appendChild(div)
        })
    })
}

function uploadUncomingTasks(){
    let currentSection = document.querySelector('.currentField').textContent;
    fetch('/uploadUncomingTasks', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({currentSection: currentSection})
    }).then(res => { return res.json() }).then(response => {
        response.forEach(el => {
            let div = document.createElement('div');
            div.classList.add('task');
            let html = `
                <div class="taskDesc">
                    <p class="taskNumber">№${el.taskNumber}</p>
                    <input type="date" class="deadline" value="${el.taskDeadline}">
                </div>
                <div class="taskText">
                    <input type="text" class="enterTask" placeholder="Запишите задачу" onchange="enterTask(event)" value="${el.taskValue}">
                </div>
                <div class="radio" onclick="doneTask(event)"></div>
                <i class="fa-solid fa-trash-can trash" onclick="deleteTask(event)"></i>
            `;
            div.innerHTML = html
            document.querySelector('.taskWrapper').appendChild(div)
        })
    })
}

function uploadCompletedTasks(){
    let currentSection = document.querySelector('.currentField').textContent;
    fetch('/uploadCompletedTasks', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({currentSection: currentSection})
    }).then(res => { return res.json() }).then(response => {
        response.forEach(el => {
            let div = document.createElement('div');
            div.classList.add('task');
            let html = `
                <div class="taskDesc">
                    <p class="taskNumber">№${el.taskNumber}</p>
                    <input type="date" class="deadline" value="${el.taskDeadline}">
                </div>
                <div class="taskText">
                    <input type="text" class="enterTask" placeholder="Запишите задачу" onchange="enterTask(event)" value="${el.taskValue}">
                </div>
                <i class="fa-solid fa-trash-can trash completedTrash" onclick="deleteTask(event)"></i>
            `;
            div.innerHTML = html
            document.querySelector('.taskWrapper').appendChild(div)
        })
    })
}

function deleteTask(event){
    let task = event.currentTarget.parentNode;
    let taskNumber = task.querySelector('.taskNumber').textContent[1];
    let currentSection = document.querySelector('.currentField').textContent;
    let Category = document.querySelector('.active');
    let activeCategory = Category.querySelector('.taskStatus').textContent;
    fetch('/deleteTask', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            taskNumber: taskNumber,
            currentSection: currentSection,
            activeCategory: activeCategory
        })
    })
    task.remove();
}