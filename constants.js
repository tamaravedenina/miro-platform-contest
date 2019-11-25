export const acrossStep = 300
export const downStep = 250
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

export const personType = 1
export const softwareSystemType = 2
export const existingSoftwareSystemType = 3
export const relationshipType = 4
export const enterpriseBoundaryType = 5
export const containerType = 6
export const componentType = 7
export const databaseType = 8

export function createText(name, role, descripton) {
  return `<p><strong style="color:rgb(255,255,255)">${name}</strong></p><p>[${role}]</p><p><br/></p><p>${descripton}</p>`
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
