const button = document.querySelector("#open-paypal-com");

const url = "https://ravishekhar.github.io/paypal-buttons/static/iframe.html"
function openPopup() {
    if (window.popupBridge) {
        // Open the popup in a browser, and give it the deep link back to the app
        popupBridge.open(url + '?popupBridgeReturnUrlPrefix=' + popupBridge.getReturnUrlPrefix());

        // Optional: define a callback to process results of interaction with the popup
        popupBridge.onComplete = function (err, payload) {
            if (err) {
                console.error('PopupBridge onComplete Error:', err);
                button.textContent = `Error ... `;
            } else if (!err && !payload) {
                console.log('User closed popup.');
                button.textContent = `User Closed  ... `;
            } else {
                console.log("Done, onComplete", payload);
                button.textContent = `Completed ... `;
            }
        };
    } else {
        const popup = window.open(url);

        window.addEventListener('message', function (event) {
           console.log("event", event.data)
        });
    }
}


button.addEventListener("click", (event) => {
    button.textContent = `Clicked ... `;
    openPopup();
});
