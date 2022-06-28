export const svgIcon = Vue.component("svg-icon", {
    template: `
        <div class="_svg-icon" :svg-name="name" :style="{'--icon': 'url(' + url + ')'}"></div>
    `,
    props: {
        name: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: true,
            default: "./assets/repeat.svg"
        }
    }
})