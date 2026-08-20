document.addEventListener("DOMContentLoaded", function () {

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

    const listings =
        Array.from(
            document.querySelectorAll(".listing-card")
        );


    // =====================================================
    // FILTER LISTINGS
    // =====================================================

    function filterListings() {

        const searchTerm =
            searchInput.value.trim().toLowerCase();

        const selectedCategory =
            categoryFilter.value.toLowerCase();

        const selectedLocation =
            locationFilter.value.toLowerCase();

        let visibleCount = 0;


        listings.forEach(function (listing) {

            const listingText =
                listing.textContent.toLowerCase();

            const listingCategory =
                listing.dataset.category.toLowerCase();

            const listingLocation =
                listing.dataset.location.toLowerCase();


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
    // GET PRICE
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


        return parseFloat(numericPrice) || 0;

    }


    // =====================================================
    // SORT LISTINGS
    // =====================================================

    function sortListingCards() {

        const sortValue =
            sortListings.value;


        let sortedListings =
            [...listings];


        if (sortValue === "price-low") {

            sortedListings.sort(
                function (a, b) {

                    return getPrice(a) - getPrice(b);

                }
            );

        }


        else if (sortValue === "price-high") {

            sortedListings.sort(
                function (a, b) {

                    return getPrice(b) - getPrice(a);

                }
            );

        }


        sortedListings.forEach(
            function (listing) {

                listingGrid.appendChild(listing);

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

    clearFiltersButton.style.display = "none";

    filterListings();

});
