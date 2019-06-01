/* eslint-disable no-loop-func */
const NS = 'NS';
const EO = 'EO';

class DungeonGenerator {

    getNewDungeon(size){
        this.rooms = [];

        let activeRoom = this.getNextRoom();
        this.rooms.push(activeRoom);

        while(this.rooms.length<size){
            let connection = this.findNextConnection(activeRoom);
            if(connection){
                
                let newRoom = this.getNextRoom(activeRoom, connection);
                if(this.isOnAnotherRoom(this.rooms, newRoom)){
                    let parent = this.rooms.find(room=>room.id === activeRoom.id -1);
                    activeRoom = parent ? parent : activeRoom;
                    continue;
                }
                activeRoom.connections.rooms.push(newRoom.id);
                activeRoom.connections.directions.push(connection.direction);

                newRoom.connections.rooms.push(activeRoom.id);
                newRoom.connections.directions.push(this.inverseDirection(connection.direction));

                activeRoom = newRoom;
                this.rooms.push(activeRoom);
            }else{
                let parent = this.rooms.find(room=>room.id === activeRoom.id -1);
                activeRoom = parent ? parent : this.rooms[this.rooms.length-1];
            }
        }

        this.rooms[this.rooms.length-1].chest = true;
        console.log(JSON.stringify(this.rooms, null, 4))
        return this.rooms;
    }

    inverseDirection(direction){
        switch(direction){
            case 'N': return 'S';
            case 'S': return 'N';
            case 'E': return 'O';
            case 'O': return 'E';
        }
        throw new Error("unknow direction ", )
    }

    getSquarePos(pos, orientation){
        return {
            x:pos.x,
            y:pos.y,
            xMax:pos.x+(orientation === NS ? 2 : 4),
            yMax:pos.y+(orientation === EO ? 2 : 4)
        }
    }

    isOnAnotherRoom(rooms, newRoom){
        let rect2 = this.getSquarePos(newRoom.pos, newRoom.orientation);
        for(let room of rooms){
            let rect1 = this.getSquarePos(room.pos, room.orientation);
            if(rect1.x < rect2.xMax &&
                rect1.xMax > rect2.x &&
                rect1.y < rect2.yMax &&
                rect1.yMax > rect2.y){
                    return true;
                }
        }
        return false;
    }

    findNextConnection(room){
        
        let possible = [];
        
        //test north
        let posNordNS = this.createPosForRoom(room, 'N', )
        if(room.pos.y-2 > 0 && !room.connections.directions.includes('N')){
            possible.push({
                orientationConstraint:room.pos.y-4>0 ? undefined: 2,
                direction:'N'
            })
        }

        //test south
        if(room.pos.y+2 < 15 && !room.connections.directions.includes('S')){
            possible.push({
                orientationConstraint:room.pos.y+4 < 15 ? undefined: 2,
                direction:'S'
            })
        }

        //test ouest
        if(room.pos.x-2 > 1 && !room.connections.directions.includes('O')){
            possible.push({
                orientationConstraint:room.pos.y-4 > 1 ? undefined: 1,
                direction:'O'
            })
        }

        //test east
        if(room.pos.x+2 < 15 && !room.connections.directions.includes('E')){
            possible.push({
                orientationConstraint:room.pos.y+4 < 15 ? undefined: 1,
                direction:'E'
            })
        }

        return possible.find(p=>getDice(1,100)<25);
    }

    getNextRoom(connectedRomm, link){

        let orientation = this.getOrientation(link ? link.orientationConstraint : undefined);
        let pos = connectedRomm ? this.createPosForRoom(connectedRomm, link.direction, connectedRomm.orientation, orientation) : {x:7, y:7}

        return {
            id: this.rooms.length+1,
            exit: this.rooms.length+1 === 1,
            chest: false,
            pos: pos,
            orientation: orientation,
            connections: {
                rooms: [],
                directions: []
            }
        }
    }

    createPosForRoom(connectedRomm, direction, selfOrientation){
        let x = connectedRomm.pos.x;
        let y = connectedRomm.pos.y;

        let orientation = connectedRomm.orientation;

        if(direction === 'N'){
            if(orientation === NS){
                if(selfOrientation === EO){
                    x -= 1;
                    y +=2;
                }
                y -= 4;
            }
            if(orientation === EO){
                if(selfOrientation === NS){
                    x += 1;
                }
                y -= 2;
            }
        }

        if(direction === 'S'){
            if(orientation === NS){
                if(selfOrientation === EO){
                    x -= 1;
                }
                y += 4;
            }
            if(orientation === EO){
                if(selfOrientation === NS){
                    x += 1;
                }
                y += 2;
            }
        }

        if(direction === 'E'){
            if(orientation === NS){
                if(selfOrientation === EO){
                    y += 1;
                }
                x += 2;
            }
            if(orientation === EO){
                if(selfOrientation === NS){
                    y -= 1;
                }
                x += 4;
            }
        }

        if(direction === 'O'){
            if(orientation === NS){
                if(selfOrientation === EO){
                    y -= 1;
                }
                x -= 2;
            }
            if(orientation === EO){
                if(selfOrientation === NS){
                    y -= 1;
                    x += 2;
                }
                x -= 4;
            }
        }
        return {x, y}
    }

    getOrientation(orientationConstraint = getDice(1,2)){
        return  orientationConstraint === 1 ? NS:EO;
    }

}

const generator = new DungeonGenerator();

module.exports.newMap = function () {
    return generator.getNewDungeon(10);
}

module.exports.getChars = function () {
    let chars = [{
            name: "Char A",
            picture: "https://dummyimage.com/150x150/000/fff.png&text=A",
            id: 0,
            alive: true,
            desc: "Smith n'est bien entendu pas de réel nom de Yuri, le mécano du vaisseau. Après avoir fuit la station de réparation sur laquelle il travaillait à cause d'une erreur banale commise sur le vaisseau d'un parrain mafieu tout sauf banal. Depuis, Yuri se fait discret, mais cette fois il va tout donner. Qu'importe le nombre de capsules, un jour il reverra sa famille."
        },
        {
            name: "Char B",
            picture: "https://dummyimage.com/150x150/d10fd1/0011ff.png&text=B",
            id: 1,
            alive: true
        }, {
            name: "Char C",
            picture: "https://dummyimage.com/150x150/26cf10/ff0000.png&text=C",
            id: 2,
            alive: true
        }, {
            name: "Char D",
            picture: "https://dummyimage.com/150x150/4800ff/bfff00.png&text=D",
            id: 3,
            alive: true
        }, {
            name: "Char E",
            picture: "https://dummyimage.com/150x150/00ff91/ad00bd.png&text=E",
            id: 4,
            alive: true
        }, {
            name: "Char F",
            picture: "https://dummyimage.com/150x150/00b7ff/0026ff.png&text=F",
            id: 5,
            alive: true
        }, {
            name: "Char G",
            picture: "https://dummyimage.com/150x150/ccff00/00ff15.png&text=G",
            id: 6,
            alive: true
        }, {
            name: "Char H",
            picture: "https://dummyimage.com/150x150/00ff1e/0000ff.png&text=H",
            id: 7,
            alive: true
        }, {
            name: "Char I",
            picture: "https://dummyimage.com/150x150/ff0000/7bff00.png&text=I",
            id: 8,
            alive: true
        }, {
            name: "Char J",
            picture: "https://dummyimage.com/150x150/0000ff/ff0000.png&text=J",
            id: 9,
            alive: true
        }
    ]
    return chars;
}

const getDice = function (min, max) {
    if (typeof max === 'undefined') {
        max = min;
        min = 1;
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

module.exports.getDice = getDice;

module.exports.shuffleArray = function (a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}