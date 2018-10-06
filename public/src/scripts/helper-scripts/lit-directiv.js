import { directive } from 'https://unpkg.com/lit-html@latest/lit-html.js?module';

export const onFirebaseData = (ref, content, defaultContent, emptyContent) => directive(part => {
    part.setValue(defaultContent);
    ref.on("value", snap => {
        let data = snap.val();
        if (data !== undefined && data !== null) {
            part.setValue(content(data))
        }else if(emptyContent){
          part.setValue(emptyContent);
        }
        part.commit();
    })
    
});
export const onFirebaseArray = (ref, content, defaultContent, emptyContent) => directive(part => {
    part.setValue(defaultContent);
    ref.on("value", snap => {
        let data = snap.val();
        if(data){
            if(!Array.isArray(data)){
                data = Object.values(data);
            }
            part.setValue(content(data.filter(elem=>elem)));
        }else if(emptyContent){
            part.setValue(emptyContent);
          }
          part.commit();
    })
});