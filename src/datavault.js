import { Dao } from '../futur-lib/data.js'
import { EfsLogin } from './Entities/EfsLogin.js'
import { Game } from './Entities/Game.js'
import { News } from './Entities/News.js'

export default new Dao([
{
    name: 'News',
    classDef: News
},
{
    name: 'User',
    classDef: EfsLogin
},{
    name: 'Game',
    classDef: Game
},

]);