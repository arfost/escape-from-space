import {
    directive
} from 'https://unpkg.com/lit-html@latest/lit-html.js?module';

export const onPushData = directive((ref, content, defaultContent, emptyContent) => part => {
    part.setValue(defaultContent);
    ref.on("value", data => {
        if (data !== undefined && data !== null) {
            part.setValue(content(data))
        } else if (emptyContent) {
            part.setValue(emptyContent);
        }
        part.commit();
    })
});

export const unsafeHTML = directive(value => part => {
    const tmp = document.createElement('template');
    tmp.innerHTML = value;
    part.setValue(document.importNode(tmp.content, true));
});