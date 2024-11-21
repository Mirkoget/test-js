self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "rootMainFilesTree": {},
  "pages": {
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/components/createProduct": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/components/createProduct.js"
    ],
    "/components/shop": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/components/shop.js"
    ],
    "/components/shoppingCart": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/components/shoppingCart.js"
    ],
    "/components/yourProducts": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/components/yourProducts.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];