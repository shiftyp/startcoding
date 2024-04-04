/**
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Service worker for Firebase Auth test app application. The
 * service worker caches all content and only serves cached content in offline
 * mode.
 */
// @ts-ignore
import * as env from 'env'

import * as firebase from 'firebase/app';
import {User, getAuth} from 'firebase/auth'


const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

// Initialize the Firebase app in the web worker.
firebase.initializeApp(firebaseConfig);

const CACHE_NAME = 'cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/config.js',
  '/script.js',
  '/common.js',
  '/style.css'
];

getAuth().onAuthStateChanged((user) => {
  if (user) {
    console.log('user signed in', user.uid);
  } else {
    console.log('user signed out');
  }
});

/**
 * Returns a promise that resolves with an ID token if available.
 * @return {!Promise<?string>} The promise that resolves with an ID token if
 *     available. Otherwise, the promise resolves with null.
 */
const getIdToken = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = getAuth().onAuthStateChanged((user: User | null) => {
      unsubscribe();
      if (user) {
        user.getIdToken().then((idToken: string) => {
          resolve(idToken);
        }, (error) => {
          resolve(null);
        });
      } else {
        resolve(null);
      }
    });
  }).catch((error) => {
    console.log(error);
  });
};


/**
 * @param {string} url The URL whose origin is to be returned.
 * @return {string} The origin corresponding to given URL.
 */
const getOriginFromUrl = (url: string) => {
  // https://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
  const pathArray = url.split('/');
  const protocol = pathArray[0];
  const host = pathArray[2];
  return protocol + '//' + host;
};


self.addEventListener('install', (event) => {
  // Perform install steps.
  // @ts-ignore
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
    // Add all URLs of resources we want to cache.
    return cache.addAll(urlsToCache)
        .catch((error) => {
          // Suppress error as some of the files may not be available for the
          // current page.
        });
  }));
});

// As this is a test app, let's only return cached data when offline.
// @ts-ignore
self.addEventListener('fetch', (event: FetchEvent) => {
  const fetchEvent = event;
  // Get underlying body if available. Works for text and json bodies.
  const getBodyContent = (req: FetchEvent["request"]) => {
    return Promise.resolve().then(() => {
      if (req.method !== 'GET') {
        if (req.headers.get('Content-Type')?.indexOf('json') !== -1) {
          return req.json()
            .then((json) => {
              return JSON.stringify(json);
            });
        } else {
          return req.text();
        }
      }
    }).catch((error) => {
      // Ignore error.
    });
  };
  const requestProcessor = (idToken: string) => {
    let req = event.request;
    let processRequestPromise = Promise.resolve();
    // For same origin https requests, append idToken to header.
    if (self.location.origin == getOriginFromUrl(event.request.url) &&
        (self.location.protocol == 'https:' ||
         self.location.hostname == 'localhost') &&
        idToken) {
      // Clone headers as request headers are immutable.
      const headers = new Headers();
      for (let entry of Object.entries(req.headers)) {
        headers.append(entry[0], entry[1]);
      }
      // Add ID token to header. We can't add to Authentication header as it
      // will break HTTP basic authentication.
      headers.append('Authorization', 'Bearer ' + idToken);
      processRequestPromise = getBodyContent(req).then((body) => {
        try {
          req = new Request(req.url, {
            method: req.method,
            headers: headers,
            mode: 'same-origin',
            credentials: req.credentials,
            cache: req.cache,
            redirect: req.redirect,
            referrer: req.referrer,
            body: body!,
            // @ts-ignore
            bodyUsed: req.bodyUsed,
            // @ts-ignore
            context: req.context
          });
        } catch (e) {
          // This will fail for CORS requests. We just continue with the
          // fetch caching logic below and do not pass the ID token.
        }
      });
    }
    return processRequestPromise.then(() => {
      return fetch(req);
    })
    .then((response) => {
      // Check if we received a valid response.
      // If not, just funnel the error response.
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      // If response is valid, clone it and save it to the cache.
      const responseToCache = response.clone();
      // Save response to cache only for GET requests.
      // Cache Storage API does not support using a Request object whose method is
      // not 'GET'.
      if (req.method === 'GET') {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(fetchEvent.request, responseToCache);
        });
      }
      // After caching, return response.
      return response;
    })
    .catch((error) => {
      // For fetch errors, attempt to retrieve the resource from cache.
      return caches.match(fetchEvent.request.clone());
    })
    .catch((error) => {
      // If error getting resource from cache, do nothing.
      console.log(error);
    });
  };
  // Try to fetch the resource first after checking for the ID token.
  // @ts-ignore
  event.respondWith(getIdToken().then(requestProcessor, requestProcessor));
});

self.addEventListener('activate', (event) => {
  // Update this list with all caches that need to remain cached.
  const cacheWhitelist = ['cache-v1'];
  // @ts-ignore
  event.waitUntil(caches.keys().then((cacheNames) => {
    return Promise.all(cacheNames.map((cacheName) => {
      // Check if cache is not whitelisted above.
      if (cacheWhitelist.indexOf(cacheName) === -1) {
        // If not whitelisted, delete it.
        return caches.delete(cacheName);
      }
    // Allow active service worker to set itself as the controller for all clients
    // within its scope. Otherwise, pages won't be able to use it until the next
    // load. This makes it possible for the login page to immediately use this.
    // @ts-ignore
    })).then(() => clients.claim());
  }));
});