// auth.js

function checkPremiumAccess() {

    // CHECK LOGIN
    const token = localStorage.getItem("token");

    if (!token) {

        alert("Please login first");

        // save current page
        localStorage.setItem(
            "redirectAfterLogin",
            window.location.href
        );

        window.location.href = "login.html";

        return false;
    }

    // CHECK SUBSCRIPTION
    const subscription =
        localStorage.getItem("activeSubscription");

    if (!subscription) {

        alert(
            "Premium Plan Required!"
        );

        window.location.href =
            "subscription.html";

        return false;
    }

    return true;
}