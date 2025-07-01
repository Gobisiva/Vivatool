// Drawing system variables
let canvas, ctx;
let isDrawing = false;
let strokePath = [];
let strokeHistory = [];
let currentStrokeId = 0;
let currentColor = "255, 0, 0"; // Red

// Initialize canvas
function initCanvas() {
    canvas = document.getElementById('sketchCanvas');
    ctx = canvas.getContext('2d');
    
    updateCanvasDimensions();
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateCanvasDimensions);
}

// Update canvas dimensions
function updateCanvasDimensions() {
    const siteFrame = document.getElementById('siteFrame');
    const fullHeight = Math.max(
        siteFrame.contentDocument?.body?.scrollHeight || 0,
        siteFrame.contentDocument?.documentElement?.scrollHeight || 0,
        window.innerHeight
    );
    
    canvas.width = window.innerWidth;
    canvas.height = fullHeight;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
}

// Handle scroll events
function handleScroll() {
    requestAnimationFrame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawStrokes();
    });
}

// Process gaze data
function processGaze(x, y) {
    if (!isDrawing) return;
    
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const timestamp = Date.now();
    
    strokePath.push({
        x,
        y: y + scrollY,
        timestamp,
        strokeId: currentStrokeId
    });
    
    strokeHistory.push({
        x,
        y: y + scrollY,
        timestamp,
        strokeId: currentStrokeId
    });
    
    drawStroke();
}

// Draw time-based gradient stroke
function drawStroke() {
    if (strokePath.length < 2) return;
    
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const lastPoint = strokePath[strokePath.length - 1];
    const prevPoint = strokePath[strokePath.length - 2];
    
    const timeDiff = lastPoint.timestamp - strokePath[0].timestamp;
    const alpha = Math.min(1, timeDiff / 5000);
    
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${currentColor}, ${1 - alpha})`;
    ctx.moveTo(prevPoint.x, prevPoint.y - scrollY);
    ctx.lineTo(lastPoint.x, lastPoint.y - scrollY);
    ctx.stroke();
    
    if (timeDiff % 1000 < 100) {
        drawTimestampMarker(lastPoint, timeDiff, scrollY);
    }
}

// Draw timestamp marker
function drawTimestampMarker(point, timeDiff, scrollY) {
    ctx.beginPath();
    ctx.arc(point.x, point.y - scrollY, 5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${currentColor}, 0.8)`;
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.fillText(
        `${Math.floor(timeDiff/1000)}s`,
        point.x + 10,
        point.y - scrollY
    );
}

// Redraw all strokes
function redrawStrokes() {
    strokeHistory.forEach((stroke, index) => {
        if (index > 0) {
            const prev = strokeHistory[index - 1];
            if (prev.strokeId === stroke.strokeId) {
                const timeDiff = stroke.timestamp - strokeHistory[0].timestamp;
                const alpha = Math.min(1, timeDiff / 5000);
                
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${currentColor}, ${1 - alpha})`;
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(stroke.x, stroke.y);
                ctx.stroke();
            }
        }
    });
}

// Export visualization
function exportGazeData() {
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    
    try {
        const siteFrame = document.getElementById('siteFrame');
        exportCtx.drawImage(siteFrame, 0, 0, exportCanvas.width, exportCanvas.height);
    } catch (e) {
        console.warn('Could not capture website screenshot:', e);
    }
    
    strokeHistory.forEach((stroke, index) => {
        if (index > 0) {
            const prev = strokeHistory[index - 1];
            if (prev.strokeId === stroke.strokeId) {
                const timeDiff = stroke.timestamp - strokeHistory[0].timestamp;
                const hue = (timeDiff / 1000) % 360;
                
                exportCtx.beginPath();
                exportCtx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.5)`;
                exportCtx.lineWidth = 2;
                exportCtx.moveTo(prev.x, prev.y);
                exportCtx.lineTo(stroke.x, stroke.y);
                exportCtx.stroke();
            }
        }
    });
    
    const link = document.createElement('a');
    link.download = `gaze-tracking-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
}

// Initialize on load
window.addEventListener('load', initCanvas);