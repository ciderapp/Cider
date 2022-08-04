module.exports = {
  globDirectory: "src/renderer/",
  swDest: "src/renderer/sw.js",
  // Define runtime caching rules.
  runtimeCaching: [
    {
      // Match any request that ends with .png, .jpg, .jpeg or .svg.
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,

      // Apply a cache-first strategy.
      handler: "CacheFirst",

      options: {
        // Use a custom cache name.
        cacheName: "imageinternet",
        // Only cache 10 images.
      },
    },
    {
      urlPattern: /https:\/\/is[0-9]-ssl\.mzstatic\.com\/image+/,
      handler: "CacheFirst",
    },
    {
      urlPattern: /^https:\/\/store-\d{3}\.blobstore\.apple\.com\/.{65}\/image+/,
      handler: "CacheFirst",
    },
  ],
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^X-Amz-Algorithm/, /^X-Amz-Date/, /^X-Amz-SignedHeaders/, /^X-Amz-Expires/, /^X-Amz-Credential/, /^X-Amz-Signature/],
};
