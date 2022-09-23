const CiderFrontAPI = {
  Objects: {
    MenuEntry: function () {
      this.id = "";
      this.name = "";
      this.onClick = () => {};
      this.top = false;
    },
  },
  AddMenuEntry(entry) {
    if (entry?.top) {
      app.pluginMenuTopEntries.push(entry);
    } else {
      app.pluginMenuEntries.push(entry);
    }
    app.pluginInstalled = true;
  },
  StyleSheets: {
    Add(href) {
      console.log("Adding stylesheet: " + href);
      let id = uuidv4();
      let link = document.createElement("link");
      link.rel = "stylesheet/less";
      link.type = "text/css";
      link.href = href;
      link.setAttribute("css-id", id);
      // insert the link before document.querySelector("#userTheme") in head
      document.querySelector("head").insertBefore(link, document.querySelector("#userTheme"));
      less.registerStylesheetsImmediately();
      less.refresh(true, true, true);
      return link;
    },
  },
};

export { CiderFrontAPI };
