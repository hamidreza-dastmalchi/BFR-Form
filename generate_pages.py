import os

def generate_html(page_number, is_first=False, is_last=False):
    prev_button = '' if is_first else f'<button onclick="window.location.href=\'{("index" if page_number == 2 else f"page{page_number-1}")}.html\'" class="nav-button">Previous</button>'
    next_button = '' if is_last else f'<button onclick="window.location.href=\'page{page_number+1}.html\'" class="nav-button">Next</button>'
    
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Ranking Form - Page {page_number}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Image Ranking Task - Page {page_number}</h1>
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
            <img id="reference" src="images/image{page_number}/ref.png" alt="" aria-hidden="true" role="presentation">
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
            <button id="submitBtn" class="submit-button">Submit Ranking</button>
            <div class="navigation-buttons">
                {prev_button}
                {next_button}
            </div>
        </div>
    </div>
    <script src="script{page_number}.js"></script>
</body>
</html>'''

def generate_js(page_number):
    return f'''document.addEventListener('DOMContentLoaded', function() {{
    const imageGrid = document.getElementById('imageGrid');
    const rankingList = document.getElementById('rankingList');
    const resetBtn = document.getElementById('resetBtn');
    const submitBtn = document.getElementById('submitBtn');
    const referenceImageSrc = 'images/image{page_number}/ref.png';
    
    // Array to store the ranking order
    let rankingOrder = [];
    
    // Array of generated image sources
    const generatedImageSources = [
        'images/image{page_number}/gen1.png',
        'images/image{page_number}/gen2.png',
        'images/image{page_number}/gen3.png',
        'images/image{page_number}/gen4.png',
        'images/image{page_number}/gen5.png',
        'images/image{page_number}/gen6.png',
        'images/image{page_number}/gen7.png'
    ];

    // Create image containers with sliders
    generatedImageSources.forEach((generatedImageSrc, index) => {{
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
        slider.addEventListener('input', function() {{
            generatedImg.style.setProperty('--clip-position', `${{this.value}}%`);
        }});

        // Append elements
        imageWrapper.appendChild(referenceImg);
        imageWrapper.appendChild(generatedImg);
        sliderContainer.appendChild(slider);
        imageContainer.appendChild(imageWrapper);
        imageContainer.appendChild(sliderContainer);
        imageGrid.appendChild(imageContainer);

        // Add click event for ranking
        imageContainer.addEventListener('click', function() {{
            const index = this.getAttribute('data-index');
            if (!rankingOrder.includes(index)) {{
                rankingOrder.push(index);
                updateRankingDisplay();
                this.classList.add('selected');
            }}
        }});
    }});

    // Function to update the ranking display
    function updateRankingDisplay() {{
        rankingList.innerHTML = '';
        rankingOrder.forEach((index, rank) => {{
            const item = document.createElement('div');
            item.className = 'rank-item';
            
            const img = document.createElement('img');
            img.src = generatedImageSources[index];
            img.alt = '';
            img.setAttribute('aria-hidden', 'true');
            img.setAttribute('role', 'presentation');
            
            const rankText = document.createElement('span');
            rankText.textContent = `Rank ${{rank + 1}}`;
            
            item.appendChild(img);
            item.appendChild(rankText);
            rankingList.appendChild(item);
        }});
    }}

    // Reset button functionality
    resetBtn.addEventListener('click', function() {{
        rankingOrder = [];
        updateRankingDisplay();
        document.querySelectorAll('.image-container').forEach(container => {{
            container.classList.remove('selected');
        }});
    }});

    // Submit button functionality
    submitBtn.addEventListener('click', function() {{
        if (rankingOrder.length === generatedImageSources.length) {{
            const results = {{
                page: {page_number},
                timestamp: new Date().toISOString(),
                ranking: rankingOrder.map(index => ({{
                    rank: rankingOrder.indexOf(index) + 1,
                    image: generatedImageSources[index]
                }}))
            }};
            console.log('Ranking Results:', results);
            // Here you can add code to send results to a server
            alert('Ranking submitted successfully!');
        }} else {{
            alert('Please rank all images before submitting.');
        }}
    }});
}});'''

def main():
    # Create images directory structure
    for i in range(1, 16):
        os.makedirs(f'images/image{i}', exist_ok=True)

    # Generate pages 2 through 15 (page 1 is index.html)
    for i in range(2, 16):
        # Generate HTML
        html = generate_html(i, i == 1, i == 15)
        with open(f'page{i}.html', 'w', encoding='utf-8') as f:
            f.write(html)

        # Generate JavaScript
        js = generate_js(i)
        with open(f'script{i}.js', 'w', encoding='utf-8') as f:
            f.write(js)

    print('Generated all pages successfully!')

if __name__ == '__main__':
    main() 