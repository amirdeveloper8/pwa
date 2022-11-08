importScripts("/src/js/idb.js");
importScripts("/src/js/utils.js");

var CACHE_STATIC_NAME = "static-v18";
var CACHE_DYNAMIC_NAME = "dynamic-v2";
var STATIC_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/idb.js",
  "/src/js/promise.js",
  "/src/js/fetch.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];

function isInArray(string, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === string) {
      return true;
    }
  }
  return false;
}

// function trimCache(cachName, maxItems) {
//   caches.open(cachName).then(function (cache) {
//     return cache.keys().then(function (keys) {
//       if (keys.length > maxItems) {
//         cache.delete(keys[0]).then(trimCache(cachName, maxItems));
//       }
//     });
//   });
// }

self.addEventListener("install", function (event) {
  console.log("[Service Worker] Installing Service Worker ...", event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function (cache) {
      console.log("[Service Worker] Precaching App Shell");
      cache.addAll(STATIC_FILES);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Activating Service Worker ....", event);
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[Service Worker] Removing old cache.", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//             })
//             .catch(function(err) {
//               return caches.open(CACHE_STATIC_NAME).then(cache => {
//                 return cache.match("/offline.html")
//               })
//             });
//         }
//       })
//   );
// });

// Cache-only
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Network-only
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });

// Network with Cache Fallback
// self.addEventListener("fetch", function (event) {
//   event.respondWith(
//     fetch(event.request)
//       .then((res) => {
//         return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
//           cache.put(event.request.url, res.clone());
//           return res;
//         });
//       })
//       .catch((err) => {
//         return caches.match(event.request);
//       })
//   );
// });

// cache, then Network
self.addEventListener("fetch", function (event) {
  var url = "https://pwagram-30442-default-rtdb.firebaseio.com/posts.json";
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith;
    // 1st step
    // caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
    //   return fetch(event.request).then((res) => {
    //     // trimCache(CACHE_DYNAMIC_NAME, 7);
    //     cache.put(event.request, res.clone());
    //     return res;
    //   });
    // })();
    // 2nd step
    // fetch(event.request).then((res) => {
    //   const clonedRes = res.clone();
    //   clonedRes.json().then((data) => {
    //     for (const key in data) {
    //       writeData("posts", data[key]);
    //     }
    //   });
    //   return res;
    // });

    // 4th step
    fetch(event.request).then((res) => {
      const clonedRes = res.clone();
      clearAllData("posts")
        .then(() => {
          return clonedRes.json();
        })
        .then((data) => {
          for (const key in data) {
            writeData("posts", data[key]);
            // 5th step
            // writeData("posts", data[key]).then(() => {
            //   deleteSingleItem("posts", key);
            // });
          }
        });
      return res;
    });
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
                // trimCache(CACHE_DYNAMIC_NAME, 7);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(function (err) {
              return caches.open(CACHE_STATIC_NAME).then((cache) => {
                if (event.request.headers.get("accept").includes("text/html")) {
                  return cache.match("/offline.html");
                }
              });
            });
        }
      })
    );
  }
});
