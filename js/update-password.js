document.addEventListener("DOMContentLoaded", async function () {

    // =====================================================
    // SUPABASE CLIENT
    // =====================================================

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    // =====================================================
    // PAGE ELEMENTS
    // =====================================================

    const passwordLoading =
        document.getElementById(
            "password-loading"
        );

    const passwordFormContainer =
        document.getElementById(
            "password-form-container"
        );

    const passwordInvalid =
        document.getElementById(
            "password-invalid"
        );

    const passwordInvalidMessage =
        document.getElementById(
            "password-invalid-message"
        );

    const updatePasswordForm =
        document.getElementById(
            "update-password-form"
        );

    const newPassword =
        document.getElementById(
            "new-password"
        );

    const confirmPassword =
        document.getElementById(
            "confirm-password"
        );

    const updatePasswordButton =
        document.getElementById(
            "update-password-button"
        );

    const passwordSuccess =
        document.getElementById(
            "password-success"
        );

    const passwordError =
        document.getElementById(
            "password-error"
        );


    // =====================================================
    // SHOW INVALID / EXPIRED LINK
    // =====================================================

    function showInvalidLink(message) {

        passwordLoading.style.display =
            "none";

        passwordFormContainer.style.display =
            "none";

        passwordInvalid.style.display =
            "block";

        if (message) {

            passwordInvalidMessage.textContent =
                message;
        }
    }


    // =====================================================
    // CHECK PASSWORD-RESET SESSION
    // =====================================================

    const {
        data: {
            session
        },
        error: sessionError
    } =
        await supabaseClient.auth.getSession();


    if (sessionError) {

        console.error(
            "Password recovery session error:",
            sessionError
        );

        showInvalidLink(
            "We could not verify your password-reset session."
        );

        return;
    }


    if (!session) {

        showInvalidLink(
            "This password-reset link is invalid or has expired."
        );

        return;
    }


    // =====================================================
    // PASSWORD RECOVERY SESSION IS VALID
    // =====================================================

    passwordLoading.style.display =
        "none";

    passwordInvalid.style.display =
        "none";

    passwordFormContainer.style.display =
        "block";


    // =====================================================
    // UPDATE PASSWORD
    // =====================================================

    updatePasswordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            passwordSuccess.style.display =
                "none";

            passwordError.style.display =
                "none";


            const password =
                newPassword.value;

            const confirmation =
                confirmPassword.value;


            // -------------------------------------------------
            // Basic validation
            // -------------------------------------------------

            if (password.length < 8) {

                passwordError.textContent =
                    "Your new password must be at least 8 characters long.";

                passwordError.style.display =
                    "block";

                return;
            }


            if (password !== confirmation) {

                passwordError.textContent =
                    "The passwords do not match.";

                passwordError.style.display =
                    "block";

                return;
            }


            // -------------------------------------------------
            // Disable button
            // -------------------------------------------------

            updatePasswordButton.disabled =
                true;

            updatePasswordButton.textContent =
                "Updating...";


            // -------------------------------------------------
            // Update Supabase Auth password
            // -------------------------------------------------

            const {
                data,
                error
            } =
                await supabaseClient.auth.updateUser({
                    password: password
                });


            if (error) {

                console.error(
                    "Password update error:",
                    error
                );


                passwordError.textContent =
                    "We could not update your password. Please request a new password-reset link and try again.";

                passwordError.style.display =
                    "block";


                updatePasswordButton.disabled =
                    false;

                updatePasswordButton.textContent =
                    "Update Password";

                return;
            }


            console.log(
                "Administrator password updated successfully:",
                data.user?.id
            );


            passwordSuccess.textContent =
                "Your password has been updated successfully. You can now sign in to the administrator dashboard.";

            passwordSuccess.style.display =
                "block";


            updatePasswordForm.reset();


            updatePasswordButton.disabled =
                false;

            updatePasswordButton.textContent =
                "Password Updated";


            // -------------------------------------------------
            // Sign out the recovery session
            // -------------------------------------------------

            await supabaseClient.auth.signOut();

        }
    );


});
