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
        document.getElementById("equipment-search");

    const categoryFilter =
        document.getElementById("category-filter");

    const locationFilter =
        document.getElementById("location-filter");

    const sortListings =
        document.getElementById("sort-listings");

    const clearFiltersButton =
        document.getElementById("clear-filters");

    const listingGrid =
        document.querySelector(".listing-grid");

    const listingHeader =
        document.querySelector(".listing-header p");


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


        const { data, error } =
            await supabaseClient.rpc(
                "get_published_equipment"
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


        listings = data || [];


        renderListings();

    }


    // =====================================================
    // RENDER LISTINGS
    // =====================================================

    function renderListings() {

        listingGrid.innerHTML = "";


        if (listings.length === 0) {

            updateListingCount(0);

            showNoResultsMessage(0);

            return;

        }


        listings.forEach(function (listing) {

            const card =
                createListingCard(listing);

            listingGrid.appendChild(card);

        });


        updateListingCount(listings.length);

        filterListings();

    }


    // =====================================================
    // CREATE LISTING CARD
    // =====================================================

    function createListingCard(listing) {

        const card =
            document.createElement("article");


        card.className =
            "listing-card";


        card.dataset.category =
            (listing.category || "").toLowerCase();


        card.dataset.location =
            (listing.city || "").toLowerCase();


        // =================================================
        // LISTING IMAGE
        // =================================================

        const imageContainer =
            document.createElement("div");

        imageContainer.className =
            "listing-image";


        const placeholderImage =
            document.createElement("div");

        placeholderImage.className =
            "placeholder-image";

        placeholderImage.textContent =
            (listing.category || "EQUIPMENT")
                .toUpperCase() +
            " EQUIPMENT";


        const badge =
            document.createElement("span");

        badge.className =
            "listing-badge";

        badge.textContent =
            listing.condition || "Used";


        imageContainer.appendChild(
            placeholderImage
        );

        imageContainer.appendChild(
            badge
        );


        // =================================================
        // LISTING CONTENT
        // =================================================

        const content =
            document.createElement("div");

        content.className =
            "listing-content";


        // CATEGORY

        const category =
            document.createElement("p");

        category.className =
            "listing-category";

        category.textContent =
            (
                listing.category ||
                "Equipment"
            ).toUpperCase();


        // TITLE

        const title =
            document.createElement("h2");

        title.textContent =
            listing.title ||
            "Untitled Equipment";


        // DESCRIPTION

        const description =
            document.createElement("p");

        description.className =
            "listing-description";

        description.textContent =
            listing.description ||
            "No description provided.";


        // =================================================
        // LISTING DETAILS
        // =================================================

        const details =
            document.createElement("div");

        details.className =
            "listing-details";


        const location =
            document.createElement("span");

        location.textContent =
            [listing.city, listing.province]
                .filter(Boolean)
                .join(", ");


        const condition =
            document.createElement("span");

        condition.textContent =
            listing.condition ||
            "Condition not specified";


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
            document.createElement("div");

        footer.className =
            "listing-footer";


        const price =
            document.createElement("strong");

        price.textContent =
            formatPrice(listing.price);


        const viewLink =
            document.createElement("a");

        viewLink.href =
            "#";

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
            Number.isNaN(numericPrice)
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
        ).format(numericPrice);

    }


    // =====================================================
    // FILTER LISTINGS
    // =====================================================

    function filterListings() {

        const searchTerm =
            searchInput.value
                .trim()
                .toLowerCase();


        const selectedCategory =
            categoryFilter.value
                .toLowerCase();


        const selectedLocation =
            locationFilter.value
                .toLowerCase();


        let visibleCount = 0;


        const listingCards =
            Array.from(
                document.querySelectorAll(
                    ".listing-card"
                )
            );


        listingCards.forEach(function (listing) {

            const listingText =
                listing.textContent.toLowerCase();


            const listingCategory =
                (
                    listing.dataset.category || ""
                ).toLowerCase();


            const listingLocation =
                (
                    listing.dataset.location || ""
                ).toLowerCase();


            const matchesSearch =
                searchTerm === "" ||
                listingText.includes(searchTerm);


            const matchesCategory =
                selectedCategory === "all" ||
                listingCategory === selectedCategory;


            const matchesLocation =
                selectedLocation === "all" ||
                listingLocation === selectedLocation;


            const matches =
                matchesSearch &&
                matchesCategory &&
                matchesLocation;


            if (matches) {

                listing.style.display = "";

                visibleCount++;

            } else {

                listing.style.display = "none";

            }

        });


        updateListingCount(visibleCount);

        updateClearButton();

        showNoResultsMessage(visibleCount);

    }


    // =====================================================
    // UPDATE LISTING COUNT
    // =====================================================

    function updateListingCount(count) {

        if (!listingHeader) {
            return;
        }


        if (count === 1) {

            listingHeader.innerHTML =
                "<strong>1</strong> equipment listing";

        } else {

            listingHeader.innerHTML =
                "<strong>" +
                count +
                "</strong> equipment listings";

        }

    }


    // =====================================================
    // SHOW / HIDE CLEAR FILTERS BUTTON
    // =====================================================

    function updateClearButton() {

        if (!clearFiltersButton) {
            return;
        }


        const hasSearch =
            searchInput.value.trim() !== "";


        const hasCategory =
            categoryFilter.value !== "all";


        const hasLocation =
            locationFilter.value !== "all";


        if (
            hasSearch ||
            hasCategory ||
            hasLocation
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

        searchInput.value = "";

        categoryFilter.value = "all";

        locationFilter.value = "all";

        filterListings();

    }


    // =====================================================
    // NO RESULTS MESSAGE
    // =====================================================

    function showNoResultsMessage(count) {

        let message =
            document.getElementById(
                "no-results-message"
            );


        if (!message) {

            message =
                document.createElement("div");

            message.id =
                "no-results-message";

            message.className =
                "no-results-message";

            message.innerHTML = `
                <h2>No equipment found</h2>

                <p>
                    We couldn't find equipment matching
                    your search criteria.
                </p>
            `;

            listingGrid.after(message);

        }


        if (count === 0) {

            message.style.display = "block";

        } else {

            message.style.display = "none";

        }

    }


    // =====================================================
    // GET PRICE FROM CARD
    // =====================================================

    function getPrice(listing) {

        const priceElement =
            listing.querySelector(
                ".listing-footer strong"
            );


        if (!priceElement) {
            return 0;
        }


        const priceText =
            priceElement.textContent;


        const numericPrice =
            priceText.replace(
                /[^0-9.]/g,
                ""
            );


        return parseFloat(
            numericPrice
        ) || 0;

    }


    // =====================================================
    // SORT LISTINGS
    // =====================================================

    function sortListingCards() {

        const sortValue =
            sortListings.value;


        const listingCards =
            Array.from(
                document.querySelectorAll(
                    ".listing-card"
                )
            );


        let sortedListings =
            [...listingCards];


        if (sortValue === "price-low") {

            sortedListings.sort(
                function (a, b) {

                    return (
                        getPrice(a) -
                        getPrice(b)
                    );

                }
            );

        }


        else if (sortValue === "price-high") {

            sortedListings.sort(
                function (a, b) {

                    return (
                        getPrice(b) -
                        getPrice(a)
                    );

                }
            );

        }


        sortedListings.forEach(
            function (listing) {

                listingGrid.appendChild(
                    listing
                );

            }
        );


        filterListings();

    }


    // =====================================================
    // EVENT LISTENERS
    // =====================================================

    searchInput.addEventListener(
        "input",
        filterListings
    );


    categoryFilter.addEventListener(
        "change",
        filterListings
    );


    locationFilter.addEventListener(
        "change",
        filterListings
    );


    sortListings.addEventListener(
        "change",
        sortListingCards
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
