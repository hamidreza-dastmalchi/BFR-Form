document.addEventListener('DOMContentLoaded', function() {
    const imageGrid = document.getElementById('imageGrid');
    const rankingList = document.getElementById('rankingList');
    const resetBtn = document.getElementById('resetBtn');
    const nextBtn = document.getElementById('nextBtn');
    const referenceImage = document.getElementById('reference');

    let selectedImages = [];
    let currentRank = 1;
    let rankingOrder = [];

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

    // Array of generated image sources
    const generatedImageSources = [
        'images/image1/gen1.png',
        'images/image1/gen2.png',
        'images/image1/gen3.png',
        'images/image1/gen4.png',
        'images/image1/gen5.png',
        'images/image1/gen6.png',
        'images/image1/gen7.png'
    ];

    // Function to create image comparison container
    function createImageComparison(generatedImageSrc, referenceImageSrc) {
        const container = document.createElement('div');
        container.className = 'image-container';
        container.setAttribute('data-index', generatedImageSrc);
        
        const wrapper = document.createElement('div');
        wrapper.className = 'image-wrapper';

        // Generated image (will be clipped)
        const generatedImg = document.createElement('img');
        generatedImg.className = 'generated-image';
        generatedImg.src = generatedImageSrc;
        generatedImg.alt = '';
        generatedImg.setAttribute('aria-hidden', 'true');
        generatedImg.setAttribute('role', 'presentation');
        generatedImg.style.setProperty('--clip-position', '100%');

        // Reference image (underneath)
        const referenceImg = document.createElement('img');
        referenceImg.className = 'reference-compare-image';
        referenceImg.src = referenceImageSrc;
        referenceImg.alt = '';
        referenceImg.setAttribute('aria-hidden', 'true');
        referenceImg.setAttribute('role', 'presentation');

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
        rankingOrder = [];
        nextBtn.disabled = true;

        // Add the 7 generated images with comparison sliders
        generatedImageSources.forEach((generatedImageSrc, index) => {
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
            <img src="${container.querySelector('.generated-image').src}" alt="">
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
            nextBtn.disabled = false;
        }

        // Add to ranking order
        rankingOrder.push(container.dataset.imageId - 1);
        updateRankingDisplay();
    }

    // Reset selection
    resetBtn.addEventListener('click', () => {
        loadImages();
    });

    // Handle form submission
    nextBtn.addEventListener('click', () => {
        if (selectedImages.length !== 7) return;

        // Create the ranking data
        const rankingData = {
            referenceImage: 'images/image1/ref.png',
            rankings: selectedImages
        };

        // Save the current page's ranking to localStorage
        localStorage.setItem('ranking_page_1', JSON.stringify({
            timestamp: new Date().toISOString(),
            ranking: rankingOrder.map(index => ({
                rank: rankingOrder.indexOf(index) + 1,
                image: generatedImageSources[index]
            }))
        }));
        
        // Navigate to next page - using direct link
        window.location.href = 'page2.html';
    });

    // Function to update the ranking display
    function updateRankingDisplay() {
        rankingList.innerHTML = '';
        rankingOrder.forEach((index, rank) => {
            const item = document.createElement('div');
            item.className = 'rank-item';
            
            const img = document.createElement('img');
            img.src = generatedImageSources[index];
            img.alt = '';
            img.setAttribute('aria-hidden', 'true');
            img.setAttribute('role', 'presentation');
            
            const rankText = document.createElement('span');
            rankText.textContent = `Rank ${rank + 1}`;
            
            item.appendChild(img);
            item.appendChild(rankText);
            rankingList.appendChild(item);
        });
    }

    // Load images when the page loads
    loadImages();
}); 