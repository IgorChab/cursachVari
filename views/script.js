let urlPath = location.pathname;
let currentField = document.querySelector('.currentField');
if (urlPath == "/app/firstSection/") {
    currentField.innerText = firstSection;
} else if (urlPath == "/app/secondSection/"){
    currentField.innerText = secondSection;
} else if (urlPath == "/app/thirdSection/") {
    currentField.innerText = thirdSection;
}

let counterTask = 0
function addTask(event) {
    counterTask++
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
    `;
    div.innerHTML = html
    elem.parentNode.parentNode.nextElementSibling.appendChild(div)
}

function choiceCategory(event){
    let currentElem = event.currentTarget;
    document.querySelectorAll('.category').forEach(el => {
        el.classList.remove('active');
        if (el.querySelector('.addTask')) {
            el.querySelector('.addTask').remove()
        }
    })
    currentElem.classList.add('active');
    currentElem.insertAdjacentHTML("beforeend", 
    `
    <div class="addTask" onclick="addTask(event)">
        <i class="fa-solid fa-plus"></i>
    </div>
    `)
}

function enterTask(event){
    event.currentTarget.placeholder = event.currentTarget.value
}

function doneTask(event){
    if (event.currentTarget.getAttribute('class') != 'radioDone') {
        event.currentTarget.parentNode.classList.add('doneTask');
        event.currentTarget.parentNode.querySelector('.taskDesc').classList.add('done');
        event.currentTarget.previousElementSibling.classList.add('taskDone');
        event.currentTarget.classList.add('radioDone')
    } else {
        event.currentTarget.parentNode.classList.remove('doneTask');
        event.currentTarget.parentNode.querySelector('.taskDesc').classList.remove('done');
        event.currentTarget.previousElementSibling.classList.remove('taskDone');
        event.currentTarget.classList.remove('radioDone')
    }
}