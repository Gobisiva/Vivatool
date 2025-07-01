// Initialize WebGazer
function initWebGazer() {
    webgazer.setGazeListener((data, timestamp) => {
        if (data == null || !isDrawing) return;
        
        processGaze(data.x, data.y);
    })
    .begin();
    
    webgazer.showVideo(false);
    webgazer.showFaceOverlay(false);
    webgazer.showFaceFeedbackBox(false);
    
    console.log('WebGazer initialized');
}

// Load URL into iframe
function loadURL() {
    const url = document.getElementById('urlInput').value;
    if (url) {
        let fullUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            fullUrl = 'https://' + url;
        }
        document.getElementById('siteFrame').src = fullUrl;
    }
}

// Start calibration
function startCalibration() {
    webgazer.showFaceOverlay(true);
    webgazer.showFaceFeedbackBox(true);
    document.getElementById('statusText').textContent = 'Calibrating...';
    
    setTimeout(() => {
        webgazer.showFaceOverlay(false);
        webgazer.showFaceFeedbackBox(false);
        document.getElementById('statusText').textContent = 'Ready';
    }, 10000);
}

// Toggle drawing
function toggleDrawing() {
    isDrawing = !isDrawing;
    document.querySelector('.status-dot').classList.toggle('active');
    document.getElementById('statusText').textContent = 
        isDrawing ? 'Recording' : 'Paused';
}

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokePath = [];
    strokeHistory = [];
    currentStrokeId++;
}

// Initialize on load
window.addEventListener('load', () => {
    initWebGazer();
    
    // Setup drawing mode buttons
    document.querySelectorAll('.mode-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.mode-button').forEach(b => 
                b.classList.remove('active'));
            button.classList.add('active');
        });
    });
});