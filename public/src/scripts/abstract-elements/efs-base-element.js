import { LitElement } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';

export class BaseEfsElement extends LitElement {
    constructor() {
        super()
    }

    static get is() {
        throw new Error("getter is must be overidden with the name of the element")
    }

    get is(){
        return this.constructor.is
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