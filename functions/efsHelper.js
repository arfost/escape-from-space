/* eslint-disable no-loop-func */
const NS = 'NS';
const EO = 'EO';

class DungeonGenerator {

    getNewDungeon(size) {
        this.rooms = [];

        let activeRoom = this.getNextRoom();
        this.rooms.push(activeRoom);

        /*
        let connection = {
            orientationConstraint:1,
            direction:'N'
        }

        let newRoom = this.getNextRoom(activeRoom, connection);
                
        activeRoom.connections.rooms.push(newRoom.id);
        activeRoom.connections.directions.push(connection.direction);

        newRoom.connections.rooms.push(activeRoom.id);
        newRoom.connections.directions.push(this.inverseDirection(connection.direction));

        //activeRoom = newRoom;
        this.rooms.push(newRoom);

        console.log(this.findNextConnection(activeRoom))
        */
        
        while (this.rooms.length < size) {
            let connection = this.findNextConnection(activeRoom);
            if (connection) {
                
                let newRoom = this.getNextRoom(activeRoom, connection);
                
                activeRoom.connections.rooms.push(newRoom.id);
                activeRoom.connections.directions.push(connection.direction);

                newRoom.connections.rooms.push(activeRoom.id);
                newRoom.connections.directions.push(this.inverseDirection(connection.direction));

                this.addConnections(this.rooms, newRoom);

                activeRoom = newRoom;
                this.rooms.push(activeRoom);
            } else {
                let parent = this.rooms.find(room => room.id === activeRoom.id - 1);
                activeRoom = parent ? parent : this.rooms[this.rooms.length - 1];
            }
        }
        
        
        this.rooms[this.rooms.length - 1].chest = true;
        console.log(JSON.stringify(this.rooms, null, 4))

        return this.rooms;
    }

    addConnections(rooms, newRoom) {

        let posNordNS = this.createPosForRoom(newRoom, 'N', NS);
        let posNordEO = this.createPosForRoom(newRoom, 'N', EO);

        let posSouthNS = this.createPosForRoom(newRoom, 'S', NS);
        let posSouthEO = this.createPosForRoom(newRoom, 'S', EO);

        let posWestNS = this.createPosForRoom(newRoom, 'O', NS);
        let posWestEO = this.createPosForRoom(newRoom, 'O', EO);


        let posEastNS = this.createPosForRoom(newRoom, 'E', NS);
        let posEastEO = this.createPosForRoom(newRoom, 'E', EO);

        for (let room of rooms) {
            if ((room.pos.x === posNordNS.x && room.pos.y === posNordNS.y) || (room.pos.x === posNordEO.x && room.pos.y === posNordEO.y)) {
                room.connections.directions.push('S');
                room.connections.rooms.push(newRoom.id);

                newRoom.connections.directions.push('N');
                newRoom.connections.rooms.push(room.id);
            }

            if ((room.pos.x === posSouthNS.x && room.pos.y === posSouthNS.y) || (room.pos.x === posSouthEO.x && room.pos.y === posSouthEO.y)) {
                room.connections.directions.push('N');
                room.connections.rooms.push(newRoom.id);

                newRoom.connections.directions.push('S');
                newRoom.connections.rooms.push(room.id);
            }

            if ((room.pos.x === posWestNS.x && room.pos.y === posWestNS.y) || (room.pos.x === posWestEO.x && room.pos.y === posWestEO.y)) {
                room.connections.directions.push('E');
                room.connections.rooms.push(newRoom.id);

                newRoom.connections.directions.push('O');
                newRoom.connections.rooms.push(room.id);
            }

            if ((room.pos.x === posEastNS.x && room.pos.y === posEastNS.y) || (room.pos.x === posEastEO.x && room.pos.y === posEastEO.y)) {
                room.connections.directions.push('O');
                room.connections.rooms.push(newRoom.id);

                newRoom.connections.directions.push('E');
                newRoom.connections.rooms.push(room.id);
            }
        }

    }

    inverseDirection(direction){
        switch(direction){
            case 'N': return 'S';
            case 'S': return 'N';
            case 'E': return 'O';
            case 'O': return 'E';
        }
        throw new Error("unknow direction "+direction)
    }

    getSquarePos(pos, orientation){
        return {
            x:pos.x,
            y:pos.y,
            xMax:pos.x+(orientation === NS ? 1 : 3),
            yMax:pos.y+(orientation === EO ? 1 : 3)
        }
    }

    isOnAnotherRoom(rooms, newRoom){
        let rect2 = this.getSquarePos(newRoom.pos, newRoom.orientation);
        for(let room of rooms){
            let rect1 = this.getSquarePos(room.pos, room.orientation);          
            if(rect1.x <= rect2.xMax &&
                rect1.xMax >= rect2.x &&
                rect1.y <= rect2.yMax &&
                rect1.yMax >= rect2.y ) {
                    return true;
            }
            
            if (rect2.x < 1 || rect2.xMax > 15 || rect2.y < 1 || rect2.yMax > 15) {
                return true;
            }
        }
        return false;
    }

    findNextConnection(room){
        
        let possible = [];
        
        //test north
        console.log('pouet')
        let posNordNS = this.createPosForRoom(room, 'N', NS);
        let canNS = !this.isOnAnotherRoom(this.rooms, { pos: posNordNS, orientation: NS });

        let posNordEO = this.createPosForRoom(room, 'N', EO);
        let canEO = !this.isOnAnotherRoom(this.rooms, { pos: posNordEO, orientation: EO });

        if (canNS && !canEO) {
            possible.push({
                orientationConstraint:1,
                direction:'N'
            })
        }

        if (!canNS && canEO) {
            possible.push({
                orientationConstraint:2,
                direction:'N'
            })
        }

        if (canEO && canNS) {
            possible.push({
                direction:'N'
            })
        }

        //test south
        console.log('pouet')
        let posSouthNS = this.createPosForRoom(room, 'S', NS);
        canNS = !this.isOnAnotherRoom(this.rooms, { pos: posSouthNS, orientation: NS });

        let posSouthEO = this.createPosForRoom(room, 'S', EO);
        canEO = !this.isOnAnotherRoom(this.rooms, { pos: posSouthEO, orientation: EO });

        if (canNS && !canEO) {
            possible.push({
                orientationConstraint:1,
                direction:'S'
            })
        }

        if (!canNS && canEO) {
            possible.push({
                orientationConstraint:2,
                direction:'S'
            })
        }

        if (canEO && canNS) {
            possible.push({
                direction:'S'
            })
        }

        //test ouest
        console.log('pouet')
        let posWestNS = this.createPosForRoom(room, 'O', NS);
        canNS = !this.isOnAnotherRoom(this.rooms, { pos: posWestNS, orientation: NS });

        let posWestEO = this.createPosForRoom(room, 'O', EO);
        canEO = !this.isOnAnotherRoom(this.rooms, { pos: posWestEO, orientation: EO });

        if (canNS && !canEO) {
            possible.push({
                orientationConstraint:1,
                direction:'O'
            })
        }

        if (!canNS && canEO) {
            possible.push({
                orientationConstraint:2,
                direction:'O'
            })
        }

        if (canEO && canNS) {
            possible.push({
                direction:'O'
            })
        }

        //test east
        console.log('pouet')
        let posEastNS = this.createPosForRoom(room, 'E', NS);
        canNS = !this.isOnAnotherRoom(this.rooms, { pos: posEastNS, orientation: NS });

        let posEastEO = this.createPosForRoom(room, 'E', EO);
        canEO = !this.isOnAnotherRoom(this.rooms, { pos: posEastEO, orientation: EO });

        if (canNS && !canEO) {
            possible.push({
                orientationConstraint:1,
                direction:'E'
            })
        }

        if (!canNS && canEO) {
            possible.push({
                orientationConstraint:2,
                direction:'E'
            })
        }

        if (canEO && canNS) {
            possible.push({
                direction:'E'
            })
        }
        return possible.find(p=>getDice(1,100)<25);
    }

    getNextRoom(connectedRomm, link){

        let orientation = this.getOrientation(link ? link.orientationConstraint : undefined);
        let pos = connectedRomm ? this.createPosForRoom(connectedRomm, link.direction, orientation) : {x:7, y:7}

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
                    y -= 2;
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
                    y += 1;
                    x -= 2;
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
            name: "The tourist",
            picture: "/img/game/char1.png",
            id: 0,
            alive: true,
            desc: "Dummy char desc 1"
        },
        {
            name: "The mecano",
            picture: "/img/game/char2.png",
            id: 1,
            alive: true,
            desc: "Dummy char desc 2"
        }, {
            name: "The savage warrior",
            picture: "/img/game/char3.png",
            id: 2,
            alive: true,
            desc: "Dummy char desc 3"
        }, {
            name: "The comm guy",
            picture: "/img/game/char4.png",
            id: 3,
            alive: true,
            desc: "Dummy char desc 4"
        }, {
            name: "The showbiz star",
            picture: "/img/game/char5.png",
            id: 4,
            alive: true,
            desc: "Dummy char desc 5"
        }, {
            name: "The scientist",
            picture: "/img/game/char6.png",
            id: 5,
            alive: true,
            desc: "Dummy char desc 6"
        }, {
            name: "The doctor",
            picture: "/img/game/char7.png",
            id: 6,
            alive: true,
            desc: "Dummy char desc 7"
        }, {
            name: "The strange guy",
            picture: "/img/game/char8.png",
            id: 7,
            alive: true,
            desc: "Dummy char desc 8"
        }, {
            name: "The captain",
            picture: "/img/game/char9.png",
            id: 8,
            alive: true,
            desc: "Dummy char desc 9"
        }, {
            name: "The security guy",
            picture: "/img/game/char10.png",
            id: 9,
            alive: true,
            desc: "Dummy char desc 10"
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