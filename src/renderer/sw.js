if (!self.define) {
  let e,
    i = {};
  const s = (s, r) => (
    (s = new URL(s + ".js", r).href),
    i[s] ||
      new Promise((i) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = s), (e.onload = i), document.head.appendChild(e);
        } else (e = s), importScripts(s), i();
      }).then(() => {
        let e = i[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (r, c) => {
    const n = e || ("document" in self ? document.currentScript.src : "") || location.href;
    if (i[n]) return;
    let o = {};
    const t = (e) => s(e, n),
      a = { module: { uri: n }, exports: o, require: t };
    i[n] = Promise.all(r.map((e) => a[e] || t(e))).then((e) => (c(...e), o));
  };
}
define(["./workbox-962786f2"], function (e) {
  "use strict";
  self.addEventListener("message", (e) => {
    e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
  }),
    e.precacheAndRoute(
      [
        {
          url: "ameframework.css",
          revision: "4bcc8646bb5742638fad52b94e231601",
        },
        { url: "apple-hls.js", revision: "2b74055662676b0fcc2d4a4bf994a9dc" },
        { url: "hlscider.js", revision: "cf7f512e83e32694f2c94f904714fe4c" },
        { url: "index_old.html", revision: "c21f3e9c5b015599d3ab07639f64a7a8" },
        { url: "index.js", revision: "8591a69fc9c975a063eb264b7447f173" },
        { url: "less.js", revision: "b6e574e4d680686786a28e7e71a17bbc" },
        { url: "musickit.js", revision: "211d80891c3336c1795cb83df58d4b63" },
        {
          url: "sortable.min.js",
          revision: "5cbc31ebec32adf60e27b76418e79d93",
        },
        { url: "style-old.css", revision: "aea9ea49df13f2deee42b68654aeea06" },
        { url: "todo.js", revision: "18d49fabcb96de8bd11455877d8eacb6" },
        {
          url: "vue-observe-visibility.min.js",
          revision: "5a52e761f6aa71b4f65a7b458f698b95",
        },
        { url: "vue.js", revision: "0a9a4681294d8c5f476687eea6e74842" },
        {
          url: "vuedraggable.umd.min.js",
          revision: "9a84fec5263bb510cee88e1c3b9583cc",
        },
      ],
      {
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^X-Amz-Algorithm/, /^X-Amz-Date/, /^X-Amz-SignedHeaders/, /^X-Amz-Expires/, /^X-Amz-Credential/, /^X-Amz-Signature/],
      },
    ),
    e.registerRoute(/\.(?:png|jpg|jpeg|svg|webp)$/, new e.CacheFirst({ cacheName: "imageinternet", plugins: [] }), "GET"),
    e.registerRoute(/https:\/\/is[0-9]-ssl\.mzstatic\.com\/image+/, new e.CacheFirst(), "GET"),
    e.registerRoute(/^https:\/\/store-\d{3}\.blobstore\.apple\.com\/.{65}\/image+/, new e.CacheFirst(), "GET");
});
//# sourceMappingURL=sw.js.map
