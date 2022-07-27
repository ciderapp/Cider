import {html} from "../html.js"

export const sidebarLibraryItem = Vue.component("sidebar-library-item", {
    template: html`
        <button class="app-sidebar-item"
                :class="$root.getSidebarItemClass(page)" @click="$root.setWindowHash(page)">
            <svg-icon :url="svgIconData" :name="'sidebar-' + svgIconName" v-if="svgIconData != ''"/>
            <span class="sidebar-item-text">{{ name }}</span>
        </button>
    `,
    props: {
        name: {
            type: String,
            required: true,
        },
        page: {
            type: String,
            required: true,
        },
        svgIcon: {
            type: String,
            required: false,
            default: "",
        },
        svgIconName: {
            type: String,
            required: false
        },
        cdClick: {
            type: Function,
            required: false,
        },
    },
    data: function () {
        return {
            app: app,
            svgIconData: "",
        };
    },
    async mounted() {
        if (this.svgIcon) {
            this.svgIconData = this.svgIcon;
        }
    },
    methods: {},
})