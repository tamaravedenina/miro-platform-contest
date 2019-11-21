export const acrossStep = 300
export const downStep = 250

export const maxOneLineObjectsCount = 5

export const shipTypeCircle = 4
export const shipTypeRoundedRectangle = 7
export const shipTypeRectangle = 3
export const personBackgroundColor = "#2a4897"
export const personTextColor = "#ffffff"
export const personBorderColor = "#1a3993"
export const personRectangleWidth = 190
export const personRectangleHeight = 115
export const personCircleDiameter = 80

export const systemBackgroundColor = "#1f6daa"
export const systemBorderColor = "#11568e"
export const systemTextColor = "#ffffff"
export const systemRectangleWidth = 200
export const systemRectangleHeight = 135
export const systemRectangleStyle = {
    backgroundColor: systemBackgroundColor,
    borderColor: systemBorderColor,
    borderWidth: 1,
    shapeType: shipTypeRectangle,
    textColor: systemTextColor,
    fontSize: 12,
    fontFamily: 10
}

export const existingSystemBackgroundColor = "#908d8f"
export const existingSystemBorderColor = "#555555"
export const existingSystemRectangleStyle = {
    backgroundColor: existingSystemBackgroundColor,
    borderColor: existingSystemBorderColor,
    borderWidth: 1,
    shapeType: shipTypeRectangle,
    textColor: systemTextColor,
    fontSize: 12,
    fontFamily: 10
}


export const personType = 1
export const softwareSystemType = 2
export const existingSoftwareSystemType = 3
export const relationship = 4
export const enterpriseBoundary = 5

export const personRectangleStyle = {
    backgroundColor: personBackgroundColor,
    borderColor: personBorderColor,
    shapeType: shipTypeRoundedRectangle,
    textColor: personTextColor,
    fontSize: 12,
    fontFamily: 10
}
export const personCircleStyle = {
    backgroundColor: personBackgroundColor,
    borderColor: personBorderColor,
    shapeType: shipTypeCircle
}





export function createText(name, role, descripton) {
    return `<p><strong style="color:rgb(255,255,255)">${name}</strong></p><p>[${role}]</p><p><br/></p><p>${descripton}</p>`
}