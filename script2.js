document.addEventListener('DOMContentLoaded', function() {
    const imageGrid = document.getElementById('imageGrid');
    const rankingList = document.getElementById('rankingList');
    const resetBtn = document.getElementById('resetBtn');
    const nextBtn = document.getElementById('nextBtn');
    const referenceImage = document.getElementById('reference');

    let selectedImages = [];
    let currentRank = 1;
    let rankingOrder = [];

    // Array of generated image sources
    const generatedImageSources = [
        'images/image2/gen1.png',
        'images/image2/gen2.png',
        'images/image2/gen3.png',
        'images/image2/gen4.png',
        'images/image2/gen5.png',
        'images/image2/gen6.png',
        'images/image2/gen7.png'
    ];

    // Function to create image comparison container
    function createImageComparison(generatedImageSrc, referenceImageSrc, index) {
        const container = document.createElement('div');
        container.className = 'image-container';
        container.setAttribute('data-index', index);
        
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
        if (nextBtn) nextBtn.disabled = true;

        // Add the 7 generated images with comparison sliders
        generatedImageSources.forEach((generatedImageSrc, index) => {
            const referenceImageSrc = 'images/image2/ref.png';
            
            const container = createImageComparison(generatedImageSrc, referenceImageSrc, index);
            container.dataset.imageId = index;

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
        if (container.classList.contains('selected')) return;

        container.classList.add('selected');
        container.dataset.rank = currentRank;
        
        const imageId = container.dataset.imageId;
        if (!rankingOrder.includes(imageId)) {
            rankingOrder.push(imageId);
            selectedImages.push({
                imageId: imageId,
                rank: currentRank
            });
            currentRank++;
            updateRankingDisplay();
            checkAllImagesRanked();
        }
    }

    // Function to check if all images are ranked
    function checkAllImagesRanked() {
        const allRanked = selectedImages.length === 7;
        if (nextBtn) nextBtn.disabled = !allRanked;
        return allRanked;
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

    // Navigation button functionality
    document.querySelectorAll('[data-next-page], [data-prev-page]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const nextPage = this.getAttribute('data-next-page');
            const prevPage = this.getAttribute('data-prev-page');
            
            if (nextPage && !checkAllImagesRanked()) {
                alert('Please rank all images before proceeding.');
                return;
            }
            
            if (nextPage) {
                // Save the current page's ranking to localStorage
                localStorage.setItem('ranking_page_2', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    ranking: rankingOrder.map(index => ({
                        rank: rankingOrder.indexOf(index) + 1,
                        image: generatedImageSources[index]
                    }))
                }));
                window.location.href = nextPage;
            } else if (prevPage) {
                window.location.href = prevPage;
            }
        });
    });

    // Check if there's saved ranking for this page
    const savedRanking = localStorage.getItem('ranking_page_2');
    if (savedRanking) {
        const data = JSON.parse(savedRanking);
        rankingOrder = data.ranking.map(r => {
            const index = generatedImageSources.findIndex(src => src === r.image);
            return index.toString();
        });
        selectedImages = rankingOrder.map((index, rank) => ({
            imageId: index,
            rank: rank + 1
        }));
        currentRank = selectedImages.length + 1;
        
        // First load the images
        loadImages();
        
        // Then restore the selections
        rankingOrder.forEach((index, rank) => {
            const container = document.querySelector(`.image-container[data-image-id="${index}"]`);
            if (container) {
                container.classList.add('selected');
                container.dataset.rank = rank + 1;
            }
        });
        
        // Finally update the display and check status
        updateRankingDisplay();
        checkAllImagesRanked();
    } else {
        // Load images when the page loads
        loadImages();
    }
});
