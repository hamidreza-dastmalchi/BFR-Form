document.addEventListener('DOMContentLoaded', function() {
    const imageGrid = document.getElementById('imageGrid');
    const rankingList = document.getElementById('rankingList');
    const resetBtn = document.getElementById('resetBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const referenceImageSrc = 'images/image2/ref.png';
    
    let selectedImages = [];
    let currentRank = 1;
    let rankingOrder = [];
    let imagesLoaded = 0;
    const totalImages = 8; // 7 generated + 1 reference

    // Function to check if all images are loaded
    function checkAllImagesLoaded() {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            console.log('All images loaded successfully');
        }
    }

    // Function to handle image load error
    function handleImageError(img, src) {
        console.error(`Failed to load image: ${src}`);
        img.onerror = null; // Prevent infinite loop
        checkAllImagesLoaded(); // Still increment counter to not block the UI
    }

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

    // Function to check if all images are ranked
    function checkAllImagesRanked() {
        const allRanked = selectedImages.length === 7;
        if (nextBtn) nextBtn.disabled = !allRanked;
        if (submitBtn) submitBtn.disabled = !allRanked;
        return allRanked;
    }

    // Create image containers with sliders
    generatedImageSources.forEach((generatedImageSrc, index) => {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        imageContainer.setAttribute('data-index', index);

        // Image wrapper
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'image-wrapper';

        // Generated image (will be clipped)
        const generatedImg = document.createElement('img');
        generatedImg.className = 'generated-image';
        generatedImg.src = generatedImageSrc;
        generatedImg.alt = '';
        generatedImg.setAttribute('aria-hidden', 'true');
        generatedImg.setAttribute('role', 'presentation');
        generatedImg.style.setProperty('--clip-position', '100%');
        generatedImg.onload = checkAllImagesLoaded;
        generatedImg.onerror = () => handleImageError(generatedImg, generatedImageSrc);

        // Reference image (underneath)
        const referenceImg = document.createElement('img');
        referenceImg.className = 'reference-compare-image';
        referenceImg.src = referenceImageSrc;
        referenceImg.alt = '';
        referenceImg.setAttribute('aria-hidden', 'true');
        referenceImg.setAttribute('role', 'presentation');
        referenceImg.onload = checkAllImagesLoaded;
        referenceImg.onerror = () => handleImageError(referenceImg, referenceImageSrc);

        // Slider container
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';

        // Slider input
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = '100';
        slider.className = 'slider';

        // Add event listener for slider
        slider.addEventListener('input', function() {
            generatedImg.style.setProperty('--clip-position', `${this.value}%`);
        });

        // Append elements in the correct order
        imageWrapper.appendChild(referenceImg);
        imageWrapper.appendChild(generatedImg);
        sliderContainer.appendChild(slider);
        imageContainer.appendChild(imageWrapper);
        imageContainer.appendChild(sliderContainer);
        imageGrid.appendChild(imageContainer);

        // Add click event for ranking
        imageContainer.addEventListener('click', function(e) {
            // Ignore clicks on the slider
            if (e.target.classList.contains('slider')) return;
            
            const index = this.getAttribute('data-index');
            if (!rankingOrder.includes(index)) {
                rankingOrder.push(index);
                updateRankingDisplay();
                this.classList.add('selected');
                
                selectedImages.push({
                    imageId: index,
                    rank: rankingOrder.length
                });
                currentRank++;
                checkAllImagesRanked();
            }
        });
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
            img.onload = checkAllImagesLoaded;
            img.onerror = () => handleImageError(img, generatedImageSources[index]);
            
            const rankText = document.createElement('span');
            rankText.textContent = `Rank ${rank + 1}`;
            
            item.appendChild(img);
            item.appendChild(rankText);
            rankingList.appendChild(item);
        });
    }

    // Reset button functionality
    resetBtn.addEventListener('click', function() {
        rankingOrder = [];
        selectedImages = [];
        currentRank = 1;
        updateRankingDisplay();
        document.querySelectorAll('.image-container').forEach(container => {
            container.classList.remove('selected');
        });
        if (nextBtn) nextBtn.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
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
                window.location.replace(nextPage);
            } else if (prevPage) {
                window.location.replace(prevPage);
            }
        });
    });

    // Submit button functionality (only on last page)
    if (submitBtn) {
        submitBtn.disabled = true; // Ensure button starts disabled
        submitBtn.addEventListener('click', function() {
            if (!checkAllImagesRanked()) {
                alert('Please rank all images before submitting.');
                return;
            }
            // Save the last page's ranking
            localStorage.setItem('ranking_page_2', JSON.stringify({
                timestamp: new Date().toISOString(),
                ranking: rankingOrder.map(index => ({
                    rank: rankingOrder.indexOf(index) + 1,
                    image: generatedImageSources[index]
                }))
            }));

            // Collect all rankings
            const allRankings = {};
            for (let i = 1; i <= 15; i++) {
                const pageRanking = localStorage.getItem(`ranking_page_${i}`);
                if (pageRanking) {
                    allRankings[`page_${i}`] = JSON.parse(pageRanking);
                }
            }

            console.log('All Rankings:', allRankings);
            alert('All rankings submitted successfully!');
        });
    }

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
        updateRankingDisplay();
        document.querySelectorAll('.image-container').forEach(container => {
            if (rankingOrder.includes(container.getAttribute('data-index'))) {
                container.classList.add('selected');
            }
        });
        checkAllImagesRanked();
    }

    // Load the reference image
    const referenceImg = document.getElementById('reference');
    if (referenceImg) {
        referenceImg.onload = checkAllImagesLoaded;
        referenceImg.onerror = () => handleImageError(referenceImg, referenceImageSrc);
    }
});
