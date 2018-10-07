import { BaseEfsElement } from '../abstract-elements/efs-base-element.js'
import { html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';

export class LogHeader extends BaseEfsElement {
    static get is() { return 'log-header' }
    //we need to init values in constructor
    constructor() {
        super();
        this.showPopup = false;
        firebase.auth().getRedirectResult().then((result) => {
            if (!result || !result.credential) {
                return
            }
            this.token = result.credential.accessToken;
            this.firebaseData(`/users/${result.user.uid}`, (data) => {
                this.user = data;
            })
            this.email = result.user.email;
            this.uid = result.user.uid;
        }).catch((error) => {
            console.log("auth error ", error)
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
            return html`<efs-shell .user="${user}"></efs-shell>`
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

    render() {
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="header content-box">
            <div>
            <div @click="${() => {
                this.showPopup = true
            }}">conf</div>
                ${
            (this.showPopup ?
                html`<conf-account-popup title="Configure account"  @validate="${e => this.confUser(e.detail)}"></conf-account-popup>` :
                html``
            )
            }
                
                ${(this.user ? html`
                    <img class="avatar" src="${this.user.avatar}">
                    <div>${this.user.name}</div>
                `:
                (this.email ? 'configure your account before playing' : 'login with google to play'))}
            </div>
            <div class="accountInfos"><span>${this.email}</span><button class='button' @click="${e => this.toggleLogin(e)}">${this.email ? 'log out' : 'log in'}</button></div>
        </div>
        <div style="margin-top:8em">
            ${this.content(this.user)}
        </div>
        <div class="footer content-box">
            realised by arfost
        </div>
        `
    }
}