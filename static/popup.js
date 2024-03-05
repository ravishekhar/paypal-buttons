const url = "https://www.paypal.com"
function open() {
    if (window.popupBridge) {
        // Open the popup in a browser, and give it the deep link back to the app
        popupBridge.open(url + '?popupBridgeReturnUrlPrefix=' + popupBridge.getReturnUrlPrefix());

        // Optional: define a callback to process results of interaction with the popup
        popupBridge.onComplete = function (err, payload) {
            if (err) {
                console.error('PopupBridge onComplete Error:', err);
            } else if (!err && !payload) {
                console.log('User closed popup.');
            } else {
                console.log("Done, onComplete", payload);
            }
        };
    } else {
        const popup = window.open(url);

        window.addEventListener('message', function (event) {
           console.log("event", event.data)
        });
    }
}

const button = document.querySelector("#open-paypal-com");

button.addEventListener("click", (event) => {
    button.textContent = `Click count: ${event.detail}`;
});