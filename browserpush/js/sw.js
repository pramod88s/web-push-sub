/* eslint-env browser, serviceworker, es6 */
'use strict';
/*
 * Visit Github page[Browser-push](https://lahiiru.github.io/browser-push) for guide lines.
 */
/* eslint-disable max-len */

const applicationServerPublicKey = 'BIKyUimgEy0di3vg97K7AQibMxnvrT9hhoCJ863uwmisoKBPupliE4xPsLN1XDlKrQakvKIFnYf1VjPquk9RV1E';

/* eslint-enable max-len */

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log('[Service Worker] Push had this data: ' + JSON.stringify(event.data.json()));

    const title = event.data.json().title[0];
    const options = {
        body: event.data.json().message[0],
        icon: 'http://localhost:9999/browserpush/images/icon.png',
        badge: 'http://localhost:9999/browserpush/images/badge.png',
        data: {
        	url: JSON.parse(event.data.json().data[0]).url
        }	
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');
    
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

self.addEventListener('pushsubscriptionchange', function(event) {
    console.log('[Service Worker]: \'pushsubscriptionchange\' event fired.');
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    event.waitUntil(
        self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        }).then(function(newSubscription) {
            /* TODO: Send the subscription object to application server.
            *       notifications are sent from the server using this object.
            */
            console.log('[Service Worker] New subscription: ', newSubscription);
            console.log(JSON.stringify(newSubscription));
        })
    );
});
