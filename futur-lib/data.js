import { auth, database } from '../config/fireInit.development'
import { ref, push, onValue, update, off } from 'firebase/database';
import { GoogleAuthProvider, signInWithRedirect, signOut } from "firebase/auth";
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
        this.listeners = [];
    }

    get params() {
        return {}
    }

    initConnection(noDefault) {
        this.data = {};
        if (this.connection) {
            for (let connection in this.connection) {
                off(this.connection[connection]);
            }
        }
        let connection = {};
        for (let source in this.sources) {
            if(!noDefault){
                this.data[source] = this.defaultValues[source];
            }
            connection[source] = this.initSource(this.sources[source], this.params[source]);
            onValue(connection[source], snap => {
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
        this.listeners.push(listener);
        if (this.formattedData) {
            listener(this.formattedData);
        }
    }

    initSource(path, params = []) {
        let nodeRef;
        if (!path.includes("--new--")) {
            nodeRef = ref(database,path)
        } else {
            path = path.replace("--new--", "");
            nodeRef = push(ref(database,path))
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

        return update(ref(database), updates)

    }

    newDatas() {
        if (!this.ready) {
            return;
        }
        let deepCopiedData = JSON.parse(JSON.stringify(this.data))
        this.formattedData = this.formatDatas(deepCopiedData);
        for(let listener of this.listeners){
            listener(this.formattedData);
        }
    }

    getDefaultValue() {
        let deepCopiedData = JSON.parse(JSON.stringify(this.defaultValues))
        return this.formatDatas(deepCopiedData);
    }

    pushToData(source, datas) {
        if (typeof this.data[source] === "object") {
            let key = push(ref(database,this.sources[source])).key;
            this.data[source][key] = datas;
        } else {
            throw new Error("Raw firebase datas must be an object of firebase node with firebase key as properties");
        }
    }
}

export class LoginReference extends FireReference {

    constructor() {
        super();
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in.
                this.uid = user.uid;

                this.initConnection(true);
                this.actions.setUser({
                    email: user.email,
                    displayName: user.displayName,
                    isAnonymous: user.isAnonymous,
                    photoURL: user.photoURL
                });

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
                if (!auth.currentUser) {
                    // [START createprovider]
                    var provider = new GoogleAuthProvider();
                    // [END createprovider]
                    // [START addscopes]
                    provider.addScope('https://www.googleapis.com/auth/plus.login');
                    // [END addscopes]
                    // [START signin]
                    return signInWithRedirect(auth, provider);
                    // [END signin]
                } else {
                    // [START signout]
                    return signOut(auth);
                    // [END signout]
                }
            },
            setUser: user => {
                this.data.user = user;
                this.save();
            },
            updateInfos: infos => {
                if(infos.name){
                    this.data.user.customName = infos.name;
                }
                return this.save();
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
        if(!user){
            return 
        }
        user.displayName = user.customName ? user.customName : user.displayName;
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