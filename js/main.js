'use strict';
/*
 * Visit Github page[Browser-push](https://lahiiru.github.io/browser-push) for guide lines.
 */
const applicationServerPublicKey = 'BKuXoVOSp6LD7S0z4s0tPESi2cfjiVyBSE9SjwHISuWyEDk3yg_ivjNIX-QINEljHiNDl7Y78jEU1Z7nCKSIHBs';

var domain = "web.tech.lahiru";
var pushServerRegUrl = "http://223.165.26.120:8181/web-push-sender/register";
var pushServerUnregUrl = "http://223.165.26.120:8181/web-push-sender/unregister";
var ua = window.navigator.userAgent,
safariTxt = ua.indexOf ( "Safari" ),
chrome = ua.indexOf ( "Chrome" ),
version = ua.substring(0,safariTxt).substring(ua.substring(0,safariTxt).lastIndexOf("/")+1);
var actionButton = document.querySelector('.action-button');
let isSubscribed = false;
let swRegistration = null;

/* Detect browser script. Grabbed from
 * http://www.javascripter.net/faq/browsern.htm
 */
var nVer = navigator.appVersion;
var nAgt = navigator.userAgent;
var browserName  = navigator.appName;
var fullVersion  = ''+parseFloat(navigator.appVersion);
var majorVersion = parseInt(navigator.appVersion,10);
var nameOffset,verOffset,ix;

// In Opera 15+, the true version is after "OPR/"
if ((verOffset=nAgt.indexOf("OPR/"))!=-1) {
    browserName = "Opera";
    fullVersion = nAgt.substring(verOffset+4);
}
// In older Opera, the true version is after "Opera" or after "Version"
else if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
    browserName = "Opera";
    fullVersion = nAgt.substring(verOffset+6);
    if ((verOffset=nAgt.indexOf("Version"))!=-1)
        fullVersion = nAgt.substring(verOffset+8);
}
// In MSIE, the true version is after "MSIE" in userAgent
else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
    browserName = "Microsoft Internet Explorer";
    fullVersion = nAgt.substring(verOffset+5);
}
// In Chrome, the true version is after "Chrome"
else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
    browserName = "Chrome";
    fullVersion = nAgt.substring(verOffset+7);
}
// In Safari, the true version is after "Safari" or after "Version"
else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
    browserName = "Safari";
    fullVersion = nAgt.substring(verOffset+7);
    if ((verOffset=nAgt.indexOf("Version"))!=-1)
        fullVersion = nAgt.substring(verOffset+8);
}
// In Firefox, the true version is after "Firefox"
else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
    browserName = "Firefox";
    fullVersion = nAgt.substring(verOffset+8);
}
// In most other browsers, "name/version" is at the end of userAgent
else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) <
    (verOffset=nAgt.lastIndexOf('/')) )
{
    browserName = nAgt.substring(nameOffset,verOffset);
    fullVersion = nAgt.substring(verOffset+1);
    if (browserName.toLowerCase()==browserName.toUpperCase()) {
        browserName = navigator.appName;
    }
}
// trim the fullVersion string at semicolon/space if present
if ((ix=fullVersion.indexOf(";"))!=-1)
    fullVersion=fullVersion.substring(0,ix);
if ((ix=fullVersion.indexOf(" "))!=-1)
    fullVersion=fullVersion.substring(0,ix);

majorVersion = parseInt(''+fullVersion,10);
if (isNaN(majorVersion)) {
    fullVersion  = ''+parseFloat(navigator.appVersion);
    majorVersion = parseInt(navigator.appVersion,10);
}

// displaying browser attributes
document.getElementById("browser-details").innerHTML
=   ''
    +'Browser name  = <em>'+browserName+'</em><br>'
    +'Full version  = <em>'+fullVersion+'</em><br>'
    +'Major version = <em>'+majorVersion+'</em><br>'
    +'navigator.appName = <em>'+navigator.appName+'</em><br>'
    +'navigator.userAgent = <em>'+navigator.userAgent+'</em><br>';

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
    	var updated;
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
            		updated = true;
            	}else{
            		updated = false;
            	}
            },
            error : function(xhr, ajaxOptions, thrownError){
            	console.log("Error occurred while registering user subscription details on web push server. ERROR: " + xhr.responseText);
            	updated = false;
            }
        });
//    	return true;
    	return updated;
    }else
    	return false;
    
}
function loadBrowserAttr(subscriptionToLog){
	subscriptionToLog.browserName = browserName;
	subscriptionToLog.fullVersion = fullVersion;
	subscriptionToLog.majorVersion = majorVersion;
	subscriptionToLog.navigatorAppName = navigator.appName;
	subscriptionToLog.navigatorUserAgent = navigator.userAgent;
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    }).then(function(subscription) {
        console.log('User is subscribed:', subscription);
        
        var subscriptionToLog = JSON.parse(JSON.stringify(subscription));
        loadBrowserAttr(subscriptionToLog);
        
        var isRegOnPushServer = updateSubscriptionOnServer(subscriptionToLog, pushServerRegUrl, false);
        
        if(!isRegOnPushServer){
        	unsubscribeUser();
            return false;
        }
        
        isSubscribed = true;
        updateBtn();
        // Show subscription for debug
        console.log('Subscription details:',JSON.stringify(subscription));
        onRegisterNotify(swRegistration);
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
//        loadBrowserAttr(subscriptionToDisable);
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
        navigator.serviceWorker.register('js/service-worker-wp.js').then(function(swReg) {
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

function onRegisterNotify(reg) {
    try {
        var notification = reg.showNotification('TOI', {
            body: 'Thank you for subscribing to TOI Sports News alerts.',
            icon: 'https://pbs.twimg.com/profile_images/826320015024672768/Fm3wsT1s_normal.jpg',
            vibrate: [300, 100, 400], // Vibrate 300ms, pause 100ms, then vibrate 400ms
            tag: 'toisportsnews-welcome',
            data: {
                url: 'http://timesofindia.indiatimes.com/sports'
            }
        });
        notification.onclick = function (event) {
            event.target.close();
            window.location.href = event.target.data.url;
            return;
        };
    } catch (err) {/*log this error alert(err.message)*/
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
