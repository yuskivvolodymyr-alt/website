/**
 * MEXC Chart Implementation with Lightweight Charts
 * Professional candlestick chart like competitors
 * CSP-compliant, secure, self-hosted
 */

let chart = null;
let candlestickSeries = null;
let volumeSeries = null;
let chartUpdateInterval = null;

// Chart configuration
const CHART_CONFIG = {
    layout: {
        background: { color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.7)',
    },
    grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.06)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.06)' },
    },
    crosshair: {
        mode: 0, // Normal crosshair
        vertLine: {
            color: 'rgba(251, 191, 36, 0.5)',
            width: 1,
            style: 1,
            labelBackgroundColor: '#FBBF24',
        },
        horzLine: {
            color: 'rgba(251, 191, 36, 0.5)',
            width: 1,
            style: 1,
            labelBackgroundColor: '#FBBF24',
        },
    },
    rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: {
            top: 0.1,
            bottom: 0.2,
        },
    },
    timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
    },
    handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
    },
    handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
    },
};

// Initialize MEXC Chart
async function initMexcChart() {
    const container = document.getElementById('mexc-chart');
    if (!container) {
        console.warn('⚠️ MEXC chart container not found');
        return;
    }

    try {
        // Create chart
        chart = LightweightCharts.createChart(container, {
            ...CHART_CONFIG,
            width: container.clientWidth,
            height: 460,
        });

        // Add candlestick series
        candlestickSeries = chart.addCandlestickSeries({
            upColor: '#22C55E',
            downColor: '#EF4444',
            borderUpColor: '#22C55E',
            borderDownColor: '#EF4444',
            wickUpColor: '#22C55E',
            wickDownColor: '#EF4444',
        });

        // Add volume series
        volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '', // Empty string for overlay
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        // Fetch initial data
        const klineData = await fetchMexcKlineData('60', 100); // 100 1-hour candles
        
        if (!klineData || klineData.length === 0) {
            showChartError(container);
            return;
        }

        // Format and set data
        const candleData = formatCandleData(klineData);
        const volumeData = formatVolumeData(klineData);
        
        candlestickSeries.setData(candleData);
        volumeSeries.setData(volumeData);

        // Fit content
        chart.timeScale().fitContent();

        // Handle window resize
        window.addEventListener('resize', handleResize);

        // Update chart every 60 seconds
        chartUpdateInterval = setInterval(async () => {
            const newData = await fetchMexcKlineData('60', 1); // Last candle
            if (newData && newData.length > 0) {
                updateChartData(newData[0]);
            }
        }, 60000);
        
        console.log('✅ MEXC Lightweight Chart initialized');
    } catch (error) {
        console.error('❌ MEXC chart initialization error:', error);
        showChartError(container);
    }
}

// Fetch kline data from MEXC API via proxy
async function fetchMexcKlineData(interval = '60', limit = 100) {
    try {
        // MEXC API через CORS proxy
        const url = `https://corsproxy.io/?${encodeURIComponent(
            `https://api.mexc.com/api/v3/klines?symbol=TICSUSDT&interval=${interval}m&limit=${limit}`
        )}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // MEXC returns: [timestamp, open, high, low, close, volume, ...]
        return data.map(candle => ({
            time: Math.floor(candle[0] / 1000), // Convert to seconds
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[5])
        }));
    } catch (error) {
        console.error('❌ Failed to fetch MEXC kline data:', error);
        return null;
    }
}

// Format data for candlestick series
function formatCandleData(klineData) {
    return klineData.map(candle => ({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
    }));
}

// Format data for volume series
function formatVolumeData(klineData) {
    return klineData.map(candle => ({
        time: candle.time,
        value: candle.volume,
        color: candle.close >= candle.open 
            ? 'rgba(34, 197, 94, 0.5)' // Green for up
            : 'rgba(239, 68, 68, 0.5)', // Red for down
    }));
}

// Update chart with new candle
function updateChartData(newCandle) {
    if (!candlestickSeries || !volumeSeries || !newCandle) return;
    
    const candleData = {
        time: newCandle.time,
        open: newCandle.open,
        high: newCandle.high,
        low: newCandle.low,
        close: newCandle.close,
    };
    
    const volumeData = {
        time: newCandle.time,
        value: newCandle.volume,
        color: newCandle.close >= newCandle.open 
            ? 'rgba(34, 197, 94, 0.5)' 
            : 'rgba(239, 68, 68, 0.5)',
    };
    
    candlestickSeries.update(candleData);
    volumeSeries.update(volumeData);
}

// Handle window resize
function handleResize() {
    if (!chart) return;
    const container = document.getElementById('mexc-chart');
    if (container) {
        chart.applyOptions({
            width: container.clientWidth,
        });
    }
}

// Show error message
function showChartError(container) {
    container.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: rgba(239, 68, 68, 0.8);
            font-size: 16px;
            font-family: 'Poppins', sans-serif;
        ">
            ⚠️ Failed to load chart data
        </div>
    `;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (chartUpdateInterval) {
        clearInterval(chartUpdateInterval);
    }
    if (chart) {
        chart.remove();
    }
    window.removeEventListener('resize', handleResize);
});
