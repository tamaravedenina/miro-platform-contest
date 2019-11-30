export const stepX = 310
export const stepY = 240
export const fontSize = 12
export const fontFamily = 10
export const maxOneLineObjectsCount = 5

// miro shape types
export const shapeTypeCircle = 4
export const shapeTypeRoundedRectangle = 7
export const shapeTypeRectangle = 3
export const shapeTypeCylinder = 26

export const shapeTextColor = '#ffffff'
export const boundaryTextColor = '#1a1a1a'
export const personBackgroundColor = '#2a4897'
export const personBorderColor = '#1a3993'
export const boundaryColor = '#808080'
export const containerColor = '#1f6daa'
export const containerBorderColor = '#11568e'
export const existingSystemBackgroundColor = '#908d8f'
export const existingSystemBorderColor = '#555555'

export const containerWidth = 200
export const containerHeight = 136
export const databaseHeight = 150
export const personRectangleWidth = 190
export const personRectangleHeight = 116
export const personCircleDiameter = 80

// my types
export const personType = 1
export const softwareSystemType = 2
export const existingSoftwareSystemType = 3
export const relationshipType = 4
export const enterpriseBoundaryType = 5
export const containerType = 6
export const componentType = 7
export const databaseType = 8

export function createText(name, role, description) {
  return `<p><strong style="color:rgb(255,255,255)">${name}</strong></p><p>[${role}]</p><p><br/></p><p>${description}</p>`
}

function newRectangleStyle(type, backgroundColor, borderColor, textColor) {
  return {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    borderWidth: 1,
    shapeType: type,
    textColor: textColor,
    fontSize: fontSize,
    fontFamily: fontFamily
  }
}

export function newShape(type, text, backgroundColor, borderColor, textColor, x, y, width, height) {
  return {
    type: 'shape',
    text: text,
    x: x,
    y: y,
    style: newRectangleStyle(type, backgroundColor, borderColor, textColor),
    width: width,
    height: height,
  }
}

export function createGraph(objects, x0, y0) {
  let countObjects = 0
  let vertices = []
  let objectsMap = {}
  let boundaryObject = null
  for (const element of objects) {
    switch (element.object_type) {
      case enterpriseBoundaryType:
        boundaryObject = element
        for (const container of element.systems) {
          vertices[countObjects] = {
            isVisited: false,
            number: countObjects,
            level: 0,
            object: container,
            inBoundary: true,
            x: 0,
            y: 0
          }
          objectsMap[container.variable] = countObjects
          countObjects++
        }
        break
      case relationshipType:
        break
      default:
        vertices[countObjects] = {
          isVisited: false,
          number: countObjects,
          level: 0,
          object: element,
          inBoundary: false,
          x: 0,
          y: 0
        }
        objectsMap[element.variable] = countObjects
        countObjects++
        break
    }
  }
  // создаем матрицу смежности
  let edges = []
  for (let i = 0; i < countObjects; i++) {
    edges[i] = []
    for (let j = 0; j < countObjects; j++) {
      edges[i][j] = false
    }
  }
  // заполняем ее
  for (const element of objects) {
    if (element.object_type === relationshipType && objectsMap.hasOwnProperty(element.start) && objectsMap.hasOwnProperty(element.end)) {
      edges[objectsMap[element.start]][objectsMap[element.end]] = true
    }
  }
  // идем вглубину и расставляем уровни
  for (let i = 0; i < countObjects; i++) {
    if (!vertices[i].isVisited) {
      vertices = dfs(i, vertices, edges, 0)
    }
  }
  let levelsCount = {}
  for (let i = 0; i < vertices.length; i++) {
    levelsCount[i] = 0
  }
  let boundary = null
  if (boundaryObject !== null) {
    let rowsCount = 0
    let columnsCount = 0
    let elementX0 = x0 + (vertices.length + 1) * stepX
    let elementY0 = y0 + (vertices.length + 1) * stepY
    // считаем координаты для вершин внутри границы, получившееся количество строк и столбцов
    // и координаты самого первого верхнего элемента внутри границы
    for (const element of vertices) {
      if (element.inBoundary) {
        element.x = x0 + levelsCount[element.level] * stepX
        element.y = y0 + element.level * stepY
        if (element.x < elementX0) {
          elementX0 = element.x
        }
        if (element.y < elementY0) {
          elementY0 = element.y
        }
        levelsCount[element.level] += 1
        if (levelsCount[element.level] > columnsCount) {
          columnsCount = levelsCount[element.level]
        }
        if (element.level > rowsCount) {
          rowsCount = element.level
        }
      }
    }

    boundary = {x: 0, y: 0, width: 200, height: 200, object: boundaryObject}
    // определяем границы
    boundary.height = rowsCount * containerHeight + (rowsCount - 1) * (stepY - containerHeight) + 3 * 40
    boundary.width = columnsCount * containerWidth + (columnsCount - 1) * (stepX - containerWidth) + 2 * 40
    let boundaryX0 = elementX0 - containerWidth / 2 - 40
    let boundaryY0 = elementY0 - containerHeight / 2 - 40
    let boundaryX = boundaryX0 + boundary.width
    let boundaryY = boundaryY0 + boundary.height
    boundary.x = boundaryX0 + boundary.width / 2
    boundary.y = boundaryY0 + boundary.height / 2
    // считаем координаты для вершин вне границы
    for (const element of vertices) {
      if (!element.inBoundary) {
        let x = x0 + levelsCount[element.level] * stepX
        let y = y0 + element.level * stepY
        while (x <= boundaryX && x >= boundaryX0 && y <= boundaryY && y >= boundaryY0) {
          x += stepX
          y += stepY
        }
        element.x = x
        element.y = y
        levelsCount[element.level] += 1
      }
    }
  } else {
    for (const element of vertices) {
      element.x = x0 + levelsCount[element.level] * stepX
      element.y = y0 + element.level * stepY
      levelsCount[element.level] += 1
    }
  }

  return {vertices: vertices, boundary: boundary, edges: edges}
}

function dfs(start, vertices, edges, level) {
  vertices[start].isVisited = true
  vertices[start].level = level
  for (let end = 0; end < edges[start].length; end++) {
    if (edges[start][end]) {
      if (!vertices[end].isVisited) {
        vertices = dfs(end, vertices, edges, level + 1)
      } else if (vertices[end].isVisited && vertices[end].level > level) {
        vertices = dfs(end, vertices, edges, level + 1)
      }
    }
  }

  return vertices
}