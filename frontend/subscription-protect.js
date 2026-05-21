// ===============================
// ENERGISE PREMIUM SYSTEM
// ===============================

document.addEventListener(

  "DOMContentLoaded",

  () => {

    initializePremiumLocks();

  }

);

// ===============================
// CHECK LOGIN
// ===============================

function isLoggedIn() {

  return localStorage.getItem("token");

}

// ===============================
// CHECK SUBSCRIPTION
// ===============================

function isSubscribed() {

  return localStorage.getItem("isSubscribed") === "true";

}

// ===============================
// PREMIUM LOCK SYSTEM
// ===============================

function initializePremiumLocks() {

  const premiumLinks = document.querySelectorAll(

    ".premium-link"

  );

  premiumLinks.forEach((link) => {

    link.addEventListener(

      "click",

      (e) => {

        if (!isLoggedIn()) {

          e.preventDefault();

          alert(

            "⚠️ Please login first."

          );

          window.location.href =

            "login.html";

          return;

        }

        if (!isSubscribed()) {

          e.preventDefault();

          showPremiumModal();

        }

      }

    );

  });

}

// ===============================
// SHOW PREMIUM MODAL
// ===============================

function showPremiumModal() {

  let modal = document.getElementById(

    "premiumModal"

  );

  if (!modal) {

    modal = document.createElement("div");

    modal.id = "premiumModal";

    modal.innerHTML = `

      <div style="
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background:rgba(0,0,0,0.75);
        display:flex;
        justify-content:center;
        align-items:center;
        z-index:9999;
      ">

        <div style="
          background:#141850;
          padding:40px;
          border-radius:20px;
          text-align:center;
          width:90%;
          max-width:450px;
          color:white;
          box-shadow:0 0 30px rgba(255,105,180,0.3);
        ">

          <h2 style="
            color:#ff69b4;
            margin-bottom:20px;
          ">
            🔒 Premium Plan Required
          </h2>

          <p style="
            margin-bottom:25px;
            color:#ddd;
          ">
            Subscribe to EnerGise Premium
            to unlock workouts and tutorials.
          </p>

          <button
            id="upgradeBtn"
            style="
              background:linear-gradient(135deg,#ff69b4,#9c27b0);
              border:none;
              padding:12px 25px;
              border-radius:10px;
              color:white;
              font-weight:bold;
              cursor:pointer;
              margin-right:10px;
            "
          >

            🚀 Upgrade Plan

          </button>

          <button
            id="closePremiumModal"
            style="
              background:#444;
              border:none;
              padding:12px 20px;
              border-radius:10px;
              color:white;
              cursor:pointer;
            "
          >

            Close

          </button>

        </div>

      </div>

    `;

    document.body.appendChild(modal);

    // Upgrade button
    document
      .getElementById("upgradeBtn")
      .addEventListener(

        "click",

        () => {

          window.location.href =

            "subscription.html";

        }

      );

    // Close button
    document
      .getElementById("closePremiumModal")
      .addEventListener(

        "click",

        () => {

          modal.remove();

        }

      );

  }

}

// ===============================
// PREMIUM ACTIVATION
// ===============================

function activatePremium(plan) {

  localStorage.setItem(

    "isSubscribed",

    "true"

  );

  localStorage.setItem(

    "subscriptionPlan",

    plan

  );

}