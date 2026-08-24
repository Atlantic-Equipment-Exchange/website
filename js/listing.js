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
            listing.condition ||
            "Condition not specified";


        const description =
            listing.description ||
            "No description provided.";


        const location =
            [
                listing.city,
                listing.province
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


        listingImageGallery.innerHTML = "";


        images.forEach(function (image) {

            const imageElement =
                document.createElement("img");


            imageElement.src =
                image.image_url;


            imageElement.alt =
                "Equipment photograph";


            imageElement.loading =
                "lazy";


            imageElement.className =
                "listing-gallery-image";


            listingImageGallery.appendChild(
                imageElement
            );

        });

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
