/**
 * Calculator Page - Complete Script
 * Functions are global to be accessible from HTML
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

function calculateAuto() {
    const amountInput = document.getElementById('amount');
    const amount = parseFloat(amountInput.value.replace(/,/g, ''));
    
    if (!amount || amount <= 0) {
        document.getElementById('result').innerHTML = '<p style="color: #ff6b6b;">Please enter a valid amount</p>';
        return;
    }
    
    let days = 0;
    const periodSelect = document.getElementById('period');
    const customDaysInput = document.getElementById('customDays');
    
    if (periodSelect.value) {
        days = parseInt(periodSelect.value);
    } else if (customDaysInput.value) {
        days = parseInt(customDaysInput.value);
    }
    
    if (!days || days <= 0) {
        document.getElementById('result').innerHTML = '<p style="color: #ff6b6b;">Please select or enter a valid staking period</p>';
        return;
    }
    
    // Use custom price if set, otherwise use current market price
    const priceToUse = userCustomPrice !== null ? userCustomPrice : currentTicsPrice;
    
    const apy = 0.28;
    const initialInvestmentUSD = amount * priceToUse;
    const dailyRate = Math.pow(1 + apy, 1/365) - 1;
    const finalAmount = amount * Math.pow(1 + dailyRate, days);
    const profit = finalAmount - amount;
    const profitUSD = profit * priceToUse;
    const totalValueUSD = finalAmount * priceToUse;
    
    const resultHTML = `
        <div class="result-card">
            <h3>📊 Staking Results (${days} days)</h3>
            <div class="result-row">
                <span>Initial Investment:</span>
                <span>${amount.toLocaleString('en-US', {maximumFractionDigits: 2})} TICS ($${initialInvestmentUSD.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})})</span>
            </div>
            <div class="result-row highlight">
                <span>Final Amount:</span>
                <span>${finalAmount.toLocaleString('en-US', {maximumFractionDigits: 2})} TICS ($${totalValueUSD.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})})</span>
            </div>
            <div class="result-row profit">
                <span>Total Profit:</span>
                <span>+${profit.toLocaleString('en-US', {maximumFractionDigits: 2})} TICS ($${profitUSD.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})})</span>
            </div>
            <p class="note">
                💡 Price used: $${priceToUse.toFixed(6)} per TICS ${userCustomPrice !== null ? '(custom)' : '(current market)'}
            </p>
        </div>
    `;
    
    document.getElementById('result').innerHTML = resultHTML;
}

function updatePrice() {
    const customPriceInput = document.getElementById('customPrice');
    const priceValue = parseFloat(customPriceInput.value);
    
    if (priceValue && priceValue > 0) {
        userCustomPrice = priceValue;
        document.getElementById('priceDisplay').textContent = `$${priceValue.toFixed(6)}`;
        document.getElementById('priceSource').textContent = '(Custom price)';
    }
    
    calculateAuto();
}

function resetPrice() {
    userCustomPrice = null;
    document.getElementById('customPrice').value = '';
    document.getElementById('priceDisplay').textContent = `$${currentTicsPrice.toFixed(6)}`;
    document.getElementById('priceSource').textContent = '(Current market price)';
    calculateAuto();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Calculator Page Initialized');
    
    // Preset amount buttons
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const text = this.textContent.trim();
            const value = text.replace(/[^0-9]/g, '');
            setAmount(value);
        });
    });
    
    // Amount input
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.addEventListener('input', calculateAuto);
    }
    
    // Period select
    const periodSelect = document.getElementById('period');
    if (periodSelect) {
        periodSelect.addEventListener('change', usePeriod);
    }
    
    // Custom days input
    const customDaysInput = document.getElementById('customDays');
    if (customDaysInput) {
        customDaysInput.addEventListener('input', useCustomDays);
    }
    
    // Price controls
    const updatePriceBtn = document.getElementById('updatePrice');
    if (updatePriceBtn) {
        updatePriceBtn.addEventListener('click', updatePrice);
    }
    
    const resetPriceBtn = document.getElementById('resetPrice');
    if (resetPriceBtn) {
        resetPriceBtn.addEventListener('click', resetPrice);
    }
    
    // Initial price display
    document.getElementById('priceDisplay').textContent = `$${currentTicsPrice.toFixed(6)}`;
    
    console.log('✅ Calculator event listeners attached');
});
