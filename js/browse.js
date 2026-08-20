// =========================================================
// ATLANTIC EQUIPMENT EXCHANGE
// BROWSE PAGE FILTERING
// =========================================================


document.addEventListener("DOMContentLoaded", function () {


    // =====================================================
    // GET HTML ELEMENTS
    // =====================================================

    const searchInput =
        document.getElementById("equipment-search");

    const categoryFilter =
        document.getElementById("category-filter");

    const locationFilter =
        document.getElementById("location-filter");

    const sortListings =
        document.getElementById("sort-listings");

    const listingGrid =
        document.querySelector(".listing-grid");

    const listingHeader =
        document.querySelector(".listing-header p");


    // =====================================================
    // GET ALL LISTINGS
    // =====================================================

    const listings =
        Array.from(
            document.querySelectorAll(".listing-card")
        );


    // =====================================================
    // FILTER FUNCTION
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


        let visibleListings = [];


        // =================================================
        // CHECK EACH LISTING
        // =================================================

        listings.forEach(function (listing) {


            const listingText =
                listing.textContent
                    .toLowerCase();


            const listingCategory =
                listing.dataset.category
                    .toLowerCase();


            const listingLocation =
                listing.dataset.location
                    .toLowerCase();


            // =============================================
            // SEARCH MATCH
            // =============================================

            const matchesSearch =
                searchTerm === "" ||
                listingText.includes(searchTerm);


            // =============================================
            // CATEGORY MATCH
            // =============================================

            const matchesCategory =
                selectedCategory === "all" ||
                listingCategory === selectedCategory;


            // =============================================
            // LOCATION MATCH
            // =============================================

            const matchesLocation =
                selectedLocation === "all" ||
                listingLocation === selectedLocation;


            // =============================================
            // FINAL MATCH
            // =============================================

            const matches =
                matchesSearch &&
                matchesCategory &&
                matchesLocation;


            if (matches) {

                listing.style.display = "";

                visibleListings.push(listing);

            } else {

                listing.style.display = "none";

            }

        });


        // =================================================
        // UPDATE LISTING COUNT
        // =================================================

        updateListingCount(
            visibleListings.length
        );


        // =================================================
        // SHOW "NO RESULTS" MESSAGE
        // =================================================

        showNoResultsMessage(
            visibleListings.length
        );

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
    // NO RESULTS MESSAGE
    // =====================================================

    function showNoResultsMessage(count) {


        let message =
            document.getElementById(
                "no-results-message"
            );


        // ================================================
        // CREATE MESSAGE IF IT DOES NOT EXIST
        // ================================================

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

                <button type="button"
                        id="clear-filters">

                    Clear Filters

                </button>
            `;


            listingGrid.after(message);


            // ============================================
            // CLEAR FILTER BUTTON
            // ============================================

            document
                .getElementById("clear-filters")
                .addEventListener(
                    "click",
                    clearFilters
                );

        }


        // ================================================
        // DISPLAY / HIDE MESSAGE
        // ================================================

        if (count === 0) {

            message.style.display =
                "block";

        } else {

            message.style.display =
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
    // SORT LISTINGS
    // =====================================================

    function sortListingCards() {


        const sortValue =
            sortListings.value;


        let sortedListings =
            [...listings];


        // ================================================
        // NEWEST
        // ================================================

        if (sortValue === "newest") {

            // For now, preserve the original order.

            sortedListings =
                [...listings];

        }


        // ================================================
        // PRICE LOW → HIGH
        // ================================================

        else if (sortValue === "price-low") {

            sortedListings.sort(
                function (a, b) {

                    return (
                        getPrice(a) -
                        getPrice(b)
                    );

                }
            );

        }


        // ================================================
        // PRICE HIGH → LOW
        // ================================================

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


        // ================================================
        // REBUILD GRID
        // ================================================

        sortedListings.forEach(
            function (listing) {

                listingGrid.appendChild(
                    listing
                );

            }
        );


        // Reapply filters after sorting.

        filterListings();

    }


    // =====================================================
    // EXTRACT PRICE
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


        return (
            parseFloat(numericPrice) || 0
        );

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


    // =====================================================
    // INITIAL FILTER
    // =====================================================

    filterListings();

});
