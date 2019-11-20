import {peg$parse as parse} from './c4.js';
import * as constants from './constants.js'

let editor = document.querySelector('.editor')
let reloadBtn = document.querySelector('#reload-btn')
reloadBtn.addEventListener('click', redraw)

let prx = 0
let pry = 0
let pcx = 0
let pcy = -90

let sx = 0
let sy = constants.downStep

let countSystem = 0
let countPerson = 0
let widgetIDs = []
async function saveEditorData() {
    if (editor.value.charAt(editor.value.length - 1) === '\n') {
        let objects = parse(editor.value)
        drawAll(objects)
    }
}

function redraw() {
    cleanUp()
    prx = 0
    pry = 0
    pcx = 0
    pcy = -90
    sx = 0
    sy = constants.downStep
    let objects = parse(editor.value)
    drawAll(objects)
}

function cleanUp() {
    for (const id of widgetIDs) {
        miro.board.widgets.deleteById(id).then()
    }
    widgetIDs = []
}

// после закрытия сайдбара координаты обнуляются
function drawAll(objects) {
    for (const element of objects) {
        console.log(element)
        drawObject(element.name, element.type, element.description)
    }
}

function drawObject(name, type, description) {
    switch (type) {
        case constants.personType:
            drawPerson(name, "Person", description).then()
            break

        case constants.softwareSystemType:
            drawSystem(name, "Software System", description).then()
            break

        case constants.existingSoftwareSystemType:
            drawExistingSystem(name, "Existing Software System", description).then()
            break

        case constants.relationship:
            // role = "Relationship"
            break

        case constants.enterpriseBoundary:
            // role = "Enterprise Boundary"
            break

        default:
            break
    }

}

async function drawPerson(name, role, description) {
    countPerson = countPerson + 1
    if (countPerson !== 1) {
        prx = calcX(prx, countPerson)
        pcx = calcX(pcx, countPerson)
    }

    let personRectangle = (await miro.board.widgets.create({
        type: 'shape',
        text: constants.createText(name, role, description),
        x: prx,
        y: pry,
        style: constants.personRectangleStyle,
        width: constants.personRectangleWidth,
        height: constants.personRectangleHeight
    }))[0]
    let personCircle = (await miro.board.widgets.create({
        type: 'shape',
        text: '',
        style: constants.personCircleStyle,
        width: constants.personCircleDiameter,
        height: constants.personCircleDiameter,
        x: pcx,
        y: pcy
    }))[0]

    widgetIDs.push(personRectangle.id)
    widgetIDs.push(personCircle.id)

    if (countPerson % constants.maxOneLineObjectsCount === 0) {
        countPerson = 0
        prx = 0
        pcx = 0
        pry = pry + constants.downStep
        pcy = pcy + constants.downStep
    }
}

async function drawSystem(name, role, description) {
    countSystem = countSystem + 1
    if (countSystem !== 1) {
        sx = calcX(sx, countSystem)
    }

    let systemRectangle = (await miro.board.widgets.create({
        type: 'shape',
        text: constants.createText(name, role, description),
        x: sx,
        y: sy,
        style: constants.systemRectangleStyle,
        width: constants.systemRectangleWidth,
        height: constants.systemRectangleHeight
    }))[0]
    widgetIDs.push(systemRectangle.id)

    if (countSystem % constants.maxOneLineObjectsCount === 0) {
        countSystem = 0
        sx = 0
        sy = sy + constants.downStep
    }
}

async function drawExistingSystem(name, role, description) {
    countSystem = countSystem + 1
    if (countSystem === 2) {
        sx = calcX(sx, countSystem)
    }

    let systemRectangle = (await miro.board.widgets.create({
        type: 'shape',
        text: constants.createText(name, role, description),
        x: sx,
        y: sy,
        style: constants.existingSystemRectangleStyle,
        width: constants.systemRectangleWidth,
        height: constants.systemRectangleHeight
    }))[0]

    widgetIDs.push(systemRectangle.id)

    if (countSystem % constants.maxOneLineObjectsCount === 0) {
        countSystem = 0
        sx = 0
        sy = sy + constants.downStep
    }
}

function calcX(x, count) {
    if (count % 2 === 0) {
        return x + constants.acrossStep * (count - 1)
    } else {
        return x - constants.acrossStep * (count - 1)
    }
}