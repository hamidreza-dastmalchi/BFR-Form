document.addEventListener('DOMContentLoaded', function() {
    const imageGrid = document.getElementById('imageGrid');
    const rankingList = document.getElementById('rankingList');
    const resetBtn = document.getElementById('resetBtn');
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
    function createImageComparison(generatedImageSrc, referenceImageSrc, index) {
        const container = document.createElement('div');
        container.className = 'image-container';
        container.setAttribute('data-index', index);
        container.setAttribute('data-image-id', index);
        
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
        slider.className = 'slider';
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

        // Add the 7 generated images with comparison sliders
        generatedImageSources.forEach((generatedImageSrc, index) => {
            const referenceImageSrc = 'images/image1/ref.png';
            
            const container = createImageComparison(generatedImageSrc, referenceImageSrc, index);

            container.addEventListener('click', (e) => {
                // Only handle click if not clicking on slider
                if (!e.target.classList.contains('slider')) {
                    handleImageClick(container);
                }
            });

            imageGrid.appendChild(container);
        });
    }

    // Handle image click
    function handleImageClick(container) {
        const imageId = container.getAttribute('data-image-id');
        
        // If image is already selected, deselect it
        if (container.classList.contains('selected')) {
            // Remove from selected state
            container.classList.remove('selected');
            container.removeAttribute('data-rank');
            
            // Remove from rankings
            const index = rankingOrder.indexOf(imageId);
            if (index > -1) {
                rankingOrder.splice(index, 1);
                selectedImages = selectedImages.filter(img => img.imageId !== imageId);
                
                // Update ranks for remaining images
                selectedImages.forEach((img, i) => {
                    img.rank = i + 1;
                    const imgContainer = document.querySelector(`[data-image-id="${img.imageId}"]`);
                    if (imgContainer) {
                        imgContainer.dataset.rank = i + 1;
                    }
                });
                
                currentRank = selectedImages.length + 1;
            }
        } else {
            // Select the image
            container.classList.add('selected');
            container.dataset.rank = currentRank;
            
            if (!rankingOrder.includes(imageId)) {
                rankingOrder.push(imageId);
                selectedImages.push({
                    imageId: imageId,
                    imageName: imageNames[parseInt(imageId)],
                    rank: currentRank
                });
                currentRank++;
            }
        }
        
        // Update the display
        updateRankingDisplay();
    }

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

    // Reset button functionality
    resetBtn.addEventListener('click', function() {
        loadImages();
    });

    // Load images when the page loads
    loadImages();
}); 