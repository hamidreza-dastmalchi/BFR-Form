# Function to generate HTML file
function Generate-HtmlFile {
    param (
        [int]$pageNumber,
        [int]$nextPageNumber
    )
    
    $prevPageNumber = $pageNumber - 1
    $prevPage = if ($prevPageNumber -eq 1) { "index.html" } else { "page$prevPageNumber.html" }
    $nextPage = if ($nextPageNumber -le 15) { "page$nextPageNumber.html" } else { "" }
    
    $htmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Ranking Form - Page $pageNumber</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Image Ranking Task - Page $pageNumber</h1>
        <div class="instructions">
            <h2>Instructions:</h2>
            <p>1. Look at the reference image below</p>
            <p>2. For each generated image, use the slider below it to compare with the reference image:</p>
            <ul>
                <li>Move the slider left to reveal the reference image</li>
                <li>Move the slider right to see the generated image</li>
                <li>This helps you compare the differences directly</li>
            </ul>
            <p>3. Click on the generated images in order of similarity to the reference image</p>
            <p>4. Click the most similar image first, then the second most similar, and so on</p>
            <p>5. You can change your selection by clicking "Reset"</p>
        </div>

        <div class="reference-image">
            <h2>Reference Image</h2>
            <img id="reference" src="images/image$pageNumber/ref.png" alt="" aria-hidden="true" role="presentation">
        </div>

        <div class="generated-images">
            <h2>Generated Images</h2>
            <div class="image-grid" id="imageGrid">
                <!-- Images will be added here dynamically -->
            </div>
        </div>

        <div class="ranking-display">
            <h2>Your Ranking:</h2>
            <div id="rankingList"></div>
        </div>

        <div class="button-container">
            <button id="resetBtn" class="reset-button">Reset Selection</button>
            
            <div class="navigation-buttons">
                <button class="nav-button" data-prev-page="$prevPage">Previous</button>
"@

    if ($nextPage) {
        $htmlContent += @"
                <button id="nextBtn" class="nav-button" data-next-page="$nextPage" disabled>Next</button>
"@
    } else {
        $htmlContent += @"
                <button id="submitBtn" class="nav-button submit-button" disabled>Submit</button>
"@
    }

    $htmlContent += @"
            </div>
        </div>
    </div>
    <script src="script$pageNumber.js"></script>
</body>
</html>
"@

    $htmlContent | Out-File -FilePath "page$pageNumber.html" -Encoding UTF8
}

# Function to generate JavaScript file
function Generate-JsFile {
    param (
        [int]$pageNumber
    )
    
    $jsContent = @"
document.addEventListener('DOMContentLoaded', function() {
    const imageGrid = document.getElementById('imageGrid');
    const rankingList = document.getElementById('rankingList');
    const resetBtn = document.getElementById('resetBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
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
            generatedImg.style.setProperty('--clip-position', `\${this.value}%`);
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
        if (submitBtn) submitBtn.disabled = true;

        // Add the 7 generated images with comparison sliders
        generatedImageSources.forEach((generatedImageSrc, index) => {
            const referenceImageSrc = 'images/image$pageNumber/ref.png';
            
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
        if (submitBtn) submitBtn.disabled = !allRanked;
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

    // Submit button functionality (only on last page)
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            if (!checkAllImagesRanked()) {
                alert('Please rank all images before submitting.');
                return;
            }
            // Save the last page's ranking
            localStorage.setItem('ranking_page_$pageNumber', JSON.stringify({
                timestamp: new Date().toISOString(),
                ranking: rankingOrder.map(index => ({
                    rank: rankingOrder.indexOf(index) + 1,
                    image: generatedImageSources[index]
                }))
            }));

            // Collect all rankings
            const allRankings = {};
            for (let i = 1; i <= 15; i++) {
                const pageRanking = localStorage.getItem(`ranking_page_\${i}`);
                if (pageRanking) {
                    allRankings[`page_\${i}`] = JSON.parse(pageRanking);
                }
            }

            console.log('All Rankings:', allRankings);
            alert('All rankings submitted successfully!');
        });
    }

    // Check if there's saved ranking for this page
    const savedRanking = localStorage.getItem('ranking_page_$pageNumber');
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
"@

    $jsContent | Out-File -FilePath "script$pageNumber.js" -Encoding UTF8
}

# Generate pages 4 through 15
for ($i = 4; $i -le 15; $i++) {
    Write-Host "Generating page $i..."
    Generate-HtmlFile -pageNumber $i -nextPageNumber ($i + 1)
    Generate-JsFile -pageNumber $i
}

Write-Host "Generated all pages successfully!" 