import {peg$parse as parse} from './c4.js'
import * as shapes from './shapes.js'

let editor = document.querySelector('.editor')
editor.value = shapes.startText
let reloadBtn = document.querySelector('#reload-btn')
reloadBtn.addEventListener('click', redraw)

let widgetsMap = {}

function redraw() {
  cleanUp()
  // подождем, пока все удалится
  setTimeout(drawAll, 300)

}

function drawAll() {
  try {
    let objects = parse(editor.value)
    let graph = shapes.createGraph(objects, 0, 0)
    miro.board.viewport.setZoom(0.4)
    drawAllObjects(graph.vertices)
    if (graph.boundary !== null) {
      drawBoundary(graph.boundary.object.name, graph.boundary.object.type, graph.boundary.x, graph.boundary.y, graph.boundary.width, graph.boundary.height)
    }
    setTimeout(drawRelationships, 700, graph.edges)
  } catch (e) {
    miro.showErrorNotification(e.message)
  }
}

function drawAllObjects(objects) {
  for (const element of objects) {
    switch (element.object.object_type) {
      case shapes.personType:
        drawPerson(element.object.name, 'Person', element.object.description, element.object.variable, element.x, element.y, element.number)
        break

      case shapes.softwareSystemType:
        drawContainer(element.object.name, 'Software System', element.object.description, element.object.variable, element.x, element.y, element.number)
        break

      case shapes.existingSoftwareSystemType:
        drawContainer(element.object.name, 'Existing Software System', element.object.description, element.object.variable, element.x, element.y, element.number, true)
        break

      case shapes.containerType:
        drawContainer(element.object.name, 'Container: ' + element.object.technology, element.object.description, element.object.variable, element.x, element.y, element.number)
        break

      case shapes.componentType:
        drawContainer(element.object.name, 'Component: ' + element.object.technology, element.object.description, element.object.variable, element.x, element.y, element.number)
        break

      case shapes.databaseType:
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
  let text = shapes.createText(name, role, description)
  let shape = shapes.newShape(shapes.shapeTypeRoundedRectangle, text, shapes.personBackgroundColor,
    shapes.personBorderColor, shapes.shapeTextColor, x, y, shapes.personRectangleWidth, shapes.personRectangleHeight)

  miro.board.widgets.create(shape).then((shape) => {
    let personRectangle = shape[0]
    widgetsMap[number] = [personRectangle.id]
  })
  shape = shapes.newShape(shapes.shapeTypeCircle, '', shapes.personBackgroundColor,
    shapes.personBorderColor, shapes.shapeTextColor, x, y - 90, shapes.personCircleDiameter, shapes.personCircleDiameter)
  miro.board.widgets.create(shape).then((shape) => {
    let personCircle = shape[0]
    widgetsMap[number].push(personCircle.id)
  })
}

function drawContainer(name, role, description, variableName, x, y, number, isExist = false) {
  let backgroundColor = shapes.containerColor
  let borderColor = shapes.containerBorderColor
  if (isExist === true) {
    backgroundColor = shapes.existingSystemBackgroundColor
    borderColor = shapes.existingSystemBorderColor
  }

  let text = shapes.createText(name, role, description)
  let system = shapes.newShape(shapes.shapeTypeRectangle, text, backgroundColor, borderColor, shapes.shapeTextColor,
    x, y, shapes.containerWidth, shapes.containerHeight)

  miro.board.widgets.create(system).then((shape) => {
    let systemRectangle = shape[0]
    widgetsMap[number] = [systemRectangle.id]
  })
}

function drawRelationships(edges) {
  for (let i = 0; i < edges.length; i++) {
    for (let j = 0; j < edges[i].length; j++) {
      if (edges[i][j].relation) {
        let startID = widgetsMap[i][0]
        let endID = widgetsMap[j][0]
        let text = edges[i][j].object.description
        if (edges[i][j].object.technology !== null) {
          text += `\n[${edges[i][j].object.technology}]`
        }
        let line = {
          endWidgetId: endID,
          startWidgetId: startID,
          // text: text,
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
}

function drawBoundary(name, type, x, y, w, h) {
  let style = {
    backgroundColor: 'transparent',
    backgroundOpacity: 1,
    borderColor: shapes.boundaryColor,
    borderOpacity: 1,
    borderStyle: 1,
    borderWidth: 1,
    fontFamily: shapes.fontFamily,
    fontSize: shapes.fontSize,
    shapeType: shapes.shapeTypeRectangle,
    textAlign: 'l',
    textAlignVertical: 'b',
    textColor: shapes.boundaryTextColor,
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
  let text = shapes.createText(name, role, description)
  let shape = shapes.newShape(shapes.shapeTypeCylinder, text, shapes.containerColor, shapes.containerBorderColor,
    shapes.shapeTextColor, x, y, shapes.containerWidth, shapes.databaseHeight)

  miro.board.widgets.create(shape).then((result) => {
    let database = result[0]
    widgetsMap[number] = [database.id]
  })
}
