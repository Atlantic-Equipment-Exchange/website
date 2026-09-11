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

    const listingLoading =
        document.getElementById(
            "listing-loading"
        );

    const listingError =
        document.getElementById(
            "listing-error"
        );

    const listingErrorText =
        document.getElementById(
            "listing-error-text"
        );

    const listingDetails =
        document.getElementById(
            "listing-details"
        );

    const listingTitle =
        document.getElementById(
            "listing-title"
        );

    const listingSubtitle =
        document.getElementById(
            "listing-subtitle"
        );

    const listingTitleMain =
        document.getElementById(
            "listing-title-main"
        );

    const listingCategory =
        document.getElementById(
            "listing-category"
        );

    const listingDescription =
        document.getElementById(
            "listing-description"
        );

    const listingLocation =
        document.getElementById(
            "listing-location"
        );

    const listingCondition =
        document.getElementById(
            "listing-condition"
        );

    const listingConditionBadge =
        document.getElementById(
            "listing-condition-badge"
        );

    const listingPrice =
        document.getElementById(
            "listing-price"
        );

    const listingImagePlaceholder =
        document.getElementById(
            "listing-image-placeholder"
        );

    const listingPhotoThumbnails =
        document.getElementById(
            "listing-photo-thumbnails"
        );
    
    const listingImageGallery =
        document.getElementById(
            "listing-image-gallery"
        );
    
    const listingEnquiryForm =
        document.getElementById(
            "listing-enquiry-form"
        );

    const enquiryName =
        document.getElementById(
            "enquiry-name"
        );

    const enquiryEmail =
        document.getElementById(
            "enquiry-email"
        );

    const enquiryPhone =
        document.getElementById(
            "enquiry-phone"
        );

    const enquiryMessage =
        document.getElementById(
            "enquiry-message"
        );

    const enquirySubmitButton =
        document.getElementById(
            "enquiry-submit-button"
        );

    const enquirySuccess =
        document.getElementById(
            "enquiry-success"
        );

    const enquiryError =
        document.getElementById(
            "enquiry-error"
        );
    // =====================================================
    // GET LISTING ID FROM URL
    // =====================================================

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const listingId =
        urlParams.get("id");


    if (!listingId) {

        showError(
            "No equipment listing was specified."
        );

        return;

    }


    // =====================================================
    // VALIDATE LISTING ID
    // =====================================================

    const numericListingId =
        Number(listingId);


    if (
        !Number.isInteger(
            numericListingId
        ) ||
        numericListingId <= 0
    ) {

        showError(
            "The equipment listing ID is invalid."
        );

        return;

    }


    // =====================================================
    // LOAD LISTING
    // =====================================================

    async function loadListing() {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "get_equipment_listing",
                {
                    p_listing_id:
                        numericListingId
                }
            );


        if (error) {

            console.error(
                "Error loading listing:",
                error
            );


            showError(
                "We were unable to retrieve this equipment listing."
            );

            return;

        }


        if (
            !data ||
            data.length === 0
        ) {

            showError(
                "This listing is no longer available."
            );

            return;

        }


        displayListing(
            data[0]
        );

        await loadListingImages();
    }


    // =====================================================
    // DISPLAY LISTING
    // =====================================================

    function displayListing(
        listing
    ) {

        const title =
            listing.title ||
            "Equipment Listing";


        const category =
            listing.category ||
            "Equipment";


        const condition =
            formatCondition(
                listing.condition
            );


        const description =
            listing.description ||
            "No description provided.";


        const location =
            [
                listing.city,
                formatProvince(listing.province)
            ]
                .filter(Boolean)
                .join(", ");


        listingTitle.textContent =
            title;


        listingSubtitle.textContent =
            category;


        listingTitleMain.textContent =
            title;


        listingCategory.textContent =
            category.toUpperCase();


        listingDescription.textContent =
            description;


        listingLocation.textContent =
            location ||
            "Location not specified";


        listingCondition.textContent =
            condition;


        listingConditionBadge.textContent =
            condition;


        listingImagePlaceholder.textContent =
            category.toUpperCase() +
            " EQUIPMENT";


        listingPrice.textContent =
            formatPrice(
                listing.price
            );


        document.title =
            title +
            " | Atlantic Equipment Exchange";


        listingLoading.style.display =
            "none";


        listingError.style.display =
            "none";


        listingDetails.style.display =
            "block";

    }


    // =====================================================
    // FORMAT PROVINCE FOR CUSTOMER DISPLAY
    // =====================================================

    function formatProvince(province) {

        const provinceMap = {
            "nova-scotia": "Nova Scotia",
            "new-brunswick": "New Brunswick",
            "pei": "Prince Edward Island",
            "newfoundland": "Newfoundland & Labrador"
        };

        const normalizedProvince =
            String(province || "")
                .trim()
                .toLowerCase();

        return (
            provinceMap[normalizedProvince] ||
            province ||
            ""
        );
    }


    // =====================================================
    // FORMAT CONDITION FOR CUSTOMER DISPLAY
    // =====================================================

    function formatCondition(condition) {

        const conditionMap = {
            "new": "New",
            "excellent": "Used - Excellent",
            "good": "Used - Good",
            "fair": "Used - Fair",
            "parts": "For Parts"
        };

        const normalizedCondition =
            String(condition || "")
                .trim()
                .toLowerCase();

        return (
            conditionMap[normalizedCondition] ||
            condition ||
            "Condition not specified"
        );
    }

    // =====================================================
    // LOAD LISTING IMAGES
    // =====================================================

    async function loadListingImages() {

    if (!listingImageGallery) {
        return;
    }


    const {
        data: images,
        error
    } =
        await supabaseClient
            .from("equipment_images")
            .select("image_url")
            .eq(
                "listing_id",
                numericListingId
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Error loading listing images:",
            error
        );

        return;

    }


    console.log(
        "Images returned for listing:",
        numericListingId,
        images
    );


    if (
        !images ||
        images.length === 0
    ) {

        return;

    }


    /*
     * =====================================================
     * MAIN IMAGE
     * =====================================================
     */

    listingImageGallery.innerHTML = "";


    const mainImage =
        document.createElement("img");


    mainImage.src =
        images[0].image_url;


    mainImage.alt =
        "Equipment photograph";


    mainImage.className =
        "listing-gallery-image";


    mainImage.loading =
        "eager";


    listingImageGallery.appendChild(
        mainImage
    );


    /*
     * =====================================================
     * THUMBNAILS
     * =====================================================
     */

    if (
        listingPhotoThumbnails
    ) {

        listingPhotoThumbnails.innerHTML =
            "";


        images.forEach(
            function (
                image,
                index
            ) {

                const thumbnailButton =
                    document.createElement(
                        "button"
                    );


                thumbnailButton.type =
                    "button";


                thumbnailButton.className =
                    "listing-photo-thumbnail";


                if (index === 0) {

                    thumbnailButton.classList.add(
                        "active"
                    );

                }


                const thumbnailImage =
                    document.createElement(
                        "img"
                    );


                thumbnailImage.src =
                    image.image_url;


                thumbnailImage.alt =
                    "Equipment photograph " +
                    (index + 1);


                thumbnailButton.appendChild(
                    thumbnailImage
                );


                thumbnailButton.addEventListener(
                    "click",
                    function () {

                        mainImage.src =
                            image.image_url;


                        document
                            .querySelectorAll(
                                ".listing-photo-thumbnail"
                            )
                            .forEach(
                                function (
                                    button
                                ) {

                                    button.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        thumbnailButton.classList.add(
                            "active"
                        );

                    }
                );


                listingPhotoThumbnails.appendChild(
                    thumbnailButton
                );

            }
        );

    }

}

    // =====================================================
    // FORMAT PRICE
    // =====================================================

    function formatPrice(
        price
    ) {

        if (
            price === null ||
            price === undefined ||
            price === ""
        ) {

            return "Price on request";

        }


        const numericPrice =
            Number(price);


        if (
            Number.isNaN(
                numericPrice
            )
        ) {

            return "Price on request";

        }


        return new Intl.NumberFormat(
            "en-CA",
            {
                style: "currency",
                currency: "CAD",
                maximumFractionDigits: 0
            }
        ).format(
            numericPrice
        );

    }

    // =====================================================
    // SUBMIT BUYER ENQUIRY
    // =====================================================

    async function submitEnquiry() {

        if (!listingEnquiryForm) {
            return;
        }


        const buyerName =
            enquiryName.value.trim();

        const buyerEmail =
            enquiryEmail.value.trim();

        const buyerPhone =
            enquiryPhone.value.trim();

        const buyerMessage =
            enquiryMessage.value.trim();

    
        // -------------------------------------------------
        // Basic client-side validation
        // -------------------------------------------------

        if (!buyerName) {

            enquiryError.textContent =
                "Please enter your name.";

            enquiryError.style.display =
                "block";

            return;
        }


        if (!buyerEmail) {

            enquiryError.textContent =
                "Please enter your email address.";

            enquiryError.style.display =
                "block";

            return;
        }


        if (!enquiryEmail.checkValidity()) {

            enquiryError.textContent =
                "Please enter a valid email address.";

            enquiryError.style.display =
                "block";

            return;
        }


        if (!buyerMessage) {

            enquiryError.textContent =
                "Please enter a message.";

            enquiryError.style.display =
                "block";

            return;
        }


        // -------------------------------------------------
        // Clear previous messages
        // -------------------------------------------------

        enquirySuccess.style.display =
            "none";

        enquiryError.style.display =
            "none";


        // -------------------------------------------------
        // Disable submit button
        // -------------------------------------------------

        enquirySubmitButton.disabled =
            true;

        enquirySubmitButton.textContent =
            "Sending...";


        // -------------------------------------------------
        // Submit through secure Supabase RPC
        // -------------------------------------------------

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "submit_equipment_enquiry",
                {
                    p_listing_id:
                        numericListingId,

                    p_buyer_name:
                        buyerName,

                    p_buyer_email:
                        buyerEmail,

                    p_buyer_phone:
                        buyerPhone || null,

                    p_message:
                        buyerMessage
                }
            );


        if (error) {

            console.error(
                "Equipment enquiry submission error:",
                error
            );


            enquiryError.textContent =
                "We were unable to send your enquiry. Please try again.";

            enquiryError.style.display =
                "block";


            enquirySubmitButton.disabled =
                false;

            enquirySubmitButton.textContent =
                "Send Enquiry";

            return;
        }


        console.log(
            "Equipment enquiry submitted:",
            data
        );


        // -------------------------------------------------
        // Success
        // -------------------------------------------------

        enquirySuccess.textContent =
            "Thank you. Your enquiry has been sent successfully. We will follow up with you.";

        enquirySuccess.style.display =
            "block";


        enquiryFormReset();


        enquirySubmitButton.disabled =
            false;

        enquirySubmitButton.textContent =
            "Send Enquiry";
    }

    function enquiryFormReset() {

        enquiryName.value =
            "";

        enquiryEmail.value =
            "";

        enquiryPhone.value =
            "";

        enquiryMessage.value =
            "I'm interested in this equipment and would like more information.";
    }
    
    // =====================================================
    // SHOW ERROR
    // =====================================================

    function showError(
        message
    ) {

        listingLoading.style.display =
            "none";


        listingDetails.style.display =
            "none";


        listingError.style.display =
            "block";


        listingErrorText.textContent =
            message;

    }


    // =====================================================
    // ENQUIRY FORM EVENT
    // =====================================================

    if (listingEnquiryForm) {

        listingEnquiryForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                await submitEnquiry();

            }
        );
    }
    
    // =====================================================
    // START
    // =====================================================

    await loadListing();

    

});
