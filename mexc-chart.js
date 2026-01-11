/**
 * MEXC Chart Implementation
 * Custom chart using Chart.js - NO external widgets
 * CSP-compliant, secure, self-hosted
 */

let mexcChart = null;
let chartUpdateInterval = null;

// Initialize MEXC Chart
async function initMexcChart() {
    const canvas = document.getElementById('mexc-chart');
    if (!canvas) {
        console.warn('⚠️ MEXC chart canvas not found');
        return;
    }

    try {
        // Fetch initial data from MEXC
        const klineData = await fetchMexcKlineData('1h', 24); // 24 hours of hourly data
        
        if (!klineData || klineData.length === 0) {
            showChartError(canvas);
            return;
        }

        // Create chart
        createChart(canvas, klineData);
        
        // Update chart every 60 seconds
        chartUpdateInterval = setInterval(async () => {
            const newData = await fetchMexcKlineData('1h', 24);
            if (newData && mexcChart) {
                updateChartData(newData);
            }
        }, 60000);
        
        console.log('✅ MEXC chart initialized');
    } catch (error) {
        console.error('❌ MEXC chart initialization error:', error);
        showChartError(canvas);
    }
}

// Fetch kline (candlestick) data from MEXC API
async function fetchMexcKlineData(interval = '1h', limit = 24) {
    try {
        // Use your Cloudflare Worker proxy
        const response = await fetch('https://tics-price.yuskivvolodymyr.workers.dev/kline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                symbol: 'TICSUSDT',
                interval: interval,
                limit: limit
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Failed to fetch MEXC kline data:', error);
        return null;
    }
}

// Create Chart.js chart
function createChart(canvas, klineData) {
    const ctx = canvas.getContext('2d');
    
    // Prepare data
    const labels = klineData.map(candle => {
        const date = new Date(candle.timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });
    
    const prices = klineData.map(candle => parseFloat(candle.close));
    const volumes = klineData.map(candle => parseFloat(candle.volume));
    
    // Calculate color based on price change
    const priceColors = klineData.map((candle, i) => {
        if (i === 0) return 'rgba(251, 191, 36, 0.8)';
        return parseFloat(candle.close) >= parseFloat(klineData[i-1].close) 
            ? 'rgba(34, 197, 94, 0.8)' // Green
            : 'rgba(239, 68, 68, 0.8)'; // Red
    });
    
    mexcChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'TICS/USDT',
                data: prices,
                borderColor: '#FBBF24',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#FBBF24',
                pointHoverBorderColor: '#FFFFFF',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(13, 16, 23, 0.95)',
                    titleColor: '#FBBF24',
                    bodyColor: '#FFFFFF',
                    borderColor: '#FBBF24',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toFixed(6);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.06)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 8
                    }
                },
                y: {
                    position: 'right',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.06)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        callback: function(value) {
                            return '$' + value.toFixed(5);
                        }
                    }
                }
            }
        }
    });
}

// Update chart with new data
function updateChartData(newData) {
    if (!mexcChart || !newData || newData.length === 0) return;
    
    const labels = newData.map(candle => {
        const date = new Date(candle.timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });
    
    const prices = newData.map(candle => parseFloat(candle.close));
    
    mexcChart.data.labels = labels;
    mexcChart.data.datasets[0].data = prices;
    mexcChart.update('none'); // Update without animation for smooth feel
}

// Show error message
function showChartError(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Failed to load chart data', canvas.width / 2, canvas.height / 2);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (chartUpdateInterval) {
        clearInterval(chartUpdateInterval);
    }
    if (mexcChart) {
        mexcChart.destroy();
    }
});
