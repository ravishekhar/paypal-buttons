import { loadScript } from "https://unpkg.com/@paypal/paypal-js@4.2.1/dist/esm/paypal-js.js";
import { getOptionsFromQueryString, setPerformanceMark } from "./utils.js";

const sdkScriptDefaultOptions = {
    "client-id": "test",
    debug: "true",
};
const outputElement = document.querySelector("#output");

const sdkScriptOptionsFromQueryString = getOptionsFromQueryString();
const sdkScriptOptions = Object.keys(sdkScriptOptionsFromQueryString).length
    ? sdkScriptOptionsFromQueryString
    : sdkScriptDefaultOptions;

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
                console.log({ orderID });
                outputElement.innerHTML = `<pre>orderId = ${orderID}</pre>`
                return orderID;
            });
    },

    onApprove(data, actions) {


        return actions.order
            .get()
            .then((orderDetails) => {
                console.log({ orderDetails });
                outputElement.innerHTML =
                    "<h3>Thank you for approving the payment. There is no payment capture. If there is a temp hold on card, that should get reverted. </h3>";
                outputElement.innerHTML += `<pre>orderId = ${data.orderID} status: ${orderDetails.status}</pre>`
            })
            .catch((err) => {
                console.error(err);
                outputElement.innerHTML = `<h3>The get details failed. \n ${err.toString()}</h3>`;
            });
    },
};

loadScript(sdkScriptOptions)
    .then((paypal) => {
        console.log("successfully loaded the JS SDK script");
        setPerformanceMark("sdk-script-load");

        let buttonsInstance;

        try {
            buttonsInstance = paypal.Buttons(buttonOptions);
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
