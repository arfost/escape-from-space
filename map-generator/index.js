let mapConfig = {
    width:20,
    heigth:20,
    confFile:"test"
}

let corners = [
    {
        x:0,
        y:0,
        type:"corner-se"
    },
    {
        x:mapConfig.width,
        y:0,
        type:"corner-so"
    },
    {
        x:mapConfig.width,
        y:mapConfig.heigth,
        type:"corner-no"
    },
    {
        x:0,
        y:mapConfig.heigth,
        type:"corner-ne"
    }
]

let rows = [];
for(let i = 1; i<mapConfig.width; i++){
    rows.push({
        x:0,
        y:i,
        type:"wall-eo"
    })
}
for(let i = 1; i<mapConfig.width; i++){
    rows.push({
        x:mapConfig.heigth,
        y:i,
        type:"wall-eo"
    })
}

let columns = [];
for(let i = 1; i<mapConfig.heigth; i++){
    columns.push({
        x:i,
        y:0,
        type:"wall-ns"
    })
}
for(let i = 1; i<mapConfig.heigth; i++){
    columns.push({
        x:i,
        y:mapConfig.width,
        type:"wall-ns"
    })
}

let base = [...corners, ...rows, ...columns];

let mapDesc = require(`./map-desc/${mapConfig.confFile}.json`);

let speCells = [...base, ...mapDesc];

let indexedCells = speCells.reduce((acc, cell)=>{
    acc[`${cell.x}/${cell.y}`] = cell;
    return acc;
}, {})

let map = [];
for(let i = 0; i<=mapConfig.heigth; i++){
    for(let j = 0; j<=mapConfig.width; j++){
        if(indexedCells[`${j}/${i}`]){
            map.push(indexedCells[`${j}/${i}`])
        }else{
            map.push({
                x:j,
                y:i,
                type:"default"
            })
        }
    }
}

let cases = require('./case-desc/cases.json');
require('fs').writeFileSync(`./out/${mapConfig.confFile}.json`, JSON.stringify(map.map(cell=>{
    console.log(cell.type)
    let baseCell = cases[cell.type];
    return {
        img:(baseCell.img ? baseCell.img : `${cell.type}.png`),
        passable:baseCell.passable,
        pos:`${cell.x}/${cell.y}`
    }
},null,4)))