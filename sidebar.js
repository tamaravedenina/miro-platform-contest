import { peg$parse as parse } from './c4.js'
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
    console.log(objects)
    for (const element of objects) {
        switch (element.object_type) {
            case constants.personType:
                drawPerson(element.name, "Person", element.description, element.variable)
                break

            case constants.softwareSystemType:
                drawSystem(element.name, "Software System", element.description, element.variable)
                break

            case constants.existingSoftwareSystemType:
                drawExistingSystem(element.name, "Existing Software System", element.description, element.variable)
                break

            case constants.relationshipType:
                drawRelationship(element.description, element.start, element.end)
                break

            case constants.enterpriseBoundaryType:
                drawBoundary(element.name, element.type, element.systems.length)
                break

            case constants.containerType:
                drawSystem(element.name, "Container: " + element.technology, element.description, element.variable)
                break
            case constants.componentType:
                drawSystem(element.name, "Component: " + element.technology, element.description, element.variable)
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
    countSystem = 0
    countPerson = 0
    for (const key in widgetsMap) {
        for (const id of widgetsMap[key]) {
            miro.board.widgets.deleteById(id)
        }
    }
    widgetsMap = {}
}

// после закрытия сайдбара координаты обнуляются
// попробовать узнавать перед отрисовкой, занято ли планируемое для отрисовки и на сколько
// добавить обработку ошибок, подумать над их выводом

function drawPerson(name, role, description, variableName) {
    countPerson = countPerson + 1
    if (countPerson !== 1) {
        prx = calcX(prx, countPerson)
        pcx = calcX(pcx, countPerson)
    }

    miro.board.widgets.create({
        type: 'shape',
        text: constants.createText(name, role, description),
        x: prx,
        y: pry,
        style: constants.personRectangleStyle,
        width: constants.personRectangleWidth,
        height: constants.personRectangleHeight
    }).then((shape) => {
        let personRectangle = shape[0]
        miro.board.viewport.zoomToObject(personRectangle)
        miro.board.viewport.setZoom(0.6)
        widgetsMap[variableName] = [personRectangle.id]
    })

    miro.board.widgets.create({
        type: 'shape',
        text: '',
        style: constants.personCircleStyle,
        width: constants.personCircleDiameter,
        height: constants.personCircleDiameter,
        x: pcx,
        y: pcy
    }).then((shape) => {
        let personCircle = shape[0]
        widgetsMap[variableName].push(personCircle.id)
    })


//     обработка ошибок
//     miro.showNotification("test")


    if (countPerson % constants.maxOneLineObjectsCount === 0) {
        countPerson = 0
        prx = 0
        pcx = 0
        pry = pry + constants.downStep
        pcy = pcy + constants.downStep
    }
}

function drawSystem(name, role, description, variableName) {
    countSystem = countSystem + 1
    if (countSystem !== 1) {
        sx = calcX(sx, countSystem)
    }

    miro.board.widgets.create({
        type: 'shape',
        text: constants.createText(name, role, description),
        x: sx,
        y: sy,
        style: constants.systemRectangleStyle,
        width: constants.systemRectangleWidth,
        height: constants.systemRectangleHeight
    }).then((shape) => {
        let systemRectangle = shape[0]
        widgetsMap[variableName] = [systemRectangle.id]
    })


    if (countSystem % constants.maxOneLineObjectsCount === 0) {
        countSystem = 0
        sx = 0
        sy = sy + constants.downStep
    }
}

// вынести в отдельную функцию формирование прямоугольничка
// а может и всех фигур
function drawExistingSystem(name, role, description, variableName) {
    countSystem = countSystem + 1
    if (countSystem === 2) {
        sx = calcX(sx, countSystem)
    }

    miro.board.widgets.create({
        type: 'shape',
        text: constants.createText(name, role, description),
        x: sx,
        y: sy,
        style: constants.existingSystemRectangleStyle,
        width: constants.systemRectangleWidth,
        height: constants.systemRectangleHeight
    }).then((shape) => {
        let systemRectangle = shape[0]
        widgetsMap[variableName] = [systemRectangle.id]
    })

    if (countSystem % constants.maxOneLineObjectsCount === 0) {
        countSystem = 0
        sx = 0
        sy = sy + constants.downStep
    }
}

// technology! а не description
function drawRelationship(description, start, end) {
    // let startID = widgetsMap[start][0]
    // let endID = widgetsMap[end][0]
    // let line = {
    //     endWidgetId: endID,
    //     startWidgetId: startID,
    //     // text не поддерживается в API :(
    //     // captions: [{"text": description}],
    //     style: {
    //         lineColor: "#808080",
    //         lineEndStyle: 1,
    //         lineStartStyle: 0,
    //         lineStyle: 1,
    //         lineThickness: 1,
    //         lineType: 0
    //     },
    //     type: "LINE"
    // }
    console.log(widgetsMap)
    console.log(start)
    // let relationshipType = (await
    // miro.board.widgets.create(line).then((shape) => {
    //     let relationship = shape[0]
    //     widgetsMap[relationship.id] = [relationship.id]
    // })
    // widgetsMap[relationshipType.id] = [relationshipType.id]
}

function drawBoundary(name, type, countSystems) {
    let down = calcBoundaryDown(countSystems)
    let across = calcBoundaryAcross(countSystems)
    let y = calcBoundaryY(down)
    let style = {
        backgroundColor: "transparent",
        backgroundOpacity: 1,
        bold: 0,
        borderColor: "#808080",
        borderOpacity: 1,
        borderStyle: 1,
        borderWidth: 1,
        fontFamily: 10,
        fontSize: 18,
        shapeType: 3,
        textAlign: "l",
        textAlignVertical: "b",
        textColor: "#1a1a1a"
    }


    miro.board.widgets.create({
        type: 'shape',
        text: `<p><span style="color:rgb(26,26,26)">${name}</span></p><p><span style="color:rgb(26,26,26)">[${type}]</span></p>`,
        x: 0,
        y: y,
        style: style,
        width: across,
        height: down
    }).then((shape) => {
        let boundary = shape[0]
        widgetsMap[boundary] = [boundary.id]
    })

}

function calcBoundaryDown(count) {
    let countDown = (~~(count / constants.maxOneLineObjectsCount)) + 1
    return countDown * constants.systemRectangleHeight + (countDown - 1) * (constants.downStep - constants.systemRectangleHeight) + 3 * 50
}

function calcBoundaryAcross(count) {
    if (count >= constants.maxOneLineObjectsCount) {
        return constants.maxOneLineObjectsCount * constants.systemRectangleWidth +
            (constants.maxOneLineObjectsCount - 1) * (constants.acrossStep - constants.systemRectangleWidth) + 2 * 50
    }
    return count * constants.systemRectangleWidth + (count - 1) * (constants.acrossStep - constants.systemRectangleWidth) + 2 * 50
}

function calcBoundaryY(down) {
    return constants.downStep - 50 - constants.systemRectangleHeight / 2 + down / 2
}

function calcX(x, count) {
    if (count % 2 === 0) {
        return x + constants.acrossStep * (count - 1)
    } else {
        return x - constants.acrossStep * (count - 1)
    }
}
