import { LitElement, html } from 'lit-element'

export class FontAwesomeness extends LitElement {
    get properties(){
        return {
            iconAwe:String
        }
    }

    render() {
        return html `
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" 
                integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" 
                crossorigin="anonymous"/>
            <i class="${this.iconAwe}"></i>
        `
    }
}
customElements.define('font-awesomeness', FontAwesomeness); //