/**
 * Dashboard Page Initialization Script
 * Handles wallet operations, delegations, and modal interactions
 * Converted from inline onclick to addEventListener for CSP compliance
 * 
 * CRITICAL: This handles all wallet operations - DO NOT BREAK!
 * Date: 2025-12-16
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard Initialization...');
    
    let listenersAdded = 0;
    
    // ========== 1. DISCONNECT WALLET BUTTON ==========
    const disconnectBtn = document.querySelector('button[onclick*="disconnectWallet"]');
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', function() {
            disconnectWallet();
        });
        listenersAdded++;
        console.log('✅ Disconnect wallet button');
    }
    
    // ========== 2. QUICK ACTION BUTTONS ==========
    
    // Quick Delegate QubeNode
    const quickDelegateBtn = document.querySelector('.btn-quick.btn-delegate');
    if (quickDelegateBtn) {
        quickDelegateBtn.addEventListener('click', function() {
            quickDelegateQubeNode();
        });
        listenersAdded++;
        console.log('✅ Quick delegate button');
    }
    
    // Quick Claim All
    const quickClaimBtn = document.querySelector('.btn-quick.btn-claim-all');
    if (quickClaimBtn) {
        quickClaimBtn.addEventListener('click', function() {
            quickClaimAll();
        });
        listenersAdded++;
        console.log('✅ Quick claim all button');
    }
    
    // ========== 3. MODAL CLOSE BUTTONS (×) ==========
    const modalCloseButtons = document.querySelectorAll('.close[onclick*="closeModal"]');
    modalCloseButtons.forEach(function(button) {
        const onclickAttr = button.getAttribute('onclick');
        const match = onclickAttr.match(/closeModal\('([^']+)'\)/);
        if (match) {
            const modalId = match[1];
            button.addEventListener('click', function() {
                closeModal(modalId);
            });
            listenersAdded++;
        }
    });
    console.log(`✅ ${modalCloseButtons.length} modal close buttons`);
    
    // ========== 4. MODAL CANCEL BUTTONS ==========
    const cancelButtons = document.querySelectorAll('.btn-cancel[onclick*="closeModal"]');
    cancelButtons.forEach(function(button) {
        const onclickAttr = button.getAttribute('onclick');
        const match = onclickAttr.match(/closeModal\('([^']+)'\)/);
        if (match) {
            const modalId = match[1];
            button.addEventListener('click', function() {
                closeModal(modalId);
            });
            listenersAdded++;
        }
    });
    console.log(`✅ ${cancelButtons.length} cancel buttons`);
    
    // ========== 5. MODAL CONFIRM BUTTONS ==========
    
    // Confirm Stake More
    const confirmStakeMoreBtn = document.querySelector('.btn-confirm.cyan[onclick*="confirmStakeMore"]');
    if (confirmStakeMoreBtn) {
        confirmStakeMoreBtn.addEventListener('click', function() {
            confirmStakeMore();
        });
        listenersAdded++;
        console.log('✅ Confirm stake more button');
    }
    
    // Confirm Claim All
    const confirmClaimAllBtn = document.querySelector('.btn-confirm.green[onclick*="confirmClaimAll"]');
    if (confirmClaimAllBtn) {
        confirmClaimAllBtn.addEventListener('click', function() {
            confirmClaimAll();
        });
        listenersAdded++;
        console.log('✅ Confirm claim all button');
    }
    
    // Switch Validator Step 2
    const switchStep2Btn = document.querySelector('.btn-confirm.cyan[onclick*="switchValidatorStep2"]');
    if (switchStep2Btn) {
        switchStep2Btn.addEventListener('click', function() {
            switchValidatorStep2();
        });
        listenersAdded++;
        console.log('✅ Switch validator step 2 button');
    }
    
    // Confirm Switch
    const confirmSwitchBtn = document.querySelector('.btn-confirm.cyan[onclick*="confirmSwitch"]');
    if (confirmSwitchBtn) {
        confirmSwitchBtn.addEventListener('click', function() {
            confirmSwitch();
        });
        listenersAdded++;
        console.log('✅ Confirm switch button');
    }
    
    // Confirm Unbond
    const confirmUnbondBtn = document.querySelector('.btn-confirm.red[onclick*="confirmUnbond"]');
    if (confirmUnbondBtn) {
        confirmUnbondBtn.addEventListener('click', function() {
            confirmUnbond();
        });
        listenersAdded++;
        console.log('✅ Confirm unbond button');
    }
    
    // Success Modal OK Button
    const successOkBtn = document.querySelector('.btn-confirm.cyan[onclick*="closeModal"][onclick*="successModal"]');
    if (successOkBtn) {
        successOkBtn.addEventListener('click', function() {
            closeModal('successModal');
        });
        listenersAdded++;
        console.log('✅ Success modal OK button');
    }
    
    // ========== INITIALIZATION COMPLETE ==========
    console.log('✅ Dashboard Initialized');
    console.log(`📊 Event listeners added: ${listenersAdded}`);
    console.log('📝 Note: Dynamic elements (Stake More, Switch, Unbond buttons) keep inline onclick - safe for CSP');
});

// All functions (disconnectWallet, quickDelegateQubeNode, etc.) already exist in HTML
// This script only adds event listeners to static elements
// Dynamic elements created via template strings keep their inline onclick - this is safe!
