import {loadScript} from "https://unpkg.com/@paypal/paypal-js@4.2.1/dist/esm/paypal-js.js";
import {getOptionsFromQueryString, setPerformanceMark} from "./utils.js";

const sdkScriptDefaultOptions = {
    "client-id": "test",
    debug: "true",
};
const outputElement = document.querySelector("#output");

const sdkScriptOptionsFromQueryString = getOptionsFromQueryString();
const sdkScriptOptions = Object.keys(sdkScriptOptionsFromQueryString).length
    ? sdkScriptOptionsFromQueryString
    : sdkScriptDefaultOptions;


export function renderButtons({showShippingChange, redirectOnApproval} = {}) {

    const buttonOptions = {
        onError(err) {
            console.error("buttons onError() callback", err);
        },

        createOrder(data, actions) {
            return actions.order
                .create({
                    purchase_units: [
                        {
                            amount: {
                                value: 0.05,
                            },
                        },
                    ],
                })
                .then((orderID) => {
                    console.log({orderID});
                    outputElement.innerHTML = `<pre>orderId = ${orderID}</pre>`
                    return orderID;
                });
        },

        onApprove(data, actions) {

            console.log('onApprove', data, actions)

            return actions.order
                .get()
                .then((orderDetails) => {
                    console.log({orderDetails});

                    outputElement.innerHTML =
                        "<h3>Thank you for approving the payment. There is no payment capture. If there is a temp hold on card, that should get reverted. </h3>";
                    outputElement.innerHTML += `<pre>orderId = ${data.orderID} status: ${orderDetails.status}</pre>`;

                    if (redirectOnApproval) {
                        actions.redirect(`https://ravishekhar.github.io/paypal-buttons/static/thankyou.html?orderID=${data.orderID}`)
                    }
                })
                .catch((err) => {
                    console.error(err);
                    outputElement.innerHTML = `<h3>The get details failed. \n ${err.toString()}</h3>`;
                });
        },
    };

    const shippingChangeOptions = {
        onShippingChange(data, actions) {
            console.log(`onShippingAddressChange start`, data, actions);
            console.log(`onShippingAddressChange state`, data.shipping_address.state);

            return actions.order.patch([{
                "op": "replace",
                "path": "/purchase_units/@reference_id=='default'/amount",

                "value": {
                    "breakdown": {
                        "item_total": {
                            "currency_code": "USD",
                            "value": "2.00"
                        },
                        "shipping": {
                            "currency_code": "USD",
                            "value": "1.0"
                        }
                    },
                    "currency_code": "USD",
                    "value": "3.00"
                }

            }]).then(data => {
                console.log('ONSHIPPING_CHANGE_ENDS');
                return data;
            })
        }
    }


    loadScript(sdkScriptOptions)
        .then((paypal) => {
            console.log("successfully loaded the JS SDK script");
            setPerformanceMark("sdk-script-load");

            let buttonsInstance;

            try {
                if (showShippingChange) {
                    buttonsInstance = paypal.Buttons({...buttonOptions, ...shippingChangeOptions});
                } else {
                    buttonsInstance = paypal.Buttons(buttonOptions);
                }

            } catch (err) {
                console.error("failed to create the buttons component", err);
            }

            buttonsInstance
                .render("#buttons-container")
                .then(() => {
                    console.log("successfully rendered the paypal buttons");
                    setPerformanceMark("sdk-buttons-render");
                })
                .catch((err) => {
                    console.error("failed to render paypal buttons", err);
                });
        })
        .catch((err) => {
            console.error("failed to load the JS SDK script", err);
        });
}
