/**
 * Dashboard Page Initialization Script - FIXED VERSION
 * Handles wallet operations, delegations, and modal interactions
 * Uses specific IDs for each button to ensure proper event attachment
 * 
 * Date: 2025-12-16 (FIXED)
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard Initialization...');
    
    let listenersAdded = 0;
    
    // ========== 1. DISCONNECT WALLET BUTTON ==========
    const disconnectBtn = document.getElementById('disconnectWalletBtn');
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', function() {
            disconnectWallet();
        });
        listenersAdded++;
    }
    
    // ========== 2. QUICK ACTION BUTTONS ==========
    const quickDelegateBtn = document.querySelector('.btn-quick.btn-delegate');
    if (quickDelegateBtn) {
        quickDelegateBtn.addEventListener('click', function() {
            quickDelegateQubeNode();
        });
        listenersAdded++;
    }
    
    const quickClaimBtn = document.querySelector('.btn-quick.btn-claim-all');
    if (quickClaimBtn) {
        quickClaimBtn.addEventListener('click', function() {
            quickClaimAll();
        });
        listenersAdded++;
    }
    
    // ========== 3. STAKE MORE MODAL ==========
    const closeStakeMore = document.getElementById('closeStakeMoreModal');
    if (closeStakeMore) {
        closeStakeMore.addEventListener('click', function() {
            closeModal('stakeMoreModal');
        });
        listenersAdded++;
    }
    
    const cancelStakeMore = document.getElementById('cancelStakeMore');
    if (cancelStakeMore) {
        cancelStakeMore.addEventListener('click', function() {
            closeModal('stakeMoreModal');
        });
        listenersAdded++;
    }
    
    const confirmStakeMore = document.getElementById('confirmStakeMore');
    if (confirmStakeMore) {
        confirmStakeMore.addEventListener('click', function() {
            confirmStakeMore();
        });
        listenersAdded++;
    }
    
    // ========== 4. CLAIM ALL MODAL ==========
    const closeClaimAll = document.getElementById('closeClaimAllModal');
    if (closeClaimAll) {
        closeClaimAll.addEventListener('click', function() {
            closeModal('claimAllModal');
        });
        listenersAdded++;
    }
    
    const cancelClaimAll = document.getElementById('cancelClaimAll');
    if (cancelClaimAll) {
        cancelClaimAll.addEventListener('click', function() {
            closeModal('claimAllModal');
        });
        listenersAdded++;
    }
    
    const confirmClaimAll = document.getElementById('confirmClaimAll');
    if (confirmClaimAll) {
        confirmClaimAll.addEventListener('click', function() {
            confirmClaimAll();
        });
        listenersAdded++;
    }
    
    // ========== 5. SWITCH VALIDATOR MODAL 1 ==========
    const closeSwitchModal1 = document.getElementById('closeSwitchModal1');
    if (closeSwitchModal1) {
        closeSwitchModal1.addEventListener('click', function() {
            closeModal('switchValidatorModal');
        });
        listenersAdded++;
    }
    
    const cancelSwitch1 = document.getElementById('cancelSwitch1');
    if (cancelSwitch1) {
        cancelSwitch1.addEventListener('click', function() {
            closeModal('switchValidatorModal');
        });
        listenersAdded++;
    }
    
    const nextSwitch = document.getElementById('nextSwitch');
    if (nextSwitch) {
        nextSwitch.addEventListener('click', function() {
            switchValidatorStep2();
        });
        listenersAdded++;
    }
    
    // ========== 6. SWITCH VALIDATOR MODAL 2 ==========
    const closeSwitchModal2 = document.getElementById('closeSwitchModal2');
    if (closeSwitchModal2) {
        closeSwitchModal2.addEventListener('click', function() {
            closeModal('switchValidatorModal2');
        });
        listenersAdded++;
    }
    
    const cancelSwitch2 = document.getElementById('cancelSwitch2');
    if (cancelSwitch2) {
        cancelSwitch2.addEventListener('click', function() {
            closeModal('switchValidatorModal2');
        });
        listenersAdded++;
    }
    
    const confirmSwitch = document.getElementById('confirmSwitch');
    if (confirmSwitch) {
        confirmSwitch.addEventListener('click', function() {
            confirmSwitch();
        });
        listenersAdded++;
    }
    
    // ========== 7. UNBOND MODAL ==========
    const closeUnbond = document.getElementById('closeUnbondModal');
    if (closeUnbond) {
        closeUnbond.addEventListener('click', function() {
            closeModal('unbondModal');
        });
        listenersAdded++;
    }
    
    const cancelUnbond = document.getElementById('cancelUnbond');
    if (cancelUnbond) {
        cancelUnbond.addEventListener('click', function() {
            closeModal('unbondModal');
        });
        listenersAdded++;
    }
    
    const confirmUnbond = document.getElementById('confirmUnbond');
    if (confirmUnbond) {
        confirmUnbond.addEventListener('click', function() {
            confirmUnbond();
        });
        listenersAdded++;
    }
    
    // ========== 8. SUCCESS MODAL ==========
    const closeSuccess = document.getElementById('closeSuccessModal');
    if (closeSuccess) {
        closeSuccess.addEventListener('click', function() {
            closeModal('successModal');
        });
        listenersAdded++;
    }
    
    const successOK = document.getElementById('successOK');
    if (successOK) {
        successOK.addEventListener('click', function() {
            closeModal('successModal');
        });
        listenersAdded++;
    }
    
    // ========== INITIALIZATION COMPLETE ==========
    console.log('✅ Dashboard Initialized');
    console.log(`📊 Event listeners added: ${listenersAdded}`);
    console.log('📝 Note: Dynamic elements (Stake More, Switch, Unbond buttons in delegations list) keep inline onclick - safe for CSP');
});
