const NS = 'NS';
const EO = 'EO';

module.exports.newMap = function(){
    return [
        {
            id:1,
            exit:false,
            chest:false,
            pos:{
                x:2,
                y:2,
            },
            orientation:NS,
            connections:{
                rooms:[2],
                directions:['E']
            }
        },
        {
            id:2,
            exit:false,
            chest:false,
            pos:{
                x:4,
                y:3,
            },
            orientation:EO,
            connections:{
                rooms:[1,3],
                directions:['O', 'S']
            }
        },
        {
            id:3,
            exit:false,
            chest:false,
            pos:{
                x:5,
                y:5,
            },
            orientation:NS,
            connections:{
                rooms:[2,5,4],
                directions:['O','E','S']
            }
        },
        {
            id:4,
            exit:false,
            chest:false,
            pos:{
                x:4,
                y:9,
            },
            orientation:EO,
            connections:{
                rooms:[3],
                directions:['N']
            }
        },
        {
            id:5,
            exit:false,
            chest:false,
            pos:{
                x:7,
                y:6,
            },
            orientation:EO,
            connections:{
                rooms:[3,6],
                directions:['O','E']
            }
        },
        {
            id:6,
            exit:false,
            chest:false,
            pos:{
                x:11,
                y:5,
            },
            orientation:NS,
            connections:{
                rooms:[5,7],
                directions:['O','S']
            }
        },
        {
            id:7,
            exit:false,
            chest:false,
            pos:{
                x:11,
                y:9,
            },
            orientation:NS,
            connections:{
                rooms:[6,9,8],
                directions:['N','E','S']
            }
        },
        {
            id:8,
            exit:false,
            chest:false,
            pos:{
                x:10,
                y:13,
            },
            orientation:EO,
            connections:{
                rooms:[7],
                directions:['N']
            }
        },
        {
            id:9,
            exit:false,
            chest:false,
            pos:{
                x:13,
                y:10,
            },
            orientation:EO,
            connections:{
                rooms:[7,10],
                directions:['O','N']
            }
        },
        {
            id:10,
            exit:false,
            chest:false,
            pos:{
                x:14,
                y:6,
            },
            orientation:NS,
            connections:{
                rooms:[9],
                directions:['S']
            }
        }
    ]
}

module.exports.getChars = function(){
    let chars = [{
        name:"Char A",
        picture:"https://dummyimage.com/150x150/000/fff.png&text=A",
        id:0,
        alive:true
    },
    {
        name:"Char B",
        picture:"https://dummyimage.com/150x150/d10fd1/0011ff.png&text=B",
        id:1,
        alive:true
    },{
        name:"Char C",
        picture:"https://dummyimage.com/150x150/26cf10/ff0000.png&text=C",
        id:2,
        alive:true
    },{
        name:"Char D",
        picture:"https://dummyimage.com/150x150/4800ff/bfff00.png&text=D",
        id:3,
        alive:true
    },{
        name:"Char E",
        picture:"https://dummyimage.com/150x150/00ff91/ad00bd.png&text=E",
        id:4,
        alive:true
    },{
        name:"Char F",
        picture:"https://dummyimage.com/150x150/00b7ff/0026ff.png&text=F",
        id:5,
        alive:true
    },{
        name:"Char G",
        picture:"https://dummyimage.com/150x150/ccff00/00ff15.png&text=G",
        id:6,
        alive:true
    },{
        name:"Char H",
        picture:"https://dummyimage.com/150x150/00ff1e/0000ff.png&text=H",
        id:7,
        alive:true
    },{
        name:"Char I",
        picture:"https://dummyimage.com/150x150/ff0000/7bff00.png&text=I",
        id:8,
        alive:true
    },{
        name:"Char J",
        picture:"https://dummyimage.com/150x150/0000ff/ff0000.png&text=J",
        id:9,
        alive:true
    }]
    return chars;
}

module.exports.getDice = function(min, max) {
    if (typeof max === 'undefined') {
        max = min;
        min = 1;
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

module.exports.shuffleArray = function(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
