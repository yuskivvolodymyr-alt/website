/**
 * Calculator Page Functions
 * CSP Compliant - No inline scripts or styles
 */

let currentTicsPrice = 0.047190;
let userCustomPrice = null;

function setAmount(value) {
    document.getElementById('amount').value = value;
    calculateAuto();
}

function usePeriod() {
    const period = document.getElementById('period').value;
    if (period) {
        document.getElementById('customDays').value = '';
        calculateAuto();
    }
}

function useCustomDays() {
    const days = parseInt(document.getElementById('customDays').value);
    if (days && days > 0) {
        document.getElementById('period').value = '';
        calculateAuto();
    }
}

function useCustomPrice() {
    const price = parseFloat(document.getElementById('customPrice').value);
    if (price && price > 0) {
        userCustomPrice = price;
        calculateAuto();
    } else {
        userCustomPrice = null;
        calculateAuto();
    }
}

// Helper function to create amount display with sub-value (CSP compliant)
function createAmountHTML(amount, priceToUse, cssClass) {
    const tics = amount.toLocaleString();
    const usd = (amount * priceToUse).toFixed(2);
    const span = document.createElement('span');
    span.className = cssClass;
    span.textContent = '($' + usd + ')';
    return tics + ' TICS<br>' + span.outerHTML;
}

function calculateAuto() {
    const amount = parseFloat(document.getElementById('amount').value);
    let period = parseInt(document.getElementById('period').value);
    const customDays = parseInt(document.getElementById('customDays').value);
    const compoundFreq = document.getElementById('compoundFrequency').value;
    
    if (customDays && customDays > 0) {
        period = customDays / 30;
    }
    
    if (!amount || amount <= 0 || !period || period <= 0) {
        document.getElementById('calcResults').style.display = 'none';
        return;
    }
    
    const priceToUse = userCustomPrice || currentTicsPrice;
    
    const APY = 30;
    const COMMISSION = 5;
    const NET_APY = APY * (1 - COMMISSION / 100);
    const ANNUAL_RATE = NET_APY / 100;
    
    let finalAmount, totalReward, compoundsPerYear, compoundText;
    
    if (compoundFreq === 'none') {
        const monthlyRate = ANNUAL_RATE / 12;
        const monthlyReward = amount * monthlyRate;
        totalReward = monthlyReward * period;
        finalAmount = amount + totalReward;
        compoundText = 'No compounding';
    } else {
        switch(compoundFreq) {
            case 'daily': compoundsPerYear = 365; compoundText = 'Daily (manual)'; break;
            case 'weekly': compoundsPerYear = 52; compoundText = 'Weekly (manual)'; break;
            case 'monthly': compoundsPerYear = 12; compoundText = 'Monthly (manual)'; break;
            case 'quarterly': compoundsPerYear = 4; compoundText = 'Quarterly (manual)'; break;
        }
        
        const ratePerPeriod = ANNUAL_RATE / compoundsPerYear;
        const totalPeriods = compoundsPerYear * (period / 12);
        finalAmount = amount * Math.pow(1 + ratePerPeriod, totalPeriods);
        totalReward = finalAmount - amount;
    }
    
    const daysInPeriod = (period / 12) * 365;
    const dailyReward = totalReward / daysInPeriod;
    const weeklyReward = dailyReward * 7;
    const monthlyReward = totalReward / period;
    
    document.getElementById('calcResults').style.display = 'block';
    
    document.getElementById('dailyResult').textContent = dailyReward.toFixed(2) + ' TICS';
    document.getElementById('dailyUSD').textContent = '$' + (dailyReward * priceToUse).toFixed(2);
    
    document.getElementById('weeklyResult').textContent = weeklyReward.toFixed(2) + ' TICS';
    document.getElementById('weeklyUSD').textContent = '$' + (weeklyReward * priceToUse).toFixed(2);
    
    document.getElementById('monthlyResult').textContent = monthlyReward.toFixed(2) + ' TICS';
    document.getElementById('monthlyUSD').textContent = '$' + (monthlyReward * priceToUse).toFixed(2);
    
    document.getElementById('totalResult').textContent = totalReward.toFixed(2) + ' TICS';
    document.getElementById('totalUSD').textContent = '$' + (totalReward * priceToUse).toFixed(2);
    
    const netReward = totalReward;
    const grossReward = netReward / 0.95;
    const validatorCommission = grossReward - netReward;
    
    // Use helper function to create amounts with proper CSS classes
    document.getElementById('initialAmount').innerHTML = createAmountHTML(amount, priceToUse, 'amount-sub-white');
    document.getElementById('periodText').textContent = getPeriodText(period, customDays);
    document.getElementById('compoundText').textContent = compoundText;
    
    document.getElementById('totalRewardAmount').innerHTML = createAmountHTML(grossReward, priceToUse, 'amount-sub-green');
    document.getElementById('validatorCommissionAmount').innerHTML = createAmountHTML(validatorCommission, priceToUse, 'amount-sub-yellow');
    document.getElementById('netRewardAmount').innerHTML = createAmountHTML(netReward, priceToUse, 'amount-sub-green');
    document.getElementById('finalAmount').innerHTML = createAmountHTML(finalAmount, priceToUse, 'amount-sub-green');
    
    // Calculate real APY based on compound frequency using NET_APY
    const NET_APY_DECIMAL = NET_APY / 100;
    let realAPY;
    if (compoundFreq === 'none') {
        realAPY = NET_APY;
    } else {
        const n = compoundsPerYear;
        const effectiveRate = Math.pow(1 + NET_APY_DECIMAL / n, n) - 1;
        realAPY = effectiveRate * 100;
    }
    document.getElementById('realAPY').textContent = realAPY.toFixed(2) + '%';
    
    // Comparison section
    if (compoundFreq !== 'none') {
        const withoutCompoundReward = amount * ANNUAL_RATE * (period / 12);
        const withoutCompoundFinal = amount + withoutCompoundReward;
        const benefit = finalAmount - withoutCompoundFinal;
        
        document.getElementById('compoundComparison').style.display = 'grid';
        
        document.getElementById('withoutCompound').textContent = withoutCompoundFinal.toFixed(2) + ' TICS';
        document.getElementById('withoutCompoundUSD').textContent = '($' + (withoutCompoundFinal * priceToUse).toFixed(2) + ')';
        
        document.getElementById('withCompound').textContent = finalAmount.toFixed(2) + ' TICS';
        document.getElementById('withCompoundUSD').textContent = '($' + (finalAmount * priceToUse).toFixed(2) + ')';
        
        document.getElementById('compoundBenefit').innerHTML = createAmountHTML(benefit, priceToUse, 'amount-sub-green');
    } else {
        document.getElementById('compoundComparison').style.display = 'none';
    }
}

function getPeriodText(months, days) {
    if (days) {
        if (days === 1) return '1 day';
        if (days < 30) return days + ' days';
        return (days / 30).toFixed(1) + ' months';
    }
    if (months === 1) return '1 month';
    if (months === 3) return '3 months';
    if (months === 6) return '6 months';
    if (months === 12) return '1 year';
    if (months === 24) return '2 years';
    if (months === 36) return '3 years';
    if (months === 48) return '4 years';
    if (months === 60) return '5 years';
    return months.toFixed(1) + ' months';
}

// Fetch price from MEXC
async function fetchTicsPrice() {
    try {
        console.log('🔄 Fetching TICS price from MEXC...');
        
        const corsProxy = "https://corsproxy.io/?";
        const mexcUrl = "https://api.mexc.com/api/v3/ticker/24hr?symbol=TICSUSDT";
        const proxiedUrl = corsProxy + encodeURIComponent(mexcUrl);
        
        const response = await fetch(proxiedUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('📊 MEXC response:', data);
        
        if (data && data.lastPrice) {
            currentTicsPrice = parseFloat(data.lastPrice);
            const priceElement = document.getElementById('currentPriceDisplay');
            if (priceElement) {
                priceElement.textContent = currentTicsPrice.toFixed(4);
                // Highlight update with class instead of inline style
                priceElement.style.color = '#00FFF0';
                setTimeout(() => priceElement.style.color = '', 500);
            }
            if (document.getElementById('calcResults').style.display !== 'none') {
                calculateAuto();
            }
            console.log('✅ TICS price loaded:', currentTicsPrice);
        } else {
            console.warn('⚠️ Invalid price data from MEXC');
            setFallbackPrice();
        }
    } catch (error) {
        console.error('❌ Error fetching TICS price:', error);
        setFallbackPrice();
    }
}

function setFallbackPrice() {
    if (!currentTicsPrice || currentTicsPrice === 0.038) {
        currentTicsPrice = 0.038;
        document.getElementById('currentPriceDisplay').textContent = currentTicsPrice.toFixed(4);
        console.log('Using fallback price:', currentTicsPrice);
    }
}

// Fetch price on load and every 30 seconds
fetchTicsPrice();
setInterval(fetchTicsPrice, 30000);
