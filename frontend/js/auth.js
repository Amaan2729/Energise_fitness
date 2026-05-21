// ===============================
// ENERGISE AUTH SYSTEM
// ===============================

const API_BASE_URL = "https://energise.onrender.com";

// ===============================
// LOGIN
// ===============================

async function loginUser(email, password) {

    try {

        const response = await fetch(

            `${API_BASE_URL}/api/users/login`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    email,

                    password

                })

            }

        );

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem(

                "energiseUser",

                JSON.stringify(data)

            );

            alert("✅ Login Successful");

            window.location.href = "index.html";

        }

        else {

            alert(

                data.message ||

                "❌ Login Failed"

            );

        }

    }

    catch (error) {

        console.error(error);

        alert(

            "⚠️ Server Error"

        );

    }

}

// ===============================
// SIGNUP
// ===============================

async function signupUser(name, email, password) {

    try {

        const response = await fetch(

            `${API_BASE_URL}/api/users/register`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    name,

                    email,

                    password

                })

            }

        );

        const data = await response.json();

        if (response.ok) {

            alert(

                "✅ Signup Successful"

            );

            window.location.href = "login.html";

        }

        else {

            alert(

                data.message ||

                "❌ Signup Failed"

            );

        }

    }

    catch (error) {

        console.error(error);

        alert(

            "⚠️ Server Error"

        );

    }

}

// ===============================
// LOGOUT
// ===============================

function logoutUser() {

    localStorage.removeItem(

        "energiseUser"

    );

    window.location.href = "login.html";

}

// ===============================
// CHECK LOGIN
// ===============================

function isLoggedIn() {

    return localStorage.getItem(

        "energiseUser"

    ) !== null;

}