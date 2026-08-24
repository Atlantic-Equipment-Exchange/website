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
            // GET EQUIPMENT PHOTOS
            // =============================================

            const imageInput =
                document.getElementById(
                    "equipment-images"
                );


            const selectedImages =
                imageInput
                    ? Array.from(imageInput.files)
                    : [];


            // =============================================
            // VALIDATE EQUIPMENT PHOTOS
            // =============================================

            const maximumPhotos = 5;

            const maximumImageSize =
                5 * 1024 * 1024;

            const allowedImageTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            if (
                selectedImages.length >
                maximumPhotos
            ) {

                alert(
                    "Please select no more than 5 photos."
                );


                submitButton.disabled = false;

                submitButton.textContent =
                    originalButtonText;

                return;

            }


            for (
                const image of selectedImages
            ) {

                if (
                    !allowedImageTypes.includes(
                        image.type
                    )
                ) {

                    alert(
                        "Only JPG, PNG and WEBP images are allowed."
                    );


                    submitButton.disabled = false;

                    submitButton.textContent =
                        originalButtonText;

                    return;

                }


                if (
                    image.size >
                    maximumImageSize
                ) {

                    alert(
                        "Each photo must be 5 MB or smaller."
                    );


                    submitButton.disabled = false;

                    submitButton.textContent =
                        originalButtonText;

                    return;

                }

            }


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
            // CREATE DATABASE LISTING
            // =============================================

            const {
                data: listingId,
                error
            } =
                await supabaseClient.rpc(
                    "submit_equipment_listing",
                    {
                        p_title:
                            title,

                        p_category:
                            category,

                        p_condition:
                            condition,

                        p_description:
                            description,

                        p_price:
                            price,

                        p_province:
                            province,

                        p_city:
                            city,

                        p_seller_name:
                            sellerName,

                        p_seller_company:
                            sellerCompany ||
                            null,

                        p_seller_email:
                            sellerEmail,

                        p_seller_phone:
                            sellerPhone ||
                            null
                    }
                );


            // =============================================
            // HANDLE LISTING CREATION ERROR
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


            console.log(
                "Listing submitted successfully:",
                listingId
            );


            // =============================================
            // UPLOAD EQUIPMENT PHOTOS
            // =============================================

            let photosUploadedSuccessfully =
                true;


            if (
                selectedImages.length > 0
            ) {

                for (
                    let i = 0;
                    i < selectedImages.length;
                    i++
                ) {

                    const image =
                        selectedImages[i];


                    // -------------------------------------
                    // CREATE UNIQUE FILE NAME
                    // -------------------------------------

                    const fileExtension =
                        image.name
                            .split(".")
                            .pop()
                            .toLowerCase();


                    const fileName =
                        "photo-" +
                        (i + 1) +
                        "-" +
                        Date.now() +
                        "." +
                        fileExtension;


                    const filePath =
                        "listing-" +
                        listingId +
                        "/" +
                        fileName;


                    // -------------------------------------
                    // UPLOAD IMAGE
                    // -------------------------------------

                    const {
                        error: uploadError
                    } =
                        await supabaseClient
                            .storage
                            .from(
                                "equipment-images"
                            )
                            .upload(
                                filePath,
                                image,
                                {
                                    cacheControl:
                                        "3600",

                                    upsert:
                                        false
                                }
                            );


                    if (
                        uploadError
                    ) {

                        console.error(
                            "Image upload error:",
                            uploadError
                        );


                        photosUploadedSuccessfully =
                            false;


                        break;

                    }


                    // -------------------------------------
                    // GET PUBLIC IMAGE URL
                    // -------------------------------------

                    const {
                        data:
                            publicUrlData
                    } =
                        supabaseClient
                            .storage
                            .from(
                                "equipment-images"
                            )
                            .getPublicUrl(
                                filePath
                            );


                    const imageUrl =
                        publicUrlData.publicUrl;


                    // -------------------------------------
                    // SAVE IMAGE RECORD
                    // -------------------------------------

                    const {
                        error:
                            imageRecordError
                    } =
                        await supabaseClient
                            .from(
                                "equipment_images"
                            )
                            .insert({
                                listing_id:
                                    listingId,

                                image_url:
                                    imageUrl
                            });


                    if (
                        imageRecordError
                    ) {

                        console.error(
                            "Image record error:",
                            imageRecordError
                        );


                        photosUploadedSuccessfully =
                            false;


                        break;

                    }

                }

            }


            // =============================================
            // HANDLE PHOTO FAILURE
            // =============================================

            if (
                !photosUploadedSuccessfully
            ) {

                alert(
                    "Your equipment listing was created, " +
                    "but one or more photographs could not be uploaded. " +
                    "Please contact Atlantic Equipment Exchange " +
                    "before submitting the listing again."
                );


                equipmentForm.reset();

                submitButton.disabled = false;

                submitButton.textContent =
                    originalButtonText;

                return;

            }


            // =============================================
            // COMPLETE SUCCESS
            // =============================================

            console.log(
                "Listing and photographs submitted successfully:",
                listingId
            );


            alert(
                "Thank you! Your equipment listing has been submitted for review."
            );


            // =============================================
            // CLEAR FORM
            // =============================================

            equipmentForm.reset();


            submitButton.disabled = false;

            submitButton.textContent =
                originalButtonText;

        }
    );

});
