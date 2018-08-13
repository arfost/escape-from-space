import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';

class BaseEfsElement extends LitElement {
    constructor() {
        super()
    }

    static get is() {
        throw new Error("getter is must be overidden with the name of the element")
    }

    firebaseData(path, cb){
        return firebase.app().database().ref(path).on('value', (snapshot) => {
            cb(snapshot.val())
        });
    }

    firebaseSet(path, value){
        return firebase.app().database().ref(path).set(value);
    }

    firebaseUpdate(path, value){
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
            this.firebaseData(`/users/${result.user.uid}`, (data)=>{
                this.user = data;
            })
            this.email = result.user.email;
            this.uid = result.user.uid;
        }).catch((error) => {
            //
        });
        firebase.auth().onAuthStateChanged((user)=>{
            if (user) {
              // User is signed in.
              this.email = user.email;
              this.uid = user.uid;
              this.firebaseData(`/users/${user.uid}`, (data)=>{
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
            showPopup:Boolean
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
        console.log('error')
        return html`
            <div>hey error</div>
        `
    }

    content(user){
        if(user){
            return html`welcom to game`
        }else{
            return html`first login and configure your account before playing`
        }
    }

    confUser(detail){
        console.log("conf conf", detail)
        this.firebaseSet(`/users/${this.uid}`, detail).then(()=>{
            this.showPopup = false;
        })
    }
    _render({user, token, logError, email, showPopup}) {
        console.log("render", user, token, logError, email, showPopup)
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="header content-box">
            <div>
            <div on-click="${(e) => {
                console.log(this.showPopup)
                this.showPopup = true
                }}">conf</div>
                ${
                    (showPopup ? 
                        html`<conf-account-popup title="Configure account"  on-validate="${e => this.confUser(e.detail)}"></conf-account-popup>`:
                        html``
                    )
                }
                
                ${(user ? html`
                    <img class="avatar" src$="${user.avatar}"></img>
                    <div>${user.name}</div>
                `:
                (email ? 'configure your account before playing':'login with google to play'))}
            </div>
            <div class="accountInfos"><span>${email}</span><button class='button' on-click="${e => this.toggleLogin(e)}">${email ? 'log out':'log in'}</button></div>
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
                padding:1em;
                background-color:white;
                border: 0.1em solid red;
            }

            .backdrop > div{
                margin:0.5em;
            }
        `
    }

    cancel(){
        this.dispatchEvent(new CustomEvent('validate', {detail: {cancel: true}}))
    }

    validate(){

        this.dispatchEvent(new CustomEvent('validate', {detail: 
            {
                name: this.shadowRoot.getElementById('name').value
            }
        }))
    }

    _render({title}) {
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
            title: String
        }
    }

    get selfStyle() {
        return `
            
        `
    }

    cancel(){
        this.dispatchEvent(new CustomEvent('validate', {detail: {cancel: true}}))
    }

    validate(){

        this.dispatchEvent(new CustomEvent('validate', {detail: 
            {
                name: this.shadowRoot.getElementById('name').value
            }
        }))
    }

    _render({title}) {
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

class EfsLobby extends BaseEfsElement {
    static get is() { return 'efs-lobby' }
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
            
        `
    }

    _render({title}) {
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

export default [
    LogHeader,
    ConfAccountPopup,
    EfsShell,
    EfsLobby
]