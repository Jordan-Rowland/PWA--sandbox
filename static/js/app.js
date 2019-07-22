// Register ServiceWorker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register("../sw.js", {scope: "/"})
    .then(registration => {
      console.log(`ServiceWorker running: ${registration}`);
    })
    .catch(err => {
      console.log(err)
    })
}

window.addEventListener('beforeinstallprompt', event => {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});


// // Part of 'Cache then network strategy'
// // let url = '/'; // Add URL here
// let url = 'http://www.httpbin.org/post'; // Add URL here
// let networkDataReceived = false;

// fetch(url, {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'applications/json',
//     'Accept': 'applications/json',
//   },
//   body: JSON.stringify({
//     message: 'Some message'
//   })
// })


// // Part of 'Cache then network strategy'
// let url = 'https://jsonplaceholder.typicode.com/posts/1'; // Add URL here
// let networkDataReceived = false;

// fetch(url)
//   .then(res => res.json())
//   .then(data => {
//     networkDataReceived = true;
//     console.log(`From web -> ${data}`)
//     // do_something()
//   })

// if ('caches' in window) {
//   caches.match(url)
//     .then(response => {
//       if (response) {
//         return response.json();
//       }
//     })
//     .then(data => {
//       console.log(`From cache -> ${data}`);
//       if (!networkDataReceived) {
//         // do_something();
//         console.log('Not network data!')
//       }
//     })
// }
// // End of part of 'Cache then network strategy'


let url = 'https://jsonplaceholder.typicode.com/posts/1'; // Add URL here
let networkDataReceived = false;

fetch(url)
  .then(res => res.json())
    .then(data => {
      networkDataReceived = true;
      console.log(`From web -> ${data}`)
      // do_something()
    })

if ('indexedDB' in window) {
  readAllData('table-name')
    .then(data => {
      if (!networkDataReceived) {
        console.log(`From cache -> ${data}`);
        // do_something()
      }
    });
}

