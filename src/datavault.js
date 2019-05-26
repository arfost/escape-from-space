import { Dao } from '../futur-lib/data.js'
import { EfsLogin } from './Entities/EfsLogin.js'
import { Game } from './Entities/Game.js'

export default new Dao([{
    name: 'User',
    classDef: EfsLogin
},{
    name: 'Game',
    classDef: Game
}]);