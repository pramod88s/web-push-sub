'use strict';
/*
 * Visit Github page[Browser-push](https://lahiiru.github.io/browser-push) for guide lines.
 */
const applicationServerPublicKey = 'BIKyUimgEy0di3vg97K7AQibMxnvrT9hhoCJ863uwmisoKBPupliE4xPsLN1XDlKrQakvKIFnYf1VjPquk9RV1E';

var domain = "web.tech.lahiru";
var pushServerRegUrl = "http://localhost:9999/web-push-sender/register";
var pushServerUnregUrl = "http://localhost:9999/web-push-sender/unregister";
var ua = window.navigator.userAgent,
safariTxt = ua.indexOf ( "Safari" ),
chrome = ua.indexOf ( "Chrome" ),
version = ua.substring(0,safariTxt).substring(ua.substring(0,safariTxt).lastIndexOf("/")+1);
var actionButton = document.querySelector('.action-button');
let isSubscribed = false;
let swRegistration = null;

console.log('%c WebPush script injected.', 'background: green; color: white; display: block; font-size:20px');

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

function updateBtn() {
    if (Notification.permission === 'denied') {
        alert('Push Messaging Blocked.');
        //updateSubscriptionOnServer(null);
        return;
    }
    if (isSubscribed) {
        actionButton.innerText='Disable Push Messaging';
    } else {
        actionButton.innerText='Enable Push Messaging';
    }
}

function updateSubscriptionOnServer(subscription, pushServerUrl, isAsync) {
    /* Send the subscription object to application server.
     *       notifications are sent from the server using this object.
     */
    if (subscription) {
    	
    	$.ajax({
    		url: pushServerUrl,
    		type: 'POST',
    		contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(subscription),
            async: isAsync,
            success: function(data){
            	//hideModal('mobile_user_Modal');
            	//window.location.reload(true);
            	if(data && data.success == '1'){
            		return true;
            	}else{
            		return false;
            	}
            },
            error : function(xhr, ajaxOptions, thrownError){
            	console.log("Error occurred while registering user subscription details on web push server. ERROR: " + xhr.responseText);
            	return false;
            }
        });
    	return true;
    }else
    	return false;
    
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    }).then(function(subscription) {
        console.log('User is subscribed:', subscription);
        var isRegOnPushServer = updateSubscriptionOnServer(subscription, pushServerRegUrl, false);
        
        if(!isRegOnPushServer){
        	unsubscribeUser();
            return false;
        }
        
        isSubscribed = true;
        updateBtn();
        // Show subscription for debug
        console.log('Subscription details:',JSON.stringify(subscription));
    })
    .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
    });
}

function unsubscribeUser() {
	var subscriptionToDisable = null;
    swRegistration.pushManager.getSubscription().then(function(subscription) {
        if (subscription) {
        	subscriptionToDisable = JSON.parse(JSON.stringify(subscription));
//            alert("You are not subscribed now.")
            return subscription.unsubscribe();
        }
    }).catch(function(error) {
        console.log('Error unsubscribing', error);
    }).then(function() {
        isSubscribed = false;
        updateSubscriptionOnServer(subscriptionToDisable, pushServerUnregUrl, true);
        console.log('User is unsubscribed.');
        updateBtn();
    });
}

function subscribe() {
    if (isSubscribed) {
        unsubscribeUser();
    } else {
        subscribeUser();
    }
    // Set the initial subscription value
    swRegistration.pushManager.getSubscription().then(function(subscription) {
        isSubscribed = !(subscription === null);
        //updateSubscriptionOnServer(subscription);
    });
}

// For safari
function requestPermissions() {
    window.safari.pushNotification.requestPermission('https://apps.wearetrying.info/push-api', domain, {}, function(subscription) {
        console.log(subscription);
        if(c.permission === 'granted') {
            updateSubscriptionOnServer(subscription);
        }
        else if(c.permission === 'denied') {
            // TODO:
        }
    });
}

function nonSafariInit(){
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');
        actionButton.addEventListener('click',function(){
            subscribe();
        });
        navigator.serviceWorker.register('js/sw.js').then(function(swReg) {
            console.log('Service Worker is registered', swReg);
            actionButton.innerText='Enable Push Messaging';
            swRegistration = swReg;
            
            // Set the initial subscription value
            swRegistration.pushManager.getSubscription().then(function(subscription) {
                isSubscribed = !(subscription === null);
                updateBtn();
                //updateSubscriptionOnServer(subscription);
            });
            
        }).catch(function(error) {
            console.error('Service Worker Error', error);
        });
    } else {
        console.warn('Push messaging is not supported');
        alert('Push Not Supported');
    }
}

// For safari
function safariIniti() {
    var pResult = window.safari.pushNotification.permission(domain);
    
    if(pResult.permission === 'default') {
        //request permission
        requestPermissions();
    } else if (pResult.permission === 'granted') {
        console.log("Permission for " + domain + " is " + pResult.permission);
        var token = pResult.deviceToken;
        // Show subscription for debug
        window.prompt('Subscription details:',token);
    } else if(pResult.permission === 'denied') {
        alert("Permission for " + domain + " is " + pResult.permission);
    }
}

/*
 * Call relevant methods.
 */
if(chrome ==-1 && safariTxt > 0) {
    if(parseInt(version, 10) >=7){
        console.log("Safari browser detected.");
        safariIniti();
    } else {
        console.log("Safari unsupported version detected.");
    }
}
else {
	console.log("Non Safari browser detected.");
	nonSafariInit();
}