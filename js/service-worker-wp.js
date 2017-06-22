/* eslint-env browser, serviceworker, es6 */
'use strict';
/*
 * Visit Github page[Browser-push](https://lahiiru.github.io/browser-push) for guide lines.
 */
/* eslint-disable max-len */

const applicationServerPublicKey = 'BKuXoVOSp6LD7S0z4s0tPESi2cfjiVyBSE9SjwHISuWyEDk3yg_ivjNIX-QINEljHiNDl7Y78jEU1Z7nCKSIHBs';
const notificationSettingUrl = 'https://pramod88s.github.io/web-push-sub/';
const settingIconUrl = 'https://pramod88s.github.io/web-push-sub/images/settings.png';
const siteIconUrl = 'https://pbs.twimg.com/profile_images/826320015024672768/Fm3wsT1s_normal.jpg';
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

self.addEventListener('install', function (event) {
    self.skipWaiting();
    //console.log('Installed', event);
});

self.addEventListener('activate', function (event) {
    //console.log('Activated', event); //yes
});

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log('[Service Worker] Push had this data: ' + JSON.stringify(event.data.json()));

    const title = event.data.json().title;
    const iconData = event.data.json().icon;
    const badgeData = event.data.json().badge;
    
    const options = {
        body: event.data.json().message,
        icon: iconData,
        badge: badgeData,
        image: event.data.json().image,
        vibrate: [300, 100, 400], // Vibrate 300ms, pause 100ms, then vibrate 400ms
        data: {
        	url: event.data.json().data.url
        },
        requireInteraction: true,
        actions: [
            {action: 'settings', title: 'Settings', icon: settingIconUrl},
            {action: 'readmore', title: ('Visit TOI Sports'), icon: siteIconUrl}
        ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
//    console.log('[Service Worker] Notification click Received.');
    
    event.notification.close();

   /* event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );*/
    
    // This looks to see if the current is already open and  
    // focuses if it is  
    event.waitUntil(
            clients.matchAll({
                type: "window"
            })
            .then(function (clientList) {
                for (var i = 0; i < clientList.length; i++) {
                    var client = clientList[i];
                    if (client.url == '/' && 'focus' in client)
                        return client.focus();
                }
                if (clients.openWindow) {
                    if (event.action === 'settings') {
                        return clients.openWindow(notificationSettingUrl);                        
                    } else {
                        return clients.openWindow(event.notification.data.url);    
                    }
                }
            })
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
