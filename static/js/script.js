const promptInput = document.getElementById("prompt");
const charCount = document.getElementById("char-count");
const generateBtn = document.getElementById("generate-btn");

const previewPlaceholder =
    document.getElementById("preview-placeholder");

const loadingContainer =
    document.getElementById("loading-container");

const generatedResult =
    document.getElementById("generated-result");

const generatedImage =
    document.getElementById("generated-image");

const downloadBtn =
    document.getElementById("download-btn");

const messageBox =
    document.getElementById("message-box");


// ==========================================
// Character Counter
// ==========================================

promptInput.addEventListener("input", () => {

    if (promptInput.value.length > 500) {
        promptInput.value =
            promptInput.value.substring(0, 500);
    }

    charCount.textContent =
        `${promptInput.value.length} / 500`;

    // Hide previous error when user starts typing
    hideMessage();
});


// ==========================================
// Show Message
// ==========================================

function showMessage(message, type) {

    messageBox.textContent = message;

    messageBox.className =
        `message-box ${type}`;
}


// ==========================================
// Hide Message
// ==========================================

function hideMessage() {

    messageBox.textContent = "";

    messageBox.className = "message-box";
}


// ==========================================
// Generate Image
// ==========================================

generateBtn.addEventListener("click", async () => {

    const prompt = promptInput.value.trim();

    hideMessage();


    // Validate prompt
    if (!prompt) {

        showMessage(
            "Please enter a description before generating an image.",
            "error"
        );

        promptInput.focus();

        return;
    }


    // --------------------------
    // Start Loading State
    // --------------------------

    generateBtn.disabled = true;

    generateBtn.textContent =
        "✦ Generating...";


    previewPlaceholder.style.display =
        "none";

    generatedResult.style.display =
        "none";

    loadingContainer.style.display =
        "block";


    try {

        const response = await fetch("/generate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                prompt: prompt
            })

        });


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Image generation failed."
            );

        }


        // --------------------------
        // Display Generated Image
        // --------------------------

        generatedImage.src =
            data.image_url +
            "?t=" +
            new Date().getTime();


        // Wait until image fully loads
        generatedImage.onload = () => {

            loadingContainer.style.display =
                "none";

            generatedResult.style.display =
                "block";

        };


        // Store download information
        downloadBtn.dataset.imageUrl =
            data.image_url;

        downloadBtn.dataset.filename =
            data.filename;


        showMessage(
            "✨ Your image was generated successfully!",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Generation Error:",
            error
        );


        loadingContainer.style.display =
            "none";

        previewPlaceholder.style.display =
            "block";


        showMessage(
            error.message ||
            "Something went wrong. Please try again.",
            "error"
        );

    }

    finally {

        generateBtn.disabled =
            false;

        generateBtn.textContent =
            "✦ Generate Image";

    }

});


// ==========================================
// Download Generated Image
// ==========================================

downloadBtn.addEventListener("click", () => {

    const imageUrl =
        downloadBtn.dataset.imageUrl;

    const filename =
        downloadBtn.dataset.filename ||
        "ai-generated-image.png";


    if (!imageUrl) {

        showMessage(
            "No image is available to download.",
            "error"
        );

        return;
    }


    const link =
        document.createElement("a");


    link.href =
        imageUrl;

    link.download =
        filename;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

});