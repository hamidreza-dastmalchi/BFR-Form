# Function to generate HTML content
function Generate-HTML {
    param (
        [int]$pageNumber,
        [bool]$isLast
    )
    
    $prevButton = if ($pageNumber -eq 2) {
        "<button onclick=`"window.location.href='index.html'`" class=`"nav-button`">Previous</button>"
    } else {
        "<button onclick=`"window.location.href='page$($pageNumber-1).html'`" class=`"nav-button`">Previous</button>"
    }
    
    $nextButton = if (!$isLast) {
        "<button id=`"nextBtn`" class=`"nav-button`" disabled>Next</button>"
    } else { "" }

    $submitButton = if ($isLast) {
        "<button id=`"submitBtn`" class=`"submit-button`" disabled>Submit Ranking</button>"
    } else { "" }
    
    return @"
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
            $submitButton
            <div class="navigation-buttons">
                $prevButton
                $nextButton
            </div>
        </div>
    </div>
    <script src="script$pageNumber.js"></script>
</body>
</html>
"@
}

# Function to generate JavaScript content
function Generate-JavaScript {
    param (
        [int]$pageNumber,
        [bool]$isLast = ($pageNumber -eq 15)
    )
    
    return @"
document.addEventListener('DOMContentLoaded', function() {
    const imageGrid = document.getElementById('imageGrid');
    const rankingList = document.getElementById('rankingList');
    const resetBtn = document.getElementById('resetBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const referenceImageSrc = 'images/image$pageNumber/ref.png';
    
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

    // Next button functionality
    if (nextBtn) {
        nextBtn.disabled = true; // Ensure button starts disabled
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!checkAllImagesRanked()) {
                alert('Please rank all images before proceeding.');
                return;
            }
            // Save the current page's ranking to localStorage
            localStorage.setItem('ranking_page_$pageNumber', JSON.stringify({
                timestamp: new Date().toISOString(),
                ranking: rankingOrder.map(index => ({
                    rank: rankingOrder.indexOf(index) + 1,
                    image: generatedImageSources[index]
                }))
            }));
            
            // Navigate to next page
            window.location.replace('page$($pageNumber + 1).html');
        });
    }

    // Submit button functionality (only on last page)
    if (submitBtn) {
        submitBtn.disabled = true; // Ensure button starts disabled
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
        updateRankingDisplay();
        document.querySelectorAll('.image-container').forEach(container => {
            if (rankingOrder.includes(container.getAttribute('data-index'))) {
                container.classList.add('selected');
            }
        });
        checkAllImagesRanked();
    }
});
"@
}

# Create image directories and copy images
2..15 | ForEach-Object {
    $pageNumber = $_
    $dir = "images/image$pageNumber"
    
    # Create directory if it doesn't exist
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
    }
    
    # Copy reference image and generated images from image1 directory
    Copy-Item "images/image1/ref.png" "$dir/ref.png" -Force
    Copy-Item "images/image1/1_IGCP-v1.png" "$dir/gen1.png" -Force
    Copy-Item "images/image1/2_VQFR.jpg" "$dir/gen2.png" -Force
    Copy-Item "images/image1/3_codeformer.png" "$dir/gen3.png" -Force
    Copy-Item "images/image1/4_DR2.jpg" "$dir/gen4.png" -Force
    Copy-Item "images/image1/5_GPEN.png" "$dir/gen5.png" -Force
    Copy-Item "images/image1/6_GFPGAN.jpg" "$dir/gen6.png" -Force
    Copy-Item "images/image1/7_PULSE.jpg" "$dir/gen7.png" -Force
}

# Generate pages 2 through 15
2..15 | ForEach-Object {
    $pageNumber = $_
    $isLast = $pageNumber -eq 15
    
    # Generate HTML
    $html = Generate-HTML -pageNumber $pageNumber -isLast $isLast
    $html | Out-File -FilePath "page$pageNumber.html" -Encoding UTF8
    
    # Generate JavaScript
    $js = Generate-JavaScript -pageNumber $pageNumber -isLast $isLast
    $js | Out-File -FilePath "script$pageNumber.js" -Encoding UTF8
}

Write-Host "Generated all pages successfully!" 