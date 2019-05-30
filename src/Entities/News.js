import { FireReference } from '../../futur-lib/data.js'
import * as firebase from 'firebase/app';

export class News extends FireReference {

    get sources(){
        return {
            news: "news/"
        };
    }

    get defaultValues(){
        return {news:[]}
    }

    formatDatas({news}) {

        let data = Object.values(news);
        return data;
    }

}