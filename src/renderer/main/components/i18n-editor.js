import { html } from "../html.js";

export const i18nEditor = Vue.component("i18n-editor", {
  // language=HTML
  template: html`
    <div class="content-inner i18n-page">
      <div class="row nopadding">
        <div class="col nopadding">
          <h1>i18n Editor</h1>
        </div>
        <div class="col-auto nopadding selectCol">
          <select class="md-select" @change="$root.setLz('');$root.setLzManual()" v-model="$root.cfg.general.language">
            <optgroup :label="index" v-for="(categories, index) in getLanguages()">
              <option v-for="lang in categories" :value="lang.code">{{lang.nameNative}} ({{lang.nameEnglish }})</option>
            </optgroup>
          </select>
          <button class="md-btn" @click="exportLz">Export</button>
        </div>
      </div>
      <hr />
      <div class="md-option-container">
        <template v-for="(val, key) in baseLz">
          <div class="md-option-line" v-if="$root.lz[key]">
            <div class="md-option-segment">{{ key }}</div>
            <div class="md-option-segment">
              <template v-if='typeof $root.lz[key] == "object"'>
                <div v-for="(variant, vkey) in $root.lz[key]">
                  {{variant}}
                  <input type="text" v-model="$root.lz[key][vkey]" />
                </div>
              </template>
              <textarea type="text" v-model="$root.lz[key]" v-else></textarea>
            </div>
          </div>
          <div class="md-option-line" v-else>
            <div class="md-option-segment">
              <b>{{ key }}</b>
            </div>
            <div class="md-option-segment">
              <textarea type="text" v-model="$root.lz[key]" :placeholder="val"></textarea>
            </div>
          </div>
        </template>
      </div>
    </div>
  `,
  data() {
    return {
      listing: ipcRenderer.sendSync("get-i18n-listing"),
      baseLz: ipcRenderer.sendSync("get-i18n", "en_US"),
    };
  },
  methods: {
    exportLz() {
      bootbox.alert(`<textarea spellcheck='false' style="width:100%;height: 300px;">${JSON.stringify(app.lz, true, " ")}</textarea>`);
      notyf.success("Copied to clipboard");
      navigator.clipboard.writeText(JSON.stringify(app.lz, true, " ")).then((r) => console.debug("Copied to clipboard."));
    },
    getLanguages: function () {
      let langs = this.$root.lzListing;
      let categories = {
        main: [],
        fun: [],
        unsorted: [],
      };
      // sort by category if category is undefined or empty put it in "unsorted"
      for (let i = 0; i < langs.length; i++) {
        if (langs[i].category === undefined || langs[i].category === "") {
          categories.unsorted.push(langs[i]);
        } else {
          categories[langs[i].category].push(langs[i]);
        }
      }
      // return
      return categories;
    },
  },
});
