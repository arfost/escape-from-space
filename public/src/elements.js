import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';
import { directive } from 'https://unpkg.com/lit-html@0.10.2/lit-html.js?module';
//import { until } from 'https://unpkg.com/lit-html@0.10.2/lib/until.js?module';

export const onFirebasedata = (ref, content, defaultContent) => directive(part => {
    part.setValue(defaultContent);
    ref.on("value", snap => {
        let data = snap.val();
        if (data !== undefined) {
            part.setValue(content(data))
        }
    })
});

class BaseEfsElement extends LitElement {
    constructor() {
        super()
    }

    static get is() {
        throw new Error("getter is must be overidden with the name of the element")
    }

    firebaseData(path, cb, params = []) {
        let nodeRef = firebase.app().database().ref(path);
        for (let param in params) {
            nodeRef = nodeRef[param](params[param]);
        }
        return nodeRef.on('value', (snapshot) => {
            cb(snapshot.val())
        });
    }

    firebaseRef(path, params = []) {
        let nodeRef = firebase.app().database().ref(path);
        for (let param in params) {
            nodeRef = nodeRef[param](params[param]);
        }
        return nodeRef;
    }

    firebaseSet(path, value) {
        return firebase.app().database().ref(path).set(value);
    }

    firebaseOnce(path, params = []) {
        let nodeRef = firebase.app().database().ref(path);
        for (let param in params) {
            nodeRef = nodeRef[param](params[param]);
        }
        return nodeRef.once('value').then(snap => snap.val());
    }

    firebasePush(path, value) {
        let ref = firebase.app().database().ref(path);
        let child = ref.push();
        return child.set(value);
    }

    firebaseUpdate(path, value) {
        return firebase.app().database().ref(path).update(value);
    }

    get sharedStyles() {
        return `
            .button{
                color:var(--primary-text-color,#000000);
                background-color:var(--primary-light-color, #pink)
                cursor: pointer;
                box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
                -webkit-transition: box-shadow .28s cubic-bezier(.4,0,.2,1);
                transition: box-shadow .28s cubic-bezier(.4,0,.2,1);
                will-change: box-shadow;
                min-width: 88px;
                border-radius: 1em;
            }
            .content-box{
                justify-content: space-between;
                display: flex;
                align-items: center;
                padding:1em;
            }
            .horizontal{
                flex-direction:row;
            }
            .vertical{
                flex-direction:column;
            }`
    }

    get appTheme() {
        return `
            .theme{
                --primary-color:#ef5350;
                --primary-light-color:#ff867c;
                --primary-dark-color:#b61827;
                --secondary-color:#5c6bc0;
                --secondary-light-color:#8e99f3;
                --secondary-dark-color:#26418f;
                --primary-text-color:#000000;
                --secondary-text-color:#ffffff;
            }`
    }
}

class LogHeader extends BaseEfsElement {
    static get is() { return 'log-header' }
    //we need to init values in constructor
    constructor() {
        super();
        this.showPopup = false;
        firebase.auth().getRedirectResult().then((result) => {
            this.token = result.credential.accessToken;
            this.firebaseData(`/users/${result.user.uid}`, (data) => {
                this.user = data;
            })
            this.email = result.user.email;
            this.uid = result.user.uid;
        }).catch((error) => {
            //
        });
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // User is signed in.
                this.email = user.email;
                this.uid = user.uid;
                this.firebaseData(`/users/${user.uid}`, (data) => {
                    this.user = data;
                })
                // [START_EXCLUDE]
                // [END_EXCLUDE]
            } else {
                this.user = undefined;
                this.email = undefined;
                this.uid = undefined;
            }
        });
    }
    toggleLogin() {
        if (!firebase.auth().currentUser) {
            // [START createprovider]
            var provider = new firebase.auth.GoogleAuthProvider();
            // [END createprovider]
            // [START addscopes]
            provider.addScope('https://www.googleapis.com/auth/plus.login');
            // [END addscopes]
            // [START signin]
            firebase.auth().signInWithRedirect(provider);
            // [END signin]
        } else {
            // [START signout]
            firebase.auth().signOut();
            // [END signout]
        }
    }
    static get properties() {
        return {
            user: Object,
            token: String,
            logError: Object,
            email: String,
            showPopup: Boolean
        }
    }

    get selfStyle() {
        return `
            .header{
                background-color:var(--primary-color, pink);
                width:100%;
                height:5em;
                position:fixed;
                box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
                top:0;
                left:0;
            }
            .footer{
                background-color:var(--primary-color, green);
                width:100%;
                height:5em;
                position:fixed;
                box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
                bottom:0;
                left:0;
            }
            .avatar{

            }
            .accountInfos{
                padding:1em;
            }
            .accountInfos span{
                padding:1em;
            }
        `
    }

    get errorHtml() {
        return html`
            <div>hey error</div>
        `
    }

    content(user) {
        if (user) {
            return html`<efs-shell user="${user}"></efs-shell>`
        } else {
            return html`first login and configure your account before playing`
        }
    }

    get userInit() {
        return {
            game: false
        }
    }

    confUser(detail) {
        if (detail.cancel) {
            this.showPopup = false;
            return
        }
        this.firebaseUpdate(`/users/${this.uid}`, Object.assign(this.userInit, this.user, {
            uid: this.uid
        }, detail)).then(() => {
            this.showPopup = false;
        })
    }
    _render({ user, token, logError, email, showPopup }) {
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="header content-box">
            <div>
            <div on-click="${() => {
                this.showPopup = true
            }}">conf</div>
                ${
            (showPopup ?
                html`<conf-account-popup title="Configure account"  on-validate="${e => this.confUser(e.detail)}"></conf-account-popup>` :
                html``
            )
            }
                
                ${(user ? html`
                    <img class="avatar" src$="${user.avatar}">
                    <div>${user.name}</div>
                `:
                (email ? 'configure your account before playing' : 'login with google to play'))}
            </div>
            <div class="accountInfos"><span>${email}</span><button class='button' on-click="${e => this.toggleLogin(e)}">${email ? 'log out' : 'log in'}</button></div>
        </div>
        <div style="margin-top:8em">
            ${this.content(user)}
        </div>
        <div class="footer content-box">
            realised by arfost
        </div>
        `
    }
}

class ConfAccountPopup extends BaseEfsElement {
    static get is() { return 'conf-account-popup' }
    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            title: String
        }
    }

    get selfStyle() {
        return `
            .backdrop{
                z-index:100;
                position:absolute;
                background-color:black;
                justify-content:center;
                width:100%;
                height:100vh;
                position:fixed;
                top:0;
                left:0;
                opacity:0.5;
            }
            .backdrop > div{
                z-index:101;
                padding:1em;
                background-color:white;
                border: 0.1em solid red;
            }

            .backdrop > div{
                margin:0.5em;
            }
        `
    }

    cancel() {
        this.dispatchEvent(new CustomEvent('validate', { detail: { cancel: true } }))
    }

    validate() {

        this.dispatchEvent(new CustomEvent('validate', {
            detail:
            {
                name: this.shadowRoot.getElementById('name').value
            }
        }))
    }

    _render({ title }) {
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="backdrop content-box">
            <div >
                <div >${title}</div>
                <div>
                    <div>
                        <label for="name">Name:</label>
                        <input type="text" id="name" name="user_name">
                    </div>
                </div>
                <div>
                    <button on-click="${e => this.cancel(e)}">cancel</button>
                    <button on-click="${e => this.validate(e)}">validate</button>
                </div>
            </div>
        </div>
        `
    }
}

class EfsShell extends BaseEfsElement {
    static get is() { return 'efs-shell' }
    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            user: Object
        }
    }

    get selfStyle() {
        return `
            .efs-shell{
                border:1em solid red;
            }
        `
    }

    _render({ user }) {
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="efs-shell">
            ${(user ?
                (user.game ?
                    html`<efs-game userid$='${user.uid}' gameid$="${user.game}"></efs-game>` :
                    html`<efs-lobby userid$="${user.uid}"></efs-lobby>`) :
                html`loading`
            )
            }
        </div>
        `
    }
}

class EfsLobby extends BaseEfsElement {
    static get is() { return 'efs-lobby' }
    //we need to init values in constructor
    constructor() {
        super();
        this.firebaseData('users', data => {
            if (data) {
                this.playerList = Object.values(data);
            }
        }, {
                orderByChild: "game",
                equalTo: false
            })
        this.playerList = [];
    }

    static get properties() {
        return {
            userid: String,
            playerList: Array,
        }
    }

    get selfStyle() {
        return `
            :host{
                padding:5em;
            }
            .lobby{

            }
            .player-list{
                padding:1em;
            }
        `
    }

    playerRow(player) {
        return html`
            <div>
                ${player.name}
            </div>
        `
    }

    _render({ userid, playerList }) {
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="lobby content-box horizontal">
            <div>
                <div class="player-list content-box vertical">
                    ${playerList.map(player => this.playerRow(player))}
                </div>
                <partie-select userid="${userid}"></partie-select>
            </div>
                <game-chat type="/lobby/chat" userid="${userid}"></game-chat>
            </div>
        </div>
        `
    }
}

class GameChat extends BaseEfsElement {
    static get is() { return 'game-chat' }
    //we need to init values in constructor
    constructor() {
        super();
        this.messages = [];
    }

    static get properties() {
        return {
            userid: String,
            messages: Array,
            type: String
        }
    }

    get selfStyle() {
        return `
            :host{
                padding:5em;
            }
            .messages{
                padding:0.1em;
            }
            .new-mess{
                padding:0.2em;
            }
            .green{
                color:green;
            }
            .grey{
                color:grey;
            }
        `
    }

    message(message, userid) {
        return html`
            <div class="content-box horizontal messages">
                <span class$="${message.posterId === userid ? 'green' : 'grey'}">${onFirebasedata(this.firebaseRef(`/users/${message.posterId}/name`), (name => html`${name}`), html`loading...`)}</span>
                :
                <span>${message.text}</span>
            </div>
        `
    }

    send() {
        let message = this.shadowRoot.getElementById('message').value;
        if (message) {
            this.firebasePush(`${this.type}`, {
                posterId: this.userid,
                text: message,
                date: Date.now()
            })
            this.shadowRoot.getElementById('message').value = "";
        }
    }

    _render({ userid, messages, type }) {
        if (type && !this.requestDone) {
            this.firebaseData(`${type}`, data => {
                if (data) {
                    this.messages = Object.values(data);
                }
            }, {
                    orderByChild: "date",
                    limitToLast: 50
                });
            this.requestDone = true;
        }
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="content-box vertical">
            <div>
                <div class="player-list content-box vertical">
                    ${messages.map(message => this.message(message, userid))}
                </div>
            </div>
            <div class="content-box horizontal">
                <label for="message">Message:</label>
                <input type="text" id="message" name="message" style="width:70%">
                <button class="button" on-click="${e => this.send(e)}">send</button>
            </div>
        </div>
        `
    }
}

class PartieSelect extends BaseEfsElement {
    static get is() { return 'partie-select' }
    //we need to init values in constructor
    constructor() {
        super();
        this.games = [];
        this.firebaseData(`/games`, data => {
            if (data) {
                this.games = Object.values(data);
            }
        }, {
                orderByChild: "status",
                equalTo: "waiting"
            });
    }

    static get properties() {
        return {
            games: String,
            userid: Array
        }
    }

    get selfStyle() {
        return `
            :host{
            }
            .game-list{

            }
            .game{
                padding:0.2em;
            }
            .crea-box{
                color:green;
            }
        `
    }

    game(game) {
        return html`
            <div class="content-box vertical">
                <div>
                    <span>${game.name} (${onFirebasedata(this.firebaseRef(`/users/${game.creatorId}/name`), name => html`${name}`, html`loading...`)})</span>
                    <button class="button" on-click="${(() => this.joinGame(game.key))}">join</button>
                </div>
                <div>${game.playersNb}</div>
            </div>
        `
    }

    creaGame() {
        let gameName = this.shadowRoot.getElementById('game-name').value;
        if (gameName) {
            this.firebaseSet(`/users/${this.userid}/game`, `new:${gameName}`);
        }
    }

    joinGame(gameKey) {
        if (gameKey) {
            this.firebaseSet(`/users/${this.userid}/game`, gameKey);
        }
    }

    _render({ userid, games }) {
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="content-box vertical">
            <div>
                <div class="player-list content-box vertical">
                    ${games.map(game => this.game(game, userid))}
                </div>
            </div>
            <div class="content-box horizontal">
                <label for="game-name">New game:</label>
                <input type="text" id="game-name" name="game-name" style="width:70%">
                <button class="button" on-click="${e => this.creaGame(e)}">create</button>
            </div>
        </div>
        `
    }
}

class EfsGame extends BaseEfsElement {
    static get is() { return 'efs-game' }
    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            userid: String,
            gameid: String
        }
    }

    get selfStyle() {
        return `
            .efs-game{
                border:0.5em solid blue;
            }
        `
    }

    get errorScreen() {
        return html`
            <span class="error">An error occured joining the game. The game was probably joined by someone just before you</span>
            <button class="button" on-click="${(() => this.firebaseSet(`/users/${this.userid}/game`, false))}">Return to lobby</button>
        `
    }

    get waitScreen() {
        return html`
            <span class="error">Your game is being created, please wait you will automatically join it when it's done</span>
        `
    }



    chooseState(gameid, userid) {
        if (!gameid || gameid === "error") {
            return this.errorScreen;
        }
        if (gameid.includes('new')) {
            return this.waitScreen;
        }
        return html`<efs-game-screen userid="${userid}" gameid="${gameid}"></efs-game-screen>`;
    }

    _render({ userid, gameid }) {
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="efs-game">
            ${this.chooseState(gameid, userid)}
        </div>
        `
    }
}

class EfsGameScreen extends BaseEfsElement {
    static get is() { return 'efs-game-screen' }
    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            userid: String,
            gameid: String
        }
    }

    get selfStyle() {
        return `
            .efs-game{
                border:0.5em solid blue;
            }
        `
    }

    get loadingScreen() {
        return html`
            <span class="loading">loading...</span>
        `
    }

    get errorScreen() {
        return html`
            <span class="loading">the game is in an unexpected status and will probably never start, if you see this call the creator of this game.</span>
        `
    }

    get waitPlayerScreen() {
        return html`
            <span class="loading">waiting for the game to be full...</span>
        `
    }

    get finishedScreen() {
        return html`
            <span class="loading">the game is finished, congrats to the survivors !</span>
        `
    }

    chooseState(status) {
        if (status === "waiting") {
            return this.waitPlayerScreen;
        }
        if (status === "launched") {
            return html`<efs-playground userid="${this.userid}" gameid="${this.gameid}"></efs-playground>`;
        }
        if (status === "finished") {
            return this.finishedScreen;
        }
        return this.errorScreen;
    }

    _render({ userid, gameid }) {
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="efs-game-screen">
            <div class="content-box vertical">
                <div>
                    <div class="content-box vertical">
                        ${onFirebasedata(this.firebaseRef(`/games/${gameid}/players`), players => (players ? players : []).map(player => html`<div>${onFirebasedata(this.firebaseRef(`/users/${player.uid}/name`), name => name, html`loading...`)}</div>`), html`<div>loading...<div>`)}
                    </div>
                    <div>
                        ${onFirebasedata(this.firebaseRef(`/games/${gameid}/status`), this.chooseState.bind(this), html`loading...`)}
                    </div>
                </div>
                <game-chat type="/games/${gameid}/chat" userid="${userid}"></game-chat>
            </div>
        </div>
        `
    }
}

class EfsPlayground extends BaseEfsElement {
    static get is() { return 'efs-playground' }
    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            userid: String,
            gameid: String
        }
    }

    get selfStyle() {
        return `
            .map{
                border:0.5em solid violet;
            }
            .case{
                height:3em;
                width:3em;
            }
        `
    }

    showConfirm(actionName) {
        let popup = this.shadowRoot.getElementById('confirm-popup-'+actionName);
        if (popup) {
            popup.hidden = false;
        }
    }

    hideConfirm() {
        let popup = this.shadowRoot.getElementById('confirm-popup-'+actionName);
        if (popup) {
            popup.hidden = true;
        }
    }

    _render({ userid, gameid }) {
        console.log("render map : ", userid, gameid)
        if (!userid || !gameid) {
            return html`loading...`
        }
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="map">
            ${onFirebasedata(this.firebaseRef(`/games/${gameid}/players`, {
                orderByChild: "uid",
                equalTo: userid
            }), players => {
                console.log("players return : ", players)
                if (players && players.length === 1) {
                    let [player] = players;
                    if (player.uid !== userid) {
                        return html`Error getting the player, try to reload.`
                    }
                    //here we draw the map from the player pos and sigth
                    let [x, y] = player.pos.split('/');
                    let minX = Number(x) - Number(player.sight);
                    let maxX = Number(x) + Number(player.sight);
                    let minY = Number(y) - Number(player.sight);
                    let maxY = Number(y) + Number(player.sight);
                    let cells = [];
                    for (let i = minY; i <= maxY; i++) {
                        for (let j = minX; j <= maxX; j++) {
                            cells.push({
                                x: i,
                                y: j
                            })
                        }
                    }
                    return html`<div style="display:grid;grid-template-columns:repeat(${(Number(player.sight) * 2) + 1}, 1fr)">
                        ${cells.map(cell => html`<game-cell class="case" userid="${userid}" gameid="${gameid}" pos="${cell.x}/${cell.y}"></game-cell>`)}
                    </div>`
                }
                return html`<div>loading...</div>`
            }, html`<div>loading...<div>`)}
        </div>
        <div class="action">
            ${onFirebasedata(this.firebaseRef(`/games/${gameid}/actions/${userid}`), actions => (actions ? actions : []).map(action => html`<div class="action" on-click="${e => this.showConfirm(action.name)}">
                                                                                                                                                ${action.name}
                                                                                                                                                <action-confirm-popup action="${action}" id="confirm-popup-${action.name}" on-closepopup="${e => this.hideConfirm(action.name)}"></action-confirm-popup>
                                                                                                                                            </div>`), html`<div>loading...<div>`)}
        </div>
        `
    }
}

class GameCell extends BaseEfsElement {
    static get is() { return 'game-cell' }
    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            pos: String,
            userid: String,
            gameid: String
        }
    }

    get selfStyle() {
        return `
            .construct{
                z-index:10
            }
            .construct img{
                width:100%;
                height:100%;
            }
            .objects{
                z-index:11;
            }
            .chars{
                z-index:12;
                border-radius:50%;
                opacity:0.5;
                background-color:black;
                color:white;
                height: 50%;
                width: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0.2em;
                position:relative;
            }
            .chars #chars-popup{
                top: 50%;
                left: 50%;
                z-index:20;
                background-color:black;
                border:black solid 2px;
                color:white;
                position:absolute;
                align-items: center;
                justify-content: center;
                margin: 0.2em;
            }
            .monsters{
                z-index:13;
            }
        `
    }

    drawPlayer(player) {
        return html`<div>
    ${onFirebasedata(this.firebaseRef(`/users/${player.uid}/name`), name => name, html`loading...`)}
</div>`
    }

    showPlayers() {
        let popup = this.shadowRoot.getElementById('chars-popup');
        if (popup) {
            popup.hidden = false;
        }
    }

    hidePlayers() {
        let popup = this.shadowRoot.getElementById('chars-popup');
        if (popup) {
            popup.hidden = true;
        }
    }

    _render({ userid, pos, gameid }) {
        if (!userid || !pos || !gameid) {
            return html`loading...`
        }
        return html`
        <style>
            ${this.selfStyle}
        </style>
        <div class="construct">
            ${onFirebasedata(this.firebaseRef(`/games/${gameid}/cells`, {
                orderByChild: "pos",
                equalTo: pos
            }), cell => {
                try{
                    [cell] = [Object.values(cell)];
                    return html`<img alt="${pos}" src="src/img/game/tiles/${cell.img}">`
                } catch (e) {
                    return html`<img alt="${pos}" src="src/img/game/tiles/empty.png">`
                }
            }, html`<div>loading...<div>`)}
        </div>
            ${onFirebasedata(this.firebaseRef(`/games/${gameid}/players`, {
                orderByChild: "pos",
                equalTo: pos
            }), players => {
                try {
                    if (!Array.isArray(players)) {
                        players = Object.values(players);
                    }
                    for (var i = 0; i < players.length; i++) {
                        if (players[i] === undefined) {
                            players.splice(i, 1);
                            i--;
                        }
                    }
                    return html`<div class="chars" on-mouseenter="${e => this.showPlayers(e.detail)}" on-mouseleave="${e => this.hidePlayers(e.detail)}">
                                    ${players.length}
                                    <div id="chars-popup" hidden>
                                        ${players.map(player => this.drawPlayer(player))}
                                    </div>
                                </div>`
                } catch (e) {
                    return html``
                }
            }, html`<div class="chars">...</div>`)}
        `
    }
}

class GameCell extends BaseEfsElement {
    static get is() { return 'action-confirm-popup' }
    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            action: Object,
            selectedOption:Number
        }
    }

    get selfStyle() {
        return `
        .backdrop{
            z-index:100;
            position:absolute;
            background-color:black;
            justify-content:center;
            width:100%;
            height:100vh;
            position:fixed;
            top:0;
            left:0;
            opacity:0.5;
        }
        .backdrop > div{
            z-index:101;
            padding:1em;
            background-color:white;
            border: 0.1em solid red;
        }

        .backdrop > div{
            margin:0.5em;
        }
        `
    }

    cancel() {
        this.dispatchEvent(new CustomEvent('closepopup', { detail: { cancel: true } }))
    }

    validate() {
        if(this.selected !==undefined || !this.action.options){
            this.dispatchEvent(new CustomEvent('execute-action',{ detail: { option: this.selected } }))
            this.dispatchEvent(new CustomEvent('closepopup',{ detail: { confirm: true } }))
        }
        
    }
    select(id){
        this.selected = id;
    }

    drawOptions(action){
        if(action.options){
            return html`<div>${action.options.map((option, index)=>html`<div on-click="${e => this.select(index)}">${option.name}</div>`)}</div>`
        }
        return html``
    }

    _render({ action, selected }) {
        if (!action) {
            return html`loading...`
        }
        return html`
        <style>
            ${this.selfStyle}
        </style>
        <div class="backdrop content-box">
            <div >
                <div >${action.name}</div>
                ${this.drawOptions(action)}
                <div>
                    <button on-click="${e => this.cancel(e)}">cancel</button>
                    <button on-click="${e => this.validate(e)}" disabled$="${(selected ===undefined && action.options)}">validate</button>
                </div>
            </div>
        </div>
        `
    }
}

export default [
    LogHeader,
    ConfAccountPopup,
    EfsShell,
    EfsLobby,
    GameChat,
    PartieSelect,
    EfsGame,
    EfsGameScreen,
    EfsPlayground,
    GameCell
]