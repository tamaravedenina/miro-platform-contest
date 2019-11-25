import {peg$parse as parse} from './c4.js'
import * as consts from './constants.js'

let editor = document.querySelector('.editor')
let reloadBtn = document.querySelector('#reload-btn')
reloadBtn.addEventListener('click', redraw)

let prx = 0
let pry = 0
let pcx = 0
let pcy = -90

let sx = 0
let sy = consts.downStep

let countSystem = 0
let countDatabase = 0
let countPerson = 0
let widgetsMap = {}

function redraw() {
  cleanUp()
  try {
    let objects = parse(editor.value)
    // ждем, когда удалятся все виджеты
    setTimeout(drawAll, 500, objects)
  } catch (e) {
    if (e.name === 'SyntaxError') {
      miro.showNotification(e.message)
    } else {
      miro.showNotification("Undefined Error")
    }
  }
}

function drawAll(objects) {
  for (const element of objects) {
    switch (element.object_type) {
      case consts.personType:
        drawPerson(element.name, 'Person', element.description, element.variable)
        break

      case consts.softwareSystemType:
        drawContainer(element.name, 'Software System', element.description, element.variable, false)
        break

      case consts.existingSoftwareSystemType:
        drawContainer(element.name, 'Existing Software System', element.description, element.variable, true)
        break

      case consts.relationshipType:
        setTimeout(drawRelationship, 700, element.description, element.technology, element.start, element.end)
        break

      case consts.enterpriseBoundaryType:
        drawBoundary(element.name, element.type, element.systems)
        break

      case consts.containerType:
        drawContainer(element.name, 'Container: ' + element.technology, element.description, element.variable, false)
        break

      case consts.componentType:
        drawContainer(element.name, 'Component: ' + element.technology, element.description, element.variable, false)
        break

      case consts.databaseType:
        console.log(element)
        drawDatabase(element.name, 'Container: ' + element.technology, element.description, element.variable)
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
  sy = consts.downStep
  countSystem = 0
  countPerson = 0
  countDatabase = 0
  for (const key in widgetsMap) {
    for (const id of widgetsMap[key]) {
      miro.board.widgets.deleteById(id)
    }
  }
  widgetsMap = {}
}

function drawPerson(name, role, description, variableName) {
  countPerson = countPerson + 1
  if (countPerson !== 1) {
    prx = calcX(prx, countPerson)
    pcx = calcX(pcx, countPerson)
  }

  let text = consts.createText(name, role, description)
  let shape = consts.newShape(consts.shapeTypeRoundedRectangle, text, consts.personBackgroundColor,
    consts.personBorderColor, consts.shapeTextColor, prx, pry, consts.personRectangleWidth, consts.personRectangleHeight)

  miro.board.widgets.create(shape).then((shape) => {
    let personRectangle = shape[0]
    miro.board.viewport.zoomToObject(personRectangle)
    miro.board.viewport.setZoom(0.6)
    widgetsMap[variableName] = [personRectangle.id]
  })

  shape = consts.newShape(consts.shapeTypeCircle, '', consts.personBackgroundColor,
    consts.personBorderColor, consts.shapeTextColor, pcx, pcy, consts.personCircleDiameter, consts.personCircleDiameter)
  miro.board.widgets.create(shape).then((shape) => {
    let personCircle = shape[0]
    widgetsMap[variableName].push(personCircle.id)
  })

  if (countPerson % consts.maxOneLineObjectsCount === 0) {
    countPerson = 0
    prx = 0
    pcx = 0
    pry = pry + consts.downStep
    pcy = pcy + consts.downStep
  }
}

function drawContainer(name, role, description, variableName, isExist) {
  countSystem = countSystem + 1
  if (countSystem !== 1) {
    sx = calcX(sx, countSystem)
  }
  let backgroundColor = consts.containerColor
  let borderColor = consts.containerBorderColor
  if (isExist === true) {
    backgroundColor = consts.existingSystemBackgroundColor
    borderColor = consts.existingSystemBorderColor
  }

  let text = consts.createText(name, role, description)
  let system = consts.newShape(consts.shapeTypeRectangle, text, backgroundColor, borderColor, consts.shapeTextColor, sx, sy, consts.containerWidth, consts.containerHeight)

  miro.board.widgets.create(system).then((shape) => {
    let systemRectangle = shape[0]
    widgetsMap[variableName] = [systemRectangle.id]
  })

  if (countSystem % consts.maxOneLineObjectsCount === 0) {
    countSystem = 0
    sx = 0
    sy = sy + consts.downStep
  }
}

function drawRelationship(description, technology, start, end) {
  let startID = widgetsMap[start][0]
  let endID = widgetsMap[end][0]
  let line = {
    endWidgetId: endID,
    startWidgetId: startID,
    // text не поддерживается в API :(
    // captions: [{"text": description}],
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

  miro.board.widgets.create(line).then((shape) => {
    let relationship = shape[0]
    widgetsMap[relationship.id] = [relationship.id]
  })
}

function drawBoundary(name, type, systems) {
  drawAll(systems)
  let down = calcBoundaryDown(systems.length)
  let across = calcBoundaryAcross(systems.length)
  let y = calcBoundaryY(down)
  let style = {
    backgroundColor: 'transparent',
    backgroundOpacity: 1,
    borderColor: consts.boundaryColor,
    borderOpacity: 1,
    borderStyle: 1,
    borderWidth: 1,
    fontFamily: consts.fontFamily,
    fontSize: consts.fontSize,
    shapeType: consts.shapeTypeRectangle,
    textAlign: 'l',
    textAlignVertical: 'b',
    textColor: consts.boundaryTextColor,
  }

  miro.board.widgets.create({
    type: 'shape',
    text: `<p><span style="color:rgb(26,26,26)">${name}</span></p><p><span style="color:rgb(26,26,26)">[${type}]</span></p>`,
    x: 0,
    y: y,
    style: style,
    width: across,
    height: down,
  }).then((shape) => {
    let boundary = shape[0]
    widgetsMap[boundary] = [boundary.id]
  })
}

function drawDatabase(name, role, description, variableName) {
  let x = countDatabase * consts.acrossStep
  let y = sy + consts.downStep
  let text = consts.createText(name, role, description)
  let shape = consts.newShape(consts.shapeTypeCylinder, text, consts.containerColor, consts.containerBorderColor,
    consts.shapeTextColor, x, y, consts.containerWidth, consts.databaseHeight)

  miro.board.widgets.create(shape).then((result) => {
    let database = result[0]
    widgetsMap[variableName] = [database.id]
    countDatabase = countDatabase + 1
  })
}

function calcBoundaryDown(count) {
  let countDown = (~~(count / consts.maxOneLineObjectsCount)) + 1
  return countDown * consts.containerHeight + (countDown - 1) * (consts.downStep - consts.containerHeight) + 3 * 50
}

function calcBoundaryAcross(count) {
  if (count >= consts.maxOneLineObjectsCount) {
    return consts.maxOneLineObjectsCount * consts.containerWidth +
      (consts.maxOneLineObjectsCount - 1) * (consts.acrossStep - consts.containerWidth) + 2 * 50
  }
  return count * consts.containerWidth + (count - 1) * (consts.acrossStep - consts.containerWidth) + 2 * 50
}

function calcBoundaryY(down) {
  return consts.downStep - 50 - consts.containerHeight / 2 + down / 2
}

function calcX(x, count) {
  if (count % 2 === 0) {
    return x + consts.acrossStep * (count - 1)
  } else {
    return x - consts.acrossStep * (count - 1)
  }
}
