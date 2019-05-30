import * as firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import 'firebase/functions';

export class Dao {
    constructor(refs) {
        if (!refs) {
            console.log("refs is empty, and your datavault will be useless");
            return
        }

        this.refGetter = {};
        this._refs = refs;
        this.refCach = {};

        //create_getters
        for (let ref of this._refs) {
            this.refGetter['get' + ref.name] = (...args) => {
                let argsKey = JSON.stringify(args)+ref.name;

                if (!this.refCach[argsKey]) {
                    let instanciedRef = new ref.classDef(...args);
                    for (let mw of ref.middlewares || []) {
                        instanciedRef.addMiddleware(mw);
                    }
                    this.refCach[argsKey] = instanciedRef;
                }
                return this.refCach[argsKey];
            }
        }
    }
}
export class FireReference {

    constructor() {
        this.initConnection();
    }

    get params() {
        return {}
    }

    initConnection() {
        this.data = {};
        if (this.connection) {
            for (let connection in this.connection) {
                this.connection[connection].off();
            }
        }
        let connection = {};
        for (let source in this.sources) {

            this.data[source] = this.defaultValues[source];
            connection[source] = this.initSource(this.sources[source], this.params[source]);
            connection[source].on('value', snap => {
                let tmp = snap.val();
                this.data[source] = tmp ? tmp : this.defaultValues[source];
                this.newDatas();
            })
        }
        this.connection = connection;
        this.ready = true;
        this.newDatas();
    }

    on(event, listener) {
        this.listener = listener;
        if (this.formattedData) {
            this.listener(this.formattedData);
        }
    }

    initSource(path, params = []) {
        let nodeRef;
        if (!path.includes("--new--")) {
            nodeRef = firebase
                .app()
                .database()
                .ref(path);
        } else {
            path = path.replace("--new--", "");
            nodeRef = firebase
                .app()
                .database()
                .ref(path)
                .push();
            this.id = nodeRef.key;
        }

        for (let param in params) {
            nodeRef = nodeRef[param](params[param]);
        }
        return nodeRef;
    }

    save() {
        let datas = this.presave(this.data);
        var updates = {};
        for (let source in this.sources) {
            if (datas[source]) {
                if (typeof datas[source] === "object") {
                    for (let node in datas[source]) {
                        updates[this.sources[source] + "/" + node] = datas[source][node];
                    }
                } else {
                    updates[this.sources[source]] = datas[source];
                }
            }
        }
        firebase.database().ref().update(updates);
    }

    newDatas() {
        if (!this.ready) {
            return;
        }
        let deepCopiedData = JSON.parse(JSON.stringify(this.data))
        this.formattedData = this.formatDatas(deepCopiedData);
        if (this.listener) {
            this.listener(this.formattedData);
        }
    }

    getDefaultValue() {
        let deepCopiedData = JSON.parse(JSON.stringify(this.defaultValues))
        return this.formatDatas(deepCopiedData);
    }

    pushToData(source, datas) {
        if (typeof this.data[source] === "object") {
            let key = firebase.app().database().ref(this.sources[source]).push().key;
            this.data[source][key] = datas;
        } else {
            throw new Error("Raw firebase datas must be an object of firebase node with firebase key as properties");
        }
    }
}

export class LoginReference extends FireReference {

    constructor() {
        super();
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // User is signed in.
                this.uid = user.uid;

                this.initConnection();
                this.actions.setUser({
                    email: user.email,
                    displayName: user.displayName,
                    isAnonymous: user.isAnonymous,
                    photoURL: user.photoURL
                })

                // [START_EXCLUDE]
                // [END_EXCLUDE]
            } else {
                this.uid = "noConnection";
                this.initConnection();
                this.actions.emptyUser();
            }
        });
    }

    get actions() {
        return {
            toggleLogin: () => {
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
            },
            setUser: user => {
                this.data.user = user;
                this.save();
            },
            emptyUser: () => {
                if (this.data) {
                    this.data.user = this.defaultValues.user;
                    this.data.permission = [];
                }
            }
        }
    }

    get sources() {
        return {
            user: "users/" + this.uid,
            permissions: "permissions/" + this.uid
        }
    }

    formatDatas({user, permissions}) {
        user = user ? user : this.defaultValues.user;
        user.uid = this.uid;
        user.permissions = permissions ? permissions : [];
        return user;
    }

    presave({ user, permissions }) {
        return {
            user,
            permissions
        }
    }

    get defaultValues() {
        return {
            user: {
                email: "anonymous@anonymous.com",
                displayName: "anonymous",
                isAnonymous: true,
                photoURL: "https://dummyimage.com/200x200/000/fff.png&text=A"
            }
        };
    }
}
