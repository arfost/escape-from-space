import { FireReference } from '../../futur-lib/data.js'

export class News extends FireReference {

  constructor(id) {
      super();
      this.initConnection();
    }

    get sources(){
        return {
            news: "news/"
        };
    }

    get defaultValues(){
        return {news:[]}
    }

    formatDatas({news}) {
        console.log("have news : ", news)
        let data = Object.values(news);
        return data;
    }

}