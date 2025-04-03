document.addEventListener('DOMContentLoaded', function() {
    const imageGrid = document.getElementById('imageGrid');
    const rankingList = document.getElementById('rankingList');
    const resetBtn = document.getElementById('resetBtn');
    const submitBtn = document.getElementById('submitBtn');
    const referenceImage = document.getElementById('reference');

    let selectedImages = [];
    let currentRank = 1;

    // Set reference image
    referenceImage.src = 'images/image1/ref.png';

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

    // Function to create image comparison container
    function createImageComparison(generatedImageSrc, referenceImageSrc) {
        const container = document.createElement('div');
        container.className = 'image-container';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'image-wrapper';

        // Generated image (will be clipped)
        const generatedImg = document.createElement('img');
        generatedImg.className = 'generated-image';
        generatedImg.src = generatedImageSrc;
        generatedImg.alt = '';
        generatedImg.style.setProperty('--clip-position', '100%');

        // Reference image (underneath)
        const referenceImg = document.createElement('img');
        referenceImg.className = 'reference-compare-image';
        referenceImg.src = referenceImageSrc;
        referenceImg.alt = '';

        // Slider container
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';

        // Slider input
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'comparison-slider';
        slider.min = '0';
        slider.max = '100';
        slider.value = '100';
        slider.title = 'Move slider to compare images';

        // Update clip path when slider moves
        slider.addEventListener('input', function() {
            generatedImg.style.setProperty('--clip-position', `${this.value}%`);
        });

        wrapper.appendChild(referenceImg);
        wrapper.appendChild(generatedImg);
        sliderContainer.appendChild(slider);
        container.appendChild(wrapper);
        container.appendChild(sliderContainer);

        return container;
    }

    // Function to load images
    function loadImages() {
        // Clear existing content
        imageGrid.innerHTML = '';
        rankingList.innerHTML = '';
        selectedImages = [];
        currentRank = 1;
        submitBtn.disabled = true;

        // Add the 7 generated images with comparison sliders
        imageNames.forEach((imageName, index) => {
            const generatedImageSrc = `images/image1/${imageName}.jpg`;
            const referenceImageSrc = 'images/image1/ref.png';
            
            const container = createImageComparison(generatedImageSrc, referenceImageSrc);
            container.dataset.imageId = index + 1;

            container.addEventListener('click', (e) => {
                // Only handle click if not clicking on slider
                if (!e.target.classList.contains('comparison-slider')) {
                    handleImageClick(container);
                }
            });

            imageGrid.appendChild(container);
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
            <img src="${container.querySelector('.generated-image').src}" alt="Ranked Image ${currentRank}">
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
            referenceImage: 'images/image1/ref.png',
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