document.addEventListener('DOMContentLoaded', function() {
    const imageGrid = document.getElementById('imageGrid');
    const rankingList = document.getElementById('rankingList');
    const resetBtn = document.getElementById('resetBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const referenceImageSrc = 'images/image4/ref.png';
    
    // Array to store the ranking order
    let rankingOrder = [];
    
    // Array of generated image sources
    const generatedImageSources = [
        'images/image4/gen1.png',
        'images/image4/gen2.png',
        'images/image4/gen3.png',
        'images/image4/gen4.png',
        'images/image4/gen5.png',
        'images/image4/gen6.png',
        'images/image4/gen7.png'
    ];

    // Function to check if all images are ranked
    function checkAllImagesRanked() {
        const allRanked = rankingOrder.length === generatedImageSources.length;
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
        slider.min = '0';
        slider.max = '100';
        slider.value = '100';
        slider.className = 'slider';

        // Add event listener for slider
        slider.addEventListener('input', function() {
            generatedImg.style.setProperty('--clip-position', ${this.value}%);
        });

        // Append elements
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
            
            const rankText = document.createElement('span');
            rankText.textContent = Rank ;
            
            item.appendChild(img);
            item.appendChild(rankText);
            rankingList.appendChild(item);
        });
    }

    // Reset button functionality
    resetBtn.addEventListener('click', function() {
        rankingOrder = [];
        updateRankingDisplay();
        document.querySelectorAll('.image-container').forEach(container => {
            container.classList.remove('selected');
        });
        if (nextBtn) nextBtn.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
    });

    // Next button functionality
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (rankingOrder.length === generatedImageSources.length) {
                // Save the current page's ranking to localStorage
                localStorage.setItem('ranking_page_4', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    ranking: rankingOrder.map(index => ({
                        rank: rankingOrder.indexOf(index) + 1,
                        image: generatedImageSources[index]
                    }))
                }));
                
                // Navigate to next page
                window.location.href = this.getAttribute('data-next-page');
            } else {
                alert('Please rank all images before proceeding to the next page.');
            }
        });
    }

    // Submit button functionality (only on last page)
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            if (rankingOrder.length === generatedImageSources.length) {
                // Save the last page's ranking
                localStorage.setItem('ranking_page_4', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    ranking: rankingOrder.map(index => ({
                        rank: rankingOrder.indexOf(index) + 1,
                        image: generatedImageSources[index]
                    }))
                }));

                // Collect all rankings
                const allRankings = {};
                for (let i = 1; i <= 15; i++) {
                    const pageRanking = localStorage.getItem(anking_page_);
                    if (pageRanking) {
                        allRankings[page_] = JSON.parse(pageRanking);
                    }
                }

                console.log('All Rankings:', allRankings);
                alert('All rankings submitted successfully!');
            } else {
                alert('Please rank all images before submitting.');
            }
        });
    }

    // Check if there's saved ranking for this page
    const savedRanking = localStorage.getItem('ranking_page_4');
    if (savedRanking) {
        const data = JSON.parse(savedRanking);
        rankingOrder = data.ranking.map(r => {
            const index = generatedImageSources.findIndex(src => src === r.image);
            return index.toString();
        });
        updateRankingDisplay();
        document.querySelectorAll('.image-container').forEach(container => {
            if (rankingOrder.includes(container.getAttribute('data-index'))) {
                container.classList.add('selected');
            }
        });
        checkAllImagesRanked();
    }
});
