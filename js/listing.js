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
    // START
    // =====================================================

    await loadListing();

    

});
