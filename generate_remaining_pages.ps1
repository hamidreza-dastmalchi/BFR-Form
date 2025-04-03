# Function to generate HTML file
function Generate-HTML {
    param (
        [int]$pageNumber,
        [int]$prevPage,
        [int]$nextPage
    )
    
    $prevLink = if ($prevPage -gt 0) { "page$prevPage.html" } else { "index.html" }
    $nextLink = if ($nextPage -le 15) { "page$nextPage.html" } else { "" }
    
    $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Ranking - Page $pageNumber</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Image Ranking - Page $pageNumber</h1>
        
        <!-- Reference Image -->
        <div class="reference-image">
            <img src="images/image$pageNumber/ref.png" alt="" id="reference" aria-hidden="true" role="presentation">
        </div>

        <!-- Image Grid for Comparison -->
        <div class="content-wrapper">
            <div id="imageGrid" class="image-grid"></div>
            <div id="rankingList" class="ranking-list"></div>
        </div>

        <!-- Navigation -->
        <div class="navigation">
            <button class="nav-btn" data-prev-page="$prevLink">Previous</button>
            <button id="resetBtn">Reset Rankings</button>
            <button id="nextBtn" class="nav-btn" data-next-page="$nextLink" disabled>Next</button>
        </div>
    </div>
    <script src="script$pageNumber.js"></script>
</body>
</html>
"@

    $html | Out-File -FilePath "page$pageNumber.html" -Encoding UTF8
}

# Function to generate JavaScript file
function Generate-JavaScript {
    param (
        [int]$pageNumber
    )
    
    $js = @"
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
        'images/image$pageNumber/gen1.png',
        'images/image$pageNumber/gen2.png',
        'images/image$pageNumber/gen3.png',
        'images/image$pageNumber/gen4.png',
        'images/image$pageNumber/gen5.png',
        'images/image$pageNumber/gen6.png',
        'images/image$pageNumber/gen7.png'
    ];

    // Function to create image comparison container
    function createImageComparison(generatedImageSrc, referenceImageSrc, index) {
        const container = document.createElement('div');
        container.className = 'image-container';
        container.setAttribute('data-index', index);
        container.setAttribute('data-image-id', index);
        
        const wrapper = document.createElement('div');
        wrapper.className = 'image-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.height = '300px';
        wrapper.style.overflow = 'hidden';

        // Reference image (underneath)
        const referenceImg = document.createElement('img');
        referenceImg.className = 'reference-compare-image';
        referenceImg.src = referenceImageSrc;
        referenceImg.alt = '';
        referenceImg.style.position = 'absolute';
        referenceImg.style.top = '0';
        referenceImg.style.left = '0';
        referenceImg.style.width = '100%';
        referenceImg.style.height = '100%';
        referenceImg.style.objectFit = 'contain';
        referenceImg.style.zIndex = '1';
        referenceImg.setAttribute('aria-hidden', 'true');
        referenceImg.setAttribute('role', 'presentation');

        // Generated image (will be clipped)
        const generatedImg = document.createElement('img');
        generatedImg.className = 'generated-image';
        generatedImg.src = generatedImageSrc;
        generatedImg.alt = '';
        generatedImg.style.position = 'absolute';
        generatedImg.style.top = '0';
        generatedImg.style.left = '0';
        generatedImg.style.width = '100%';
        generatedImg.style.height = '100%';
        generatedImg.style.objectFit = 'contain';
        generatedImg.style.zIndex = '2';
        generatedImg.setAttribute('aria-hidden', 'true');
        generatedImg.setAttribute('role', 'presentation');
        generatedImg.style.setProperty('--clip-position', '100%');

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
            generatedImg.style.clipPath = `inset(0 calc(100% - \${this.value}%) 0 0)`;
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
            const container = createImageComparison(
                generatedImageSrc,
                'images/image$pageNumber/ref.png',
                index
            );

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
        
        const imageId = container.getAttribute('data-image-id');
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
            rankText.textContent = `Rank \${rank + 1}`;
            
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
                localStorage.setItem('ranking_page_$pageNumber', JSON.stringify({
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

    // Load images when the page loads
    loadImages();

    // Check if there's saved ranking for this page and restore if exists
    const savedRanking = localStorage.getItem('ranking_page_$pageNumber');
    if (savedRanking) {
        try {
            const data = JSON.parse(savedRanking);
            const containers = document.querySelectorAll('.image-container');
            
            data.ranking.forEach((item, index) => {
                const imageIndex = generatedImageSources.findIndex(src => src === item.image);
                if (imageIndex !== -1) {
                    const container = containers[imageIndex];
                    if (container) {
                        handleImageClick(container);
                    }
                }
            });
        } catch (error) {
            console.error('Error restoring rankings:', error);
        }
    }
});
"@

    $js | Out-File -FilePath "script$pageNumber.js" -Encoding UTF8
}

# Generate pages 5-15
for ($i = 5; $i -le 15; $i++) {
    Write-Host "Generating page $i..."
    Generate-HTML -pageNumber $i -prevPage ($i - 1) -nextPage ($i + 1)
    Generate-JavaScript -pageNumber $i
}

Write-Host "Generated all pages successfully!" 