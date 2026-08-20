document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // CREATE SUPABASE CLIENT
    // =====================================================

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    // =====================================================
    // GET FORM
    // =====================================================

    const equipmentForm =
        document.getElementById("equipment-form");


    if (!equipmentForm) {

        console.error(
            "Equipment form was not found."
        );

        return;

    }


    // =====================================================
    // SUBMIT FORM
    // =====================================================

    equipmentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // =============================================
            // GET SUBMIT BUTTON
            // =============================================

            const submitButton =
                equipmentForm.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonText =
                submitButton.textContent;


            submitButton.disabled = true;

            submitButton.textContent =
                "Submitting...";


            // =============================================
            // GET FORM VALUES
            // =============================================

            const title =
                document
                    .getElementById("equipment-title")
                    .value
                    .trim();


            const category =
                document
                    .getElementById("category")
                    .value;


            const condition =
                document
                    .getElementById("condition")
                    .value;


            const description =
                document
                    .getElementById("description")
                    .value
                    .trim();


            const price =
                parseFloat(
                    document
                        .getElementById("price")
                        .value
                );


            const province =
                document
                    .getElementById("location")
                    .value;


            const city =
                document
                    .getElementById("city")
                    .value
                    .trim();


            const sellerName =
                document
                    .getElementById("seller-name")
                    .value
                    .trim();


            const sellerCompany =
                document
                    .getElementById("seller-company")
                    .value
                    .trim();


            const sellerEmail =
                document
                    .getElementById("seller-email")
                    .value
                    .trim();


            const sellerPhone =
                document
                    .getElementById("seller-phone")
                    .value
                    .trim();


            // =============================================
            // BASIC PRICE VALIDATION
            // =============================================

            if (
                Number.isNaN(price) ||
                price < 0
            ) {

                alert(
                    "Please enter a valid asking price."
                );

                submitButton.disabled = false;

                submitButton.textContent =
                    originalButtonText;

                return;

            }


            // =============================================
            // CALL DATABASE FUNCTION
            // =============================================

            const { data, error } =
                await supabaseClient.rpc(
                    "submit_equipment_listing",
                    {
                        p_title: title,
                        p_category: category,
                        p_condition: condition,
                        p_description: description,
                        p_price: price,
                        p_province: province,
                        p_city: city,
                        p_seller_name: sellerName,
                        p_seller_company:
                            sellerCompany || null,
                        p_seller_email:
                            sellerEmail,
                        p_seller_phone:
                            sellerPhone || null
                    }
                );


            // =============================================
            // HANDLE ERROR
            // =============================================

            if (error) {

                console.error(
                    "Supabase submission error:",
                    error
                );


                alert(
                    "There was a problem submitting your listing.\n\n" +
                    error.message
                );


                submitButton.disabled = false;

                submitButton.textContent =
                    originalButtonText;

                return;

            }


            // =============================================
            // SUCCESS
            // =============================================

            console.log(
                "Listing submitted successfully:",
                data
            );


            alert(
                "Thank you! Your equipment listing has been submitted for review."
            );


            // Clear form

            equipmentForm.reset();


            submitButton.disabled = false;

            submitButton.textContent =
                originalButtonText;

        }
    );

});
