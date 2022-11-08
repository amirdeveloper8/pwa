var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll(
  ".enable-notifications"
);

if (!window.Promise) {
  window.Promise = Promise;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function () {
      console.log("Service worker registered!");
    })
    .catch(function (err) {
      console.log(err);
    });
}

window.addEventListener("beforeinstallprompt", function (event) {
  console.log("beforeinstallprompt fired");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

//third step
function displayConfirmNotifications() {
  if ("serviceWorker" in navigator) {
    var options = {
      body: "You are Here Now! :)",
      // 4th step
      icon: "/src/images/icons/app-icon-96x96.png",
      image: "/src/images/sf-boat.jpg",
      dir: "ltr",
      lang: "en-US",
      vibrate: [100, 50, 200],
      badge: "/src/images/icons/app-icon-96x96.png",
      // 5th step allows to display seprate notifications and vibrate for each of them
      tag: "confirm-notificaion",
      renotify: true,
      // 6th step
      actions: [
        {
          action: "confirm",
          title: "Okay",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
        {
          action: "cancel",
          title: "nop!",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
      ],
      // 11th step
      data: {
        url: "http://localhost:8080/help",
      },
    };
    navigator.serviceWorker.ready.then(function (swreg) {
      swreg.showNotification("Successfully Subscribed!", options);
    });
  }
}

//second steps
// function displayConfirmNotifications() {
//   var options = {
//     body: "You are Here Now! :)",
//   };
//   new Notification("Successfully Subscribed!", options);
// }

// 9th step
function configurePushSub() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  var reg;
  navigator.serviceWorker.ready
    .then(function (swreg) {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(function (sub) {
      if (sub === null) {
        // Create a new Subscription
        var vapidPublicKey =
          "BObaUqNiQomyAqlD2tmc0Lbxf7SXf7mFJwgV_fNsGYL2V5vDMoJFVtzYBwus2-5OXrqQlWsJ0J-kgcnQRIfHZsg";
        var convertedVapidPulicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPulicKey,
        });
      } else {
        // we have a Subscription
      }
    })
    .then(function (newSub) {
      return fetch(
        "https://pwagram-30442-default-rtdb.firebaseio.com/subcription.json",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(newSub),
        }
      );
    })
    .then(function (res) {
      if (res.ok) {
        displayConfirmNotifications();
      }
    })
    .catch((err) => console.log(err));
}

// first step
function askForNotificationPermission() {
  Notification.requestPermission(function (result) {
    console.log("User Choice", result);
    if (result !== "granted") {
      console.log("No notification permission granted!");
    } else {
      // displayConfirmNotifications();
      // 9th step
      // configurePushSub();
      displayConfirmNotifications();
    }
  });
}

// first step
if ("Notification" in window && "serviceWorker" in navigator) {
  for (var i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = "inline-block";
    enableNotificationsButtons[i].addEventListener(
      "click",
      askForNotificationPermission
    );
  }
}
