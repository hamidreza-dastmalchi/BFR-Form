document.addEventListener('DOMContentLoaded', function() {
    const imageGrid = document.getElementById('imageGrid');
    const rankingList = document.getElementById('rankingList');
    const resetBtn = document.getElementById('resetBtn');
    const submitBtn = document.getElementById('submitBtn');
    const referenceImageSrc = 'images/image2/ref.png';
    
    // Array to store the ranking order
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
            generatedImg.style.setProperty('--clip-position', `${this.value}%`);
        });

        // Append elements
        imageWrapper.appendChild(referenceImg);
        imageWrapper.appendChild(generatedImg);
        sliderContainer.appendChild(slider);
        imageContainer.appendChild(imageWrapper);
        imageContainer.appendChild(sliderContainer);
        imageGrid.appendChild(imageContainer);

        // Add click event for ranking
        imageContainer.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            if (!rankingOrder.includes(index)) {
                rankingOrder.push(index);
                updateRankingDisplay();
                this.classList.add('selected');
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
            rankText.textContent = `Rank ${rank + 1}`;
            
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
    });

    // Submit button functionality
    submitBtn.addEventListener('click', function() {
        if (rankingOrder.length === generatedImageSources.length) {
            const results = {
                page: 2,
                timestamp: new Date().toISOString(),
                ranking: rankingOrder.map(index => ({
                    rank: rankingOrder.indexOf(index) + 1,
                    image: generatedImageSources[index]
                }))
            };
            console.log('Ranking Results:', results);
            // Here you can add code to send results to a server
            alert('Ranking submitted successfully!');
        } else {
            alert('Please rank all images before submitting.');
        }
    });
});