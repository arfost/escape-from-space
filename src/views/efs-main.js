import { html, css } from 'lit-element';
import { EfsBase } from '../efs-base.js'
import Datavault from '../datavault.js'

import '../components/fab-img.js'
import '../views/efs-nogame.js'
import '../views/efs-game.js'

class EfsMain extends EfsBase {

    constructor() {
        super();
        this.loginRef = Datavault.refGetter.getUser();
        this.user = this.loginRef.getDefaultValue();
        this.loginRef.on("value", user => {
            this.user = user;
        })
    }

    showToast(e){
        this.toastMsg = e.detail;
        // Get the snackbar DIV
        let x = this.shadowRoot.getElementById("snackbar");

        // Add the "show" class to DIV
        x.className = "show";

        // After 3 seconds, remove the show class from DIV
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 6000);
    }

    get selfStyles() {
        return css`
        #snackbar {
            visibility: hidden; /* Hidden by default. Visible on click */
            min-width: 250px; /* Set a default minimum width */
            margin-left: -125px; /* Divide value of min-width by 2 */
            background-color: #333; /* Black background color */
            color: #fff; /* White text color */
            text-align: center; /* Centered text */
            border-radius: 2px; /* Rounded borders */
            padding: 16px; /* Padding */
            position: fixed; /* Sit on top of the screen */
            z-index: 1000; /* Add a z-index if needed */
            left: 50%; /* Center the snackbar */
            bottom: 30px; /* 30px from the bottom */
          }
          
          /* Show the snackbar when clicking on a button (class added with JavaScript) */
          #snackbar.show {
            visibility: visible; /* Show the snackbar */
            /* Add animation: Take 0.5 seconds to fade in and out the snackbar. 
            However, delay the fade out process for 5.5 seconds */
            -webkit-animation: fadein 0.5s, fadeout 0.5s 5.5s;
            animation: fadein 0.5s, fadeout 0.5s 5.5s;
          }
          
          /* Animations to fade the snackbar in and out */
          @-webkit-keyframes fadein {
            from {bottom: 0; opacity: 0;} 
            to {bottom: 30px; opacity: 1;}
          }
          
          @keyframes fadein {
            from {bottom: 0; opacity: 0;}
            to {bottom: 30px; opacity: 1;}
          }
          
          @-webkit-keyframes fadeout {
            from {bottom: 30px; opacity: 1;} 
            to {bottom: 0; opacity: 0;}
          }
          
          @keyframes fadeout {
            from {bottom: 30px; opacity: 1;}
            to {bottom: 0; opacity: 0;}
          }`
    }

    toggleLogin() {
        this.loginRef.actions.toggleLogin().then(ret=>{
            this.showToast({
                detail:'Logged in'
            });
        }).catch(err=>{
            this.showToast({
                detail:err.message
            });
        });
    }

    static get properties() {
        return {
            user: Object,
            toastMsg: String
        }
    }

    render() {
        return html`
            ${this.styles}
            ${this.user.game ? 
                html`<efs-game .user="${this.user}" @toast-msg="${this.showToast}"></efs-game>`:
                html`<efs-nogame .user="${this.user}" @toast-msg="${this.showToast}"></efs-nogame>`}
            <fab-img @click="${this.toggleLogin}" .src="${this.user.photoURL}"></fab-img>
            <div id="snackbar">${this.toastMsg}</div>`;
    }
}

customElements.define('efs-main', EfsMain); //