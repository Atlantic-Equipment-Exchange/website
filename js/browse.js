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

    const searchInput =
        document.getElementById(
            "equipment-search"
        );

    const categoryFilter =
        document.getElementById(
            "category-filter"
        );

    const locationFilter =
        document.getElementById(
            "location-filter"
        );

    const sortListings =
        document.getElementById(
            "sort-listings"
        );

    const clearFiltersButton =
        document.getElementById(
            "clear-filters"
        );

    const listingGrid =
        document.querySelector(
            ".listing-grid"
        );

    const listingCount =
        document.getElementById(
            "listing-count"
        );


    // =====================================================
    // STORE DATABASE LISTINGS
    // =====================================================

    let listings = [];


    // =====================================================
    // LOAD PUBLISHED LISTINGS FROM SUPABASE
    // =====================================================

    async function loadListings() {

        listingGrid.innerHTML = `
            <div class="loading-message">
                <p>Loading equipment listings...</p>
            </div>
        `;


        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "get_published_equipment_with_images"
            );


        if (error) {

            console.error(
                "Error loading equipment listings:",
                error
            );


            listingGrid.innerHTML = `
                <div class="no-results-message">

                    <h2>Unable to load listings</h2>

                    <p>
                        We are currently unable to retrieve
                        equipment listings. Please try again later.
                    </p>

                </div>
            `;

            updateListingCount(0);

            return;
        }


        listings =
            Array.isArray(data)
                ? data
                : [];


        renderListings();
    }


    // =====================================================
    // RENDER LISTINGS
    // =====================================================

    function renderListings() {

        const filteredListings =
            getFilteredListings();


        const sortedListings =
            sortListingsData(
                filteredListings
            );


        listingGrid.innerHTML = "";


        if (sortedListings.length === 0) {

            updateListingCount(0);

            showNoResultsMessage();

            return;
        }


        hideNoResultsMessage();


        sortedListings.forEach(
            function (listing) {

                const card =
                    createListingCard(
                        listing
                    );

                listingGrid.appendChild(
                    card
                );
            }
        );


        updateListingCount(
            sortedListings.length
        );


        updateClearButton();
    }


    // =====================================================
    // CREATE LISTING CARD
    // =====================================================

    function createListingCard(listing) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "listing-card";


        // =================================================
        // LISTING IMAGE
        // =================================================

        const imageContainer =
            document.createElement(
                "div"
            );


        imageContainer.className =
            "listing-image";


        if (listing.image_url) {

            const listingImage =
                document.createElement(
                    "img"
                );


            listingImage.src =
                listing.image_url;


            listingImage.alt =
                listing.title ||
                "Equipment photograph";


            listingImage.loading =
                "lazy";


            listingImage.className =
                "listing-card-image";


            imageContainer.appendChild(
                listingImage
            );

        } else {

            const placeholderImage =
                document.createElement(
                    "div"
                );


            placeholderImage.className =
                "placeholder-image";


            placeholderImage.textContent =
                (
                    listing.category ||
                    "EQUIPMENT"
                ).toUpperCase() +
                " EQUIPMENT";


            imageContainer.appendChild(
                placeholderImage
            );
        }


        const badge =
            document.createElement(
                "span"
            );


        badge.className =
            "listing-badge";


        badge.textContent =
            formatCondition(
                listing.condition
            );


        imageContainer.appendChild(
            badge
        );


        // =================================================
        // LISTING CONTENT
        // =================================================

        const content =
            document.createElement(
                "div"
            );


        content.className =
            "listing-content";


        // =================================================
        // CATEGORY
        // =================================================

        const category =
            document.createElement(
                "p"
            );


        category.className =
            "listing-category";


        category.textContent =
            (
                listing.category ||
                "Equipment"
            ).toUpperCase();


        // =================================================
        // TITLE
        // =================================================

        const title =
            document.createElement(
                "h2"
            );


        title.textContent =
            listing.title ||
            "Untitled Equipment";


        // =================================================
        // DESCRIPTION
        // =================================================

        const description =
            document.createElement(
                "p"
            );


        description.className =
            "listing-description";


        description.textContent =
            listing.description ||
            "No description provided.";


        // =================================================
        // LISTING DETAILS
        // =================================================

        const details =
            document.createElement(
                "div"
            );


        details.className =
            "listing-details";


        const location =
            document.createElement(
                "span"
            );


        location.textContent =
            [
                listing.city,
                formatProvince(
                    listing.province
                )
            ]
                .filter(Boolean)
                .join(", ");


        const condition =
            document.createElement(
                "span"
            );


        condition.textContent =
            formatCondition(
                listing.condition
            );


        details.appendChild(
            location
        );


        details.appendChild(
            condition
        );


        // =================================================
        // LISTING FOOTER
        // =================================================

        const footer =
            document.createElement(
                "div"
            );


        footer.className =
            "listing-footer";


        const price =
            document.createElement(
                "strong"
            );


        price.textContent =
            formatPrice(
                listing.price
            );


        const viewLink =
            document.createElement(
                "a"
            );


        viewLink.href =
            "listing.html?id=" +
            encodeURIComponent(
                listing.id
            );


        viewLink.textContent =
            "View";


        footer.appendChild(
            price
        );


        footer.appendChild(
            viewLink
        );


        // =================================================
        // ASSEMBLE CARD
        // =================================================

        content.appendChild(
            category
        );


        content.appendChild(
            title
        );


        content.appendChild(
            description
        );


        content.appendChild(
            details
        );


        content.appendChild(
            footer
        );


        card.appendChild(
            imageContainer
        );


        card.appendChild(
            content
        );


        return card;
    }


    // =====================================================
    // FORMAT PRICE
    // =====================================================

    function formatPrice(price) {

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
    // FORMAT PROVINCE FOR CUSTOMER DISPLAY
    // =====================================================

    function formatProvince(province) {

        const provinceMap = {
            "nova-scotia":
                "Nova Scotia",

            "new-brunswick":
                "New Brunswick",

            "pei":
                "Prince Edward Island",

            "newfoundland":
                "Newfoundland & Labrador"
        };


        const normalizedProvince =
            String(
                province || ""
            )
                .trim()
                .toLowerCase();


        return (
            provinceMap[
                normalizedProvince
            ] ||
            province ||
            ""
        );
    }


    // =====================================================
    // FORMAT CONDITION FOR CUSTOMER DISPLAY
    // =====================================================

    function formatCondition(condition) {

        const conditionMap = {
            "new":
                "New",

            "excellent":
                "Used - Excellent",

            "good":
                "Used - Good",

            "fair":
                "Used - Fair",

            "parts":
                "For Parts"
        };


        const normalizedCondition =
            String(
                condition || ""
            )
                .trim()
                .toLowerCase();


        return (
            conditionMap[
                normalizedCondition
            ] ||
            condition ||
            "Condition not specified"
        );
    }


    // =====================================================
    // GET FILTERED LISTINGS
    // =====================================================

    function getFilteredListings() {

        const searchTerm =
            searchInput.value
                .trim()
                .toLowerCase();


        const selectedCategory =
            categoryFilter.value
                .trim()
                .toLowerCase();


        const selectedLocation =
            locationFilter.value
                .trim()
                .toLowerCase();


        return listings.filter(
            function (listing) {

                const title =
                    String(
                        listing.title || ""
                    ).toLowerCase();


                const category =
                    String(
                        listing.category || ""
                    ).toLowerCase();


                const description =
                    String(
                        listing.description || ""
                    ).toLowerCase();


                const city =
                    String(
                        listing.city || ""
                    ).toLowerCase();


                const province =
                    String(
                        listing.province || ""
                    ).toLowerCase();


                const condition =
                    String(
                        listing.condition || ""
                    ).toLowerCase();


                const searchableText =
                    [
                        title,
                        category,
                        description,
                        city,
                        province,
                        condition
                    ]
                        .join(" ");


                const matchesSearch =
                    searchTerm === "" ||
                    searchableText.includes(
                        searchTerm
                    );


                const matchesCategory =
                    selectedCategory === "all" ||
                    category === selectedCategory;


                const matchesLocation =
                    selectedLocation === "all" ||
                    province === selectedLocation;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesLocation
                );
            }
        );
    }


    // =====================================================
    // SORT LISTINGS
    // =====================================================

    function sortListingsData(
        filteredListings
    ) {

        const sortValue =
            sortListings.value;


        const sorted =
            [...filteredListings];


        if (
            sortValue === "newest"
        ) {

            sorted.sort(
                function (a, b) {

                    return (
                        new Date(
                            b.created_at
                        ) -
                        new Date(
                            a.created_at
                        )
                    );
                }
            );

        }


        else if (
            sortValue === "price-low"
        ) {

            sorted.sort(
                function (a, b) {

                    const aHasPrice =
                        a.price !== null &&
                        a.price !== undefined &&
                        a.price !== "" &&
                        !Number.isNaN(
                            Number(a.price)
                        );


                    const bHasPrice =
                        b.price !== null &&
                        b.price !== undefined &&
                        b.price !== "" &&
                        !Number.isNaN(
                            Number(b.price)
                        );


                    // Listings without a price
                    // go to the bottom.
                    if (
                        !aHasPrice &&
                        !bHasPrice
                    ) {
                        return 0;
                    }


                    if (!aHasPrice) {
                        return 1;
                    }


                    if (!bHasPrice) {
                        return -1;
                    }


                    return (
                        Number(a.price) -
                        Number(b.price)
                    );
                }
            );

        }


        else if (
            sortValue === "price-high"
        ) {

            sorted.sort(
                function (a, b) {

                    const aHasPrice =
                        a.price !== null &&
                        a.price !== undefined &&
                        a.price !== "" &&
                        !Number.isNaN(
                            Number(a.price)
                        );


                    const bHasPrice =
                        b.price !== null &&
                        b.price !== undefined &&
                        b.price !== "" &&
                        !Number.isNaN(
                            Number(b.price)
                        );


                    // Listings without a price
                    // go to the bottom.
                    if (
                        !aHasPrice &&
                        !bHasPrice
                    ) {
                        return 0;
                    }


                    if (!aHasPrice) {
                        return 1;
                    }


                    if (!bHasPrice) {
                        return -1;
                    }


                    return (
                        Number(b.price) -
                        Number(a.price)
                    );
                }
            );
        }


        return sorted;
    }


    // =====================================================
    // UPDATE LISTING COUNT
    // =====================================================

    function updateListingCount(
        count
    ) {

        if (!listingCount) {
            return;
        }


        listingCount.textContent =
            count;
    }


    // =====================================================
    // SHOW / HIDE CLEAR FILTERS BUTTON
    // =====================================================

    function updateClearButton() {

        if (!clearFiltersButton) {
            return;
        }


        const hasSearch =
            searchInput.value
                .trim() !== "";


        const hasCategory =
            categoryFilter.value !== "all";


        const hasLocation =
            locationFilter.value !== "all";


        const hasSort =
            sortListings.value !== "newest";


        if (
            hasSearch ||
            hasCategory ||
            hasLocation ||
            hasSort
        ) {

            clearFiltersButton.style.display =
                "inline-block";

        } else {

            clearFiltersButton.style.display =
                "none";
        }
    }


    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    function clearFilters() {

        searchInput.value =
            "";

        categoryFilter.value =
            "all";

        locationFilter.value =
            "all";

        sortListings.value =
            "newest";


        renderListings();
    }


    // =====================================================
    // NO RESULTS MESSAGE
    // =====================================================

    function showNoResultsMessage() {

        let message =
            document.getElementById(
                "no-results-message"
            );


        if (!message) {

            message =
                document.createElement(
                    "div"
                );


            message.id =
                "no-results-message";


            message.className =
                "no-results-message";


            message.innerHTML = `
                <h2>
                    No equipment found
                </h2>

                <p>
                    We couldn't find equipment
                    matching your search criteria.
                </p>
            `;


            listingGrid.after(
                message
            );
        }


        message.style.display =
            "block";
    }


    // =====================================================
    // HIDE NO RESULTS MESSAGE
    // =====================================================

    function hideNoResultsMessage() {

        const message =
            document.getElementById(
                "no-results-message"
            );


        if (message) {

            message.style.display =
                "none";
        }
    }


    // =====================================================
    // EVENT LISTENERS
    // =====================================================

    searchInput.addEventListener(
        "input",
        renderListings
    );


    categoryFilter.addEventListener(
        "change",
        renderListings
    );


    locationFilter.addEventListener(
        "change",
        renderListings
    );


    sortListings.addEventListener(
        "change",
        renderListings
    );


    clearFiltersButton.addEventListener(
        "click",
        clearFilters
    );


    // =====================================================
    // INITIAL STATE
    // =====================================================

    clearFiltersButton.style.display =
        "none";


    // =====================================================
    // LOAD DATABASE LISTINGS
    // =====================================================

    await loadListings();

});
