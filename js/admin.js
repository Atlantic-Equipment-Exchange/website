document.addEventListener("DOMContentLoaded", async function () {

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );

    const adminLogin =
        document.getElementById("admin-login");

    const adminDashboard =
        document.getElementById("admin-dashboard");

    const adminError =
        document.getElementById("admin-error");

    const adminErrorText =
        document.getElementById("admin-error-text");

    /*
     * Create the login form
     */
    adminLogin.innerHTML = `
        <h2>Administrator Access</h2>

        <form id="admin-login-form">

            <div style="margin-bottom: 15px;">
                <label for="admin-email">
                    Email
                </label>

                <input
                    type="email"
                    id="admin-email"
                    required
                    autocomplete="username"
                >
            </div>

            <div style="margin-bottom: 15px;">
                <label for="admin-password">
                    Password
                </label>

                <input
                    type="password"
                    id="admin-password"
                    required
                    autocomplete="current-password"
                >
            </div>

            <button
                type="submit"
                id="admin-login-button"
            >
                Sign In
            </button>

        </form>

        <p
            id="admin-login-message"
            style="display: none; margin-top: 15px;"
        ></p>
    `;

    const loginForm =
        document.getElementById("admin-login-form");

    const loginButton =
        document.getElementById("admin-login-button");

    const loginMessage =
        document.getElementById("admin-login-message");


    /*
     * Check whether an administrator is already signed in.
     */
    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (session) {

        await verifyAdministrator(
            session.user
        );
    }


    /*
     * Handle administrator login.
     */
    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            loginButton.disabled = true;
            loginButton.textContent = "Signing In...";

            loginMessage.style.display = "none";

            const email =
                document
                    .getElementById("admin-email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("admin-password")
                    .value;


            const {
                data,
                error
            } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });


            if (error) {

                console.error(
                    "Administrator login error:",
                    error
                );

                loginMessage.textContent =
                    "Invalid administrator email or password.";

                loginMessage.style.display = "block";

                loginButton.disabled = false;
                loginButton.textContent = "Sign In";

                return;
            }


            await verifyAdministrator(
                data.user
            );

        }
    );


    /*
     * Verify that the authenticated user
     * is actually an administrator.
     */
    async function verifyAdministrator(user) {

        if (!user) {
            return;
        }


        /*
         * We do not directly query admin_users here.
         *
         * Instead, we will use the secure database
         * function later when loading the dashboard.
         *
         * For now, simply confirm that Supabase Auth
         * has successfully authenticated the user.
         */
        console.log(
            "Authenticated administrator candidate:",
            user.id
        );


        adminLogin.style.display = "none";
        adminDashboard.style.display = "block";

        await loadPendingListings();
    }


    /*
     * Load pending listings.
     *
     * This will be replaced with the secure
     * administrator RPC in the next step.
     */
    async function loadPendingListings() {

        const listingsContainer =
            document.getElementById("admin-listings");

        listingsContainer.innerHTML = `
            <p>
                Administrator authenticated.
                Pending listings will be loaded next.
            </p>
        `;
    }

});
