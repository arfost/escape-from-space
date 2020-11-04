import { LitElement, html, css } from "lit-element";

class IconOvertip extends LitElement {
    static get properties() {
        return {
            color: String,
            iClass: {
                attribute: "class"
            },
            src: String,
            style: String,
            size: String,
            pathPrefix: { attribute: "path-prefix" },
            overtip: { attribute: "overtip" }
        };
    }
    static get styles() {
        return css`
        :host {
            display: inline-block;
            padding: 0;
            margin: 0;
        }
        :host svg {
            fill: var(--fa-icon-fill-color, currentcolor);
            width: var(--fa-icon-width, 19px);
            height: var(--fa-icon-height, 19px);
        }
        .has-overtip{
            position: relative;
            display: inline-block;
        }
        .overtip{
            visibility: hidden;
            
            background-color: grey;
            width: 160px;
            color: #fff;
            text-align: center;
            padding: 5px 0;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
            padding:1em;
            
            font-weight: 400;
            font-size: 0.75rem;
            line-height: 1.5;
            /* Position the tooltip text - see examples below! */
            position: absolute;
            z-index: 1;
            bottom: 105%;
            left: 50%;
            margin-left: -80px; 
        }
        .overtip::after {
            content: " ";
            position: absolute;
            top: 100%; /* At the bottom of the tooltip */
            left: 50%;
            margin-top: -10px;
            border-width: 10px;
            border-style: solid;
            border-color: transparent transparent transparent grey;
        }
        .has-overtip:hover .overtip {
            visibility: visible;
        }
    `;
    }

    getSources(className) {
        const PREFIX_TO_STYLE = {
            fas: "solid",
            far: "regular",
            fal: "light",
            fab: "brands",
            fa: "solid"
        };
        const getPrefix = iClass => {
            let data = iClass.split(" ");
            return [PREFIX_TO_STYLE[data[0]], normalizeIconName(data[1])];
        };
        const normalizeIconName = name => {
            let icon = name.replace("fa-", "");
            return icon;
        };
        let data = getPrefix(className);
        return `img/sprites/${data[0]}.svg#${data[1]}`;
    }
    constructor() {
        super();
        this.overtip = false;
        this.src = "";
        this.style = "";
        this.size = "";
        this.color = "";
    }
    _parseStyles() {
        return `
      ${this.size ? `width: ${this.size};` : ''}
      ${this.size ? `height: ${this.size};` : ''}
      ${this.color ? `fill: ${this.color};` : ''}
    `;
    }
    render() {
        return html`
    <style>
        ${this.styles}
    </style>
    <div class="has-overtip">
    <svg .style="${this._parseStyles()}">
            <use href="${this.getSources(this.iClass)}">
            </use>
        </svg>
        ${this.overtip ? html`<div class="overtip">${this.overtip}</div>` : ''}
    </div>
    `;
    }
}
customElements.define("icon-overtip", IconOvertip);