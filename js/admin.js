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
     * Create the administrator login form.
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
     * Check the existing Supabase session.
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
     * Verify that the authenticated Supabase
     * user is actually an administrator.
     */
    async function verifyAdministrator(user) {

        if (!user) {
            showLogin();
            return;
        }


        console.log(
            "Authenticated user:",
            user.id
        );


        /*
         * Ask the database whether this user
         * is an administrator.
         */
        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "is_admin"
            );


        if (error) {

            console.error(
                "Administrator verification error:",
                error
            );

            showAdminError(
                "We could not verify administrator access."
            );

            return;
        }


        if (data !== true) {

            console.warn(
                "Authenticated user is not an administrator."
            );

            await supabaseClient.auth.signOut();

            showAdminError(
                "You are not authorized to access the administrator area."
            );

            return;
        }


        /*
         * Administrator confirmed.
         */
        console.log(
            "Administrator authorization confirmed."
        );


        adminLogin.style.display = "none";
        adminError.style.display = "none";
        adminDashboard.style.display = "block";


        await loadPendingListings();
    }


    /*
     * Load pending equipment listings.
     *
     * This temporary version reads the listings table
     * only after administrator authorization.
     *
     * We will move this to a dedicated secure RPC
     * in the next step so seller information is not
     * unnecessarily exposed through the Data API.
     */
    async function loadPendingListings() {

    const listingsContainer =
        document.getElementById(
            "admin-listings"
        );


    listingsContainer.innerHTML =
        "<p>Loading pending listings...</p>";


    /*
     * Retrieve pending listings through the
     * administrator-only database function.
     */
    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "get_pending_equipment_listings"
        );


    if (error) {

        console.error(
            "Pending listings error:",
            error
        );

        showAdminError(
            "We could not load the pending listings."
        );

        return;
    }


    if (!data || data.length === 0) {

        listingsContainer.innerHTML = `
            <div class="listing-card">
                <div class="listing-content">

                    <h3>No pending listings</h3>

                    <p>
                        There are currently no equipment
                        listings awaiting review.
                    </p>

                </div>
            </div>
        `;

        return;
    }


    listingsContainer.innerHTML = "";


    data.forEach(function (listing) {

        const card =
            document.createElement("div");

        card.className = "listing-card";

        card.style.marginBottom = "25px";


        const submittedDate =
            listing.created_at
                ? new Date(
                    listing.created_at
                ).toLocaleString()
                : "Unknown";


        const price =
            listing.price !== null &&
            listing.price !== undefined
                ? Number(
                    listing.price
                ).toLocaleString(
                    "en-CA",
                    {
                        style: "currency",
                        currency: "CAD"
                    }
                )
                : "Price not provided";


        const location =
            [
                listing.city,
                listing.province
            ]
                .filter(Boolean)
                .join(", ");


        card.innerHTML = `
            <div class="listing-content">

                <p class="listing-category">
                    ${escapeHtml(
                        listing.category ||
                        "EQUIPMENT"
                    )}
                </p>

                <h2>
                    ${escapeHtml(
                        listing.title ||
                        "Untitled listing"
                    )}
                </h2>

                <p>
                    <strong>Status:</strong>
                    Pending review
                </p>

                <p>
                    <strong>Submitted:</strong>
                    ${escapeHtml(
                        submittedDate
                    )}
                </p>

                <p>
                    <strong>Condition:</strong>
                    ${escapeHtml(
                        formatCondition(
                            listing.condition
                        )
                    )}
                </p>

                <p>
                    <strong>Price:</strong>
                    ${escapeHtml(
                        price
                    )}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${escapeHtml(
                        location
                    )}
                </p>

                <p>
                    <strong>Seller:</strong>
                    ${escapeHtml(
                        listing.seller_name ||
                        ""
                    )}
                </p>

                ${
                    listing.seller_company
                        ? `
                            <p>
                                <strong>Company:</strong>
                                ${escapeHtml(
                                    listing.seller_company
                                )}
                            </p>
                          `
                        : ""
                }

                <p>
                    <strong>Email:</strong>
                    ${escapeHtml(
                        listing.seller_email ||
                        ""
                    )}
                </p>

                ${
                    listing.seller_phone
                        ? `
                            <p>
                                <strong>Phone:</strong>
                                ${escapeHtml(
                                    listing.seller_phone
                                )}
                            </p>
                          `
                        : ""
                }

                ${
                    listing.description
                        ? `
                            <div style="margin-top: 15px;">

                                <strong>
                                    Description:
                                </strong>

                                <p>
                                    ${escapeHtml(
                                        listing.description
                                    )}
                                </p>

                            </div>
                          `
                        : ""
                }

            </div>
        `;


        listingsContainer.appendChild(
            card
        );
    });
}


    /*
     * Convert database condition values into
     * customer-friendly wording.
     */
    function formatCondition(condition) {

        const conditionMap = {
            new: "New",
            excellent: "Used - Excellent",
            good: "Used - Good",
            fair: "Used - Fair",
            parts: "For Parts"
        };

        return (
            conditionMap[condition] ||
            condition ||
            "Not specified"
        );
    }


    /*
     * Escape user-submitted text before inserting
     * it into HTML.
     */
    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /*
     * Show login screen.
     */
    function showLogin() {

        adminLogin.style.display = "block";
        adminDashboard.style.display = "none";
        adminError.style.display = "none";
    }


    /*
     * Show administrator error.
     */
    function showAdminError(message) {

        adminLogin.style.display = "none";
        adminDashboard.style.display = "none";

        adminError.style.display = "block";

        adminErrorText.textContent =
            message;
    }

});
