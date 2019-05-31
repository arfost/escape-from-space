import { html, css, LitElement } from 'lit-element';

export class EfsBase extends LitElement {

    emit(type, params){
        let event = new CustomEvent(type, {
            detail: params
          });
          this.dispatchEvent(event);
    }

    get styles() {
        return html`<style>
            ${this.sharedStyles}
            ${this.selfStyles}
        </style>`
    }

    get sharedStyles() {
        return css`
            .card {
                background-color: var(--shade-color);
                color:var(--success-color);
                border-radius: 2px;
                display: inline-block;
                margin: 1rem;
                position: relative;
                width: 300px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
                transition: all 0.3s cubic-bezier(.25,.8,.25,1);
                padding:1em;
            }
            .card:hover {
                box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
            }
            .flex-box{
                justify-content: space-between;
                display: flex;
                padding:1em;
            }
            .f-horizontal{
                flex-direction:row;
            }
            .f-wrap{
                flex-wrap:wrap;
            }
            .f-vertical{
                flex-direction:column;
            }
            .f-j-center {
                justify-content:center;
            }
            .f-j-space {
                justify-content:space-between;
            }
            .f-j-start {
                justify-content:start;
            }
            .f-j-end {
                justify-content:end;
            }
            .f-a-center {
                align-items:center;
            }
            .f-a-end {
                align-items:flex-end;
            }
            .f-js-end {
                justify-self:end;
            }
            [hidden] {
                display: none !important;
            }
            .w-100{
                width:100vw
            }
            .h-100{
                height:100vh
            }
            .scroll {
                overflow: auto;
            }
            ::-webkit-scrollbar {
                width: 10px;
            }
            
            /* Track */
            ::-webkit-scrollbar-track {
            background: #f1f1f1; 
            }
            
            /* Handle */
            ::-webkit-scrollbar-thumb {
            background: #888; 
            }
            
            /* Handle on hover */
            ::-webkit-scrollbar-thumb:hover {
            background: #555; 
            }
            .w-80{
                width:80vw
            }
            .h-80{
                height:80vh
            }
            .w-20{
                width:20vw
            }
            .h-20{
                height:20vh
            }
            .p-0{
                padding: 0 !important;
            }
            .btn {
                display: inline-block;
                font-weight: 400;
                text-align: center;
                white-space: nowrap;
                vertical-align: middle;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                border: 1px solid transparent;
                padding: .375rem .75rem;
                font-size: 1rem;
                line-height: 1.5;
                border-radius: .25rem;
                transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
            }
            .btn-outline-secondary {
                color: #6c757d;
                background-color: white;
                background-image: none;
                border-color: #6c757d;
            }
            .btn-outline-secondary:hover {
                color: #fff;
                background-color: #6c757d;
                border-color: #6c757d;
            }
            .efs-textfield > input {
                height: 32px;
            }
            .efs-textfield > input, .efs-textfield > textarea {
                -webkit-box-sizing: border-box;
                box-sizing: border-box;
                display: block;
                background-color: transparent;
                color: rgba(0, 0, 0, 0.87);
                border: none;
                border-bottom: 1px solid rgba(0, 0, 0, 0.26);
                outline: none;
                width: 100%;
                padding: 0;
                -webkit-box-shadow: none;
                box-shadow: none;
                border-radius: 0px;
                font-size: 16px;
                font-family: inherit;
                line-height: inherit;
                background-image: none;
            }
            .efs-textfield > input {
                animation-duration: 0.0001s;
                animation-name: mui-textfield-inserted;
            }
            .mui-textfield {
                display: block;
                padding-top: 15px;
                margin-bottom: 20px;
                position: relative;
            }
            .ml-1 {
                margin-left:1em;
            }
            .m-1 {
                margin:1em;
            }
            .mr-1 {
                margin-right:1em;
            }
            .mb-1 {
                margin-bottom:1em;
            }
            :focus{
                outline:none;
            }`
    }

}