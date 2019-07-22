importScripts('/static/js/idb.js');
importScripts('/static/js/utility.js');

const CACHE_VERSION = 2;
const CACHE_STATIC_NAME  = `static-v${CACHE_VERSION}`;
const CACHE_DYNAMIC_NAME  = `dynamic-v${CACHE_VERSION}`;
const STATIC_FILES = [
  '/',
  '/offline',
  '/static/js/idb.js',
  '/static/js/app.js',
  '/static/js/feed.js',
  '/static/js/material.min.js',
  '/static/css/app.css',
  '/static/css/feed.css',
  '/static/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  '/static/manifest.json'
];


// Cleaning up cache
function trimCache(cacheName, maxItems) {
  caches.open(cacheName)
  .then(cache => {
    cache.keys()
    .then(keys => {
    if (keys.length > maxItems) {
      cache.delete(keys[0])
      .then(trimCache(cacheName, maxItems));
    }
  });
  })
}

// Cache app shell
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing service worker', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
    .then(cache => {
      console.log(`[Service Worker] Pre-caching app shell -> ${CACHE_STATIC_NAME}`);
      cache.addAll(STATIC_FILES);
    })
  )
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating service worker', event);
  // Clear old cached data for updates
  event.waitUntil(
    caches.keys()
    .then(function(key_list) {
      return Promise.all(key_list.map(function(key) {
        if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
          console.log(`[Service Worker] Removing old cache -> ${key}`)
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

function isInArray(string, array) {
  let cachePath;
  if (string.indexOf(self.origin) === 0) {
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length);
  } else {
    cachePath = string;
  }
  return array.indexOf(cachePath) > -1;
}

// Dynamic caching
// Cache with network fallback strategy
// Can work well, but will sometimes get 'cache-stuck'
// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request)
//       .then(response => {
//         if (response) {
//           return response
//         } else {
//           return fetch(event.request)
//             .then(res => { // res as argument name because response was used above
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(cache => {
//                   // return res.clone() here so res object is not used up
//                   // before return
//                   trimCache(CACHE_DYNAMIC_NAME, 25)
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//             })
//             .catch(err => {
//               return caches.open(CACHE_STATIC_NAME)
//               .then(function(cache) {
//                 return cache.match('/offline');
//               });
//             });
//         }
//       })
//   );
// });


// Cache only strategy
// Only good in some cases
// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Network only strategy
// Same as having no service worker
// self.addEventListener('fetch', event => {
//   event.respondWith(
//     fetch(event.request)
//   );
// });

// Network with cache fallback strategy
// Might not be a good solution if there is a really bad connection
// self.addEventListener('fetch', event => {
//   event.respondWith(
//     fetch(event.request)
//      .then(res => {
//       return caches.open(CACHE_DYNAMIC_NAME)
//         .then(cache => {
//           cache.put(event.request.url, res.clone());
//           return res;
//         })
//     })
//   )
// });

// Cache then network strategy
// Presents cached data immediately while background fetching network data
// Has some code in app.js file too
self.addEventListener('fetch', event => {
  // let url = '/api/posts';
  let url = '/';
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(fetch(event.request)
    .then(res => {
      let clonedRes = res.clone()
      clearAllData('table-name')
        .then(() => {
          return clonedRes.json();
          // Make sure data is in correct format for this
        })
          .then(data => {
            for (let key in data) {
              writeData('table-name', data[key])
            }
      });
      return res;
    })
    );
  } else if (is_in_array(event.request.url, STATIC_FILES)) {
    // Cache only strategy
    event.respondWith(
      caches.match(event.request)
      );
  } else {
    event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response
        } else {
          return fetch(event.request)
            .then(res => { // res as argument name because response was used above
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(cache => {
                  // return res.clone() here so res object is not used up
                  // before return
                  trimCache(CACHE_DYNAMIC_NAME, 25)
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            })
            .catch(err => {
              return caches.open(CACHE_STATIC_NAME)
              .then(function(cache) {
                if (event.request.headers.get('accept').includes('text/html')) {
                  return cache.match('/offline');
                }
              });
            });
        }
      })
    )
  }
});
