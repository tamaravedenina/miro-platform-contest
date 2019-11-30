import {peg$parse as parse} from './c4.js'
import * as consts from './constants.js'

let editor = document.querySelector('.editor')
let reloadBtn = document.querySelector('#reload-btn')
reloadBtn.addEventListener('click', redraw)

let widgetsMap = {}

function redraw() {
  cleanUp()
  let objects = parse(editor.value)
  let graph = consts.createGraph(objects, 0, 0)
  miro.board.viewport.setZoom(0.4)
  drawAllObjects(graph.vertices)
  if (graph.boundary !== null) {
    drawBoundary(graph.boundary.object.name, graph.boundary.object.type, graph.boundary.x, graph.boundary.y, graph.boundary.width, graph.boundary.height)
  }
  setTimeout(drawRelationships, 3000, graph.edges)
}

function drawAllObjects(objects) {
  for (const element of objects) {
    switch (element.object.object_type) {
      case consts.personType:
        drawPerson(element.object.name, 'Person', element.object.description, element.object.variable, element.x, element.y, element.number)
        break

      case consts.softwareSystemType:
        drawContainer(element.object.name, 'Software System', element.object.description, element.object.variable, element.x, element.y, element.number)
        break

      case consts.existingSoftwareSystemType:
        drawContainer(element.object.name, 'Existing Software System', element.object.description, element.object.variable, element.x, element.y, element.number, true)
        break

      case consts.containerType:
        drawContainer(element.object.name, 'Container: ' + element.object.technology, element.object.description, element.object.variable, element.x, element.y, element.number)
        break

      case consts.componentType:
        drawContainer(element.object.name, 'Component: ' + element.object.technology, element.object.description, element.object.variable, element.x, element.y, element.number)
        break

      case consts.databaseType:
        drawDatabase(element.object.name, 'Container: ' + element.object.technology, element.object.description, element.object.variable, element.x, element.y, element.number)
        break

      default:
        break
    }
  }
}

function cleanUp() {
  for (const key in widgetsMap) {
    for (const id of widgetsMap[key]) {
      miro.board.widgets.deleteById(id)
    }
  }
  widgetsMap = {}
}

function drawPerson(name, role, description, variableName, x, y, number) {
  let text = consts.createText(name, role, description)
  let shape = consts.newShape(consts.shapeTypeRoundedRectangle, text, consts.personBackgroundColor,
    consts.personBorderColor, consts.shapeTextColor, x, y, consts.personRectangleWidth, consts.personRectangleHeight)

  miro.board.widgets.create(shape).then((shape) => {
    let personRectangle = shape[0]
    widgetsMap[number] = [personRectangle.id]
  })

  shape = consts.newShape(consts.shapeTypeCircle, '', consts.personBackgroundColor,
    consts.personBorderColor, consts.shapeTextColor, x, y - 90, consts.personCircleDiameter, consts.personCircleDiameter)
  miro.board.widgets.create(shape).then((shape) => {
    let personCircle = shape[0]
    widgetsMap[number].push(personCircle.id)
  })
}

function drawContainer(name, role, description, variableName, x, y, number, isExist = false) {
  let backgroundColor = consts.containerColor
  let borderColor = consts.containerBorderColor
  if (isExist === true) {
    backgroundColor = consts.existingSystemBackgroundColor
    borderColor = consts.existingSystemBorderColor
  }

  let text = consts.createText(name, role, description)
  let system = consts.newShape(consts.shapeTypeRectangle, text, backgroundColor, borderColor, consts.shapeTextColor,
    x, y, consts.containerWidth, consts.containerHeight)

  miro.board.widgets.create(system).then((shape) => {
    let systemRectangle = shape[0]
    widgetsMap[number] = [systemRectangle.id]
  })
}

function drawRelationships(edges) {
  for (let i = 0; i < edges.length; i++) {
    for (let j = 0; j < edges[i].length; j++) {
      if (edges[i][j]) {
        let startID = widgetsMap[i][0]
        let endID = widgetsMap[j][0]
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
    }
  }
  // let startID = widgetsMap[start][0]
  // let endID = widgetsMap[end][0]
  // let line = {
  //   endWidgetId: endID,
  //   startWidgetId: startID,
  //   // text не поддерживается в API :(
  //   // captions: [{"text": description}],
  //   style: {
  //     lineColor: "#808080",
  //     lineEndStyle: 1,
  //     lineStartStyle: 0,
  //     lineStyle: 1,
  //     lineThickness: 1,
  //     lineType: 0
  //   },
  //   type: "LINE"
  // }
  //
  // miro.board.widgets.create(line).then((shape) => {
  //   let relationship = shape[0]
  //   widgetsMap[relationship.id] = [relationship.id]
  // })
}

function drawBoundary(name, type, x, y, w, h) {
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
    x: x,
    y: y,
    style: style,
    width: w,
    height: h,
  }).then((shape) => {
    let boundary = shape[0]
    widgetsMap[boundary] = [boundary.id]
  })
}

function drawDatabase(name, role, description, variableName, x, y, number) {
  let text = consts.createText(name, role, description)
  let shape = consts.newShape(consts.shapeTypeCylinder, text, consts.containerColor, consts.containerBorderColor,
    consts.shapeTextColor, x, y, consts.containerWidth, consts.databaseHeight)

  miro.board.widgets.create(shape).then((result) => {
    let database = result[0]
    widgetsMap[number] = [database.id]
  })
}
