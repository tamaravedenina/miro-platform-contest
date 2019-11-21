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
let widgetsMap = {}


function redraw() {
    cleanUp()
    let objects = parse(editor.value)
    for (const element of objects) {
        switch (element.type) {
            case constants.personType:
                drawPerson(element.name, "Person", element.description, element.variable).then()
                break

            case constants.softwareSystemType:
                drawSystem(element.name, "Software System", element.description, element.variable).then()
                break

            case constants.existingSoftwareSystemType:
                drawExistingSystem(element.name, "Existing Software System", element.description, element.variable).then()
                break

            case constants.relationship:

                drawRelationship(element.description, element.start, element.end).then()
                break

            case constants.enterpriseBoundary:
                // role = "Enterprise Boundary"
                break

            default:
                break
        }
    }
}

function cleanUp() {
    prx = 0
    pry = 0
    pcx = 0
    pcy = -90
    sx = 0
    sy = constants.downStep
    for (const key in widgetsMap) {
        for (const id of widgetsMap[key]) {
            miro.board.widgets.deleteById(id).then()
        }
    }
    widgetsMap = {}
}

// после закрытия сайдбара координаты обнуляются
// попробовать узнавать перед отрисовкой, занято ли планируемое для отрисовки и на сколько
// добавить обработку ошибок, подумать над их выводом

async function drawPerson(name, role, description, variableName) {
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

    widgetsMap[variableName] = [personRectangle.id, personCircle.id]

    if (countPerson % constants.maxOneLineObjectsCount === 0) {
        countPerson = 0
        prx = 0
        pcx = 0
        pry = pry + constants.downStep
        pcy = pcy + constants.downStep
    }
}

async function drawSystem(name, role, description, variableName) {
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
    widgetsMap[variableName] = [systemRectangle.id]

    if (countSystem % constants.maxOneLineObjectsCount === 0) {
        countSystem = 0
        sx = 0
        sy = sy + constants.downStep
    }
}

// вынести в отдельную функцию формирование прямоугольничка
// а может и всех фигур
async function drawExistingSystem(name, role, description, variableName) {
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
    widgetsMap[variableName] = [systemRectangle.id]

    if (countSystem % constants.maxOneLineObjectsCount === 0) {
        countSystem = 0
        sx = 0
        sy = sy + constants.downStep
    }
}

async function drawRelationship(description, start, end) {
    // let startID = widgetsMap[start][0]
    // let endID = widgetsMap[end][0]
    let line = {
        endWidgetId: 0,
        startWidgetId: 0,
        captions: [{description}],
        style: {
            lineColor: "#808080",
            lineEndStyle: 1,
            lineStartStyle: 0,
            lineStyle: 1,
            lineThickness: 1,
            lineType: 0
        },
        type: "LINE"
    }
    console.log(widgetsMap)
    console.log(line)
    console.log(start)
    console.log(end)
    // let relationship = (await miro.board.widgets.create(line))[0]
    // widgetsMap[relationship.id] = [relationship.id]
}

function calcX(x, count) {
    if (count % 2 === 0) {
        return x + constants.acrossStep * (count - 1)
    } else {
        return x - constants.acrossStep * (count - 1)
    }
}