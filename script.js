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
        'images/image1/1_IGCP-v1.png',
        'images/image1/2_VQFR.jpg',
        'images/image1/3_codeformer.png',
        'images/image1/4_DR2.jpg',
        'images/image1/5_GPEN.png',
        'images/image1/6_GFPGAN.jpg',
        'images/image1/7_PULSE.jpg'
    ];

    // Function to create image comparison container
    function createImageComparison(generatedImageSrc, referenceImageSrc, index) {
        const container = document.createElement('div');
        container.className = 'image-container';
        container.setAttribute('data-index', index);
        container.setAttribute('data-image-id', index);
        
        const wrapper = document.createElement('div');
        wrapper.className = 'image-wrapper';

        // Generated image (underneath)
        const generatedImg = document.createElement('img');
        generatedImg.className = 'generated-image';
        generatedImg.src = generatedImageSrc;
        generatedImg.alt = '';
        generatedImg.setAttribute('aria-hidden', 'true');
        generatedImg.setAttribute('role', 'presentation');

        // Reference image (on top)
        const referenceImg = document.createElement('img');
        referenceImg.className = 'reference-compare-image';
        referenceImg.src = referenceImageSrc;
        referenceImg.alt = '';
        referenceImg.setAttribute('aria-hidden', 'true');
        referenceImg.setAttribute('role', 'presentation');
        referenceImg.style.setProperty('--clip-position', '100%');  // Start with reference image hidden

        // Slider container
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';

        // Slider input
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'slider';
        slider.min = '0';
        slider.max = '100';
        slider.value = '100';  // Start with slider at right (showing generated)
        slider.title = 'Move slider to compare images';

        // Update clip path when slider moves
        slider.addEventListener('input', function() {
            referenceImg.style.setProperty('--clip-position', `${100 - this.value}%`);
        });

        wrapper.appendChild(generatedImg);  // Generated image first (bottom layer)
        wrapper.appendChild(referenceImg);  // Reference image second (top layer)
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
                // Only handle click if not clicking on slider or slider container
                if (!e.target.classList.contains('slider') && !e.target.classList.contains('slider-container')) {
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
            
            // Find and remove from rankings
            const index = rankingOrder.indexOf(imageId);
            if (index > -1) {
                // Remove from rankingOrder and selectedImages
                rankingOrder.splice(index, 1);
                selectedImages = selectedImages.filter(img => img.imageId !== imageId);
                
                // Reset all ranks
                const allSelected = document.querySelectorAll('.image-container.selected');
                allSelected.forEach(el => el.removeAttribute('data-rank'));
                
                // Reassign ranks based on rankingOrder
                rankingOrder.forEach((id, idx) => {
                    const el = document.querySelector(`[data-image-id="${id}"]`);
                    if (el) {
                        el.dataset.rank = idx + 1;
                    }
                });
                
                currentRank = rankingOrder.length + 1;
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