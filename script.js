document.addEventListener('DOMContentLoaded', function() {
    const imageGrid = document.getElementById('imageGrid');
    const rankingList = document.getElementById('rankingList');
    const resetBtn = document.getElementById('resetBtn');
    const submitBtn = document.getElementById('submitBtn');
    const referenceImage = document.getElementById('reference');

    let selectedImages = [];
    let currentRank = 1;

    // Set reference image
    referenceImage.src = 'images/image1/ref.jpg';

    // Array of image names
    const imageNames = [
        '1_IGCP-v1',
        '2_VQFR',
        '3_codeformer',
        '4_DR2',
        '5_GPEN',
        '6_GFPGAN',
        '7_PULSE'
    ];

    // Function to load images
    function loadImages() {
        // Clear existing content
        imageGrid.innerHTML = '';
        rankingList.innerHTML = '';
        selectedImages = [];
        currentRank = 1;
        submitBtn.disabled = true;

        // Add the 7 generated images
        imageNames.forEach((imageName, index) => {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container';
            imageContainer.dataset.imageId = index + 1;

            const img = document.createElement('img');
            img.src = `images/image1/${imageName}.jpg`; // Updated path to include correct subfolder
            img.alt = `Generated Image ${index + 1}`;

            imageContainer.appendChild(img);
            imageGrid.appendChild(imageContainer);

            imageContainer.addEventListener('click', () => handleImageClick(imageContainer));
        });
    }

    // Handle image click
    function handleImageClick(container) {
        if (container.classList.contains('selected')) return;

        container.classList.add('selected');
        container.dataset.rank = currentRank;

        // Add to ranking list
        const rankItem = document.createElement('div');
        rankItem.className = 'rank-item';
        rankItem.innerHTML = `
            <span>${currentRank}.</span>
            <img src="${container.querySelector('img').src}" alt="Ranked Image ${currentRank}">
        `;
        rankingList.appendChild(rankItem);

        selectedImages.push({
            imageId: container.dataset.imageId,
            imageName: imageNames[parseInt(container.dataset.imageId) - 1],
            rank: currentRank
        });

        currentRank++;

        // Enable submit button when all images are ranked
        if (selectedImages.length === 7) {
            submitBtn.disabled = false;
        }
    }

    // Reset selection
    resetBtn.addEventListener('click', () => {
        loadImages();
    });

    // Handle form submission
    submitBtn.addEventListener('click', () => {
        if (selectedImages.length !== 7) return;

        // Create the ranking data
        const rankingData = {
            referenceImage: 'images/image1/ref.jpg',
            rankings: selectedImages
        };

        // Here you would typically send the data to your server
        console.log('Ranking submitted:', rankingData);
        
        // You can add your API call here to submit the data
        // Example:
        // fetch('/api/submit-ranking', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(rankingData)
        // });
    });

    // Load images when the page loads
    loadImages();
}); 