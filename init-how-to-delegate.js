/**
 * How To Delegate Page - Complete Script
 * Using direct chain ID value to avoid conflicts
 */

// Connect Wallet Function
async function connectWallet(walletType) {
    const chainId = 'qubetics_9030-1';
    const btn = document.getElementById(walletType === 'keplr' ? 'connectKeplrBtn' : 'connectCosmostationBtn');
    btn.innerHTML = '<span>⏳</span><span>Connecting...</span>';
    btn.style.pointerEvents = 'none';
    
    try {
        let address;
        
        if (walletType === 'keplr') {
            if (!window.keplr) {
                alert('Please install Keplr Wallet');
                btn.style.pointerEvents = 'auto';
                btn.innerHTML = '<img src="keplr.png" alt="Keplr" style="width: 28px; height: 28px; border-radius: 6px;"><span>Keplr Wallet</span>';
                return;
            }
            
            await window.keplr.enable(chainId);
            const offlineSigner = window.keplr.getOfflineSigner(chainId);
            const accounts = await offlineSigner.getAccounts();
            address = accounts[0].address;
            
        } else if (walletType === 'cosmostation') {
            if (!window.cosmostation) {
                alert('Please install Cosmostation Wallet');
                btn.style.pointerEvents = 'auto';
                btn.innerHTML = '<img src="Cosmostation.png" alt="Cosmostation" style="width: 28px; height: 28px; border-radius: 6px;"><span>Cosmostation</span>';
                return;
            }
            
            const provider = window.cosmostation.providers.keplr;
            await provider.enable(chainId);
            const offlineSigner = provider.getOfflineSigner(chainId);
            const accounts = await offlineSigner.getAccounts();
            address = accounts[0].address;
        }
        
        // Redirect to dashboard
        window.location.href = \`dashboard.html?wallet=\${walletType}&address=\${address}\`;
        
    } catch (error) {
        console.error('Wallet connection error:', error);
        alert('Connection error: ' + error.message);
        btn.style.pointerEvents = 'auto';
        btn.innerHTML = walletType === 'keplr' ? 
            '<img src="keplr.png" alt="Keplr" style="width: 28px; height: 28px; border-radius: 6px;"><span>Keplr Wallet</span>' : 
            '<img src="Cosmostation.png" alt="Cosmostation" style="width: 28px; height: 28px; border-radius: 6px;"><span>Cosmostation</span>';
    }
}

// Keplr Modal Functions
function openKeplrModal() {
    document.getElementById('keplrModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeKeplrModal() {
    document.getElementById('keplrModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ How To Delegate Page Initialized');
    
    // Wallet buttons
    const connectKeplrBtn = document.getElementById('connectKeplrBtn');
    if (connectKeplrBtn) {
        connectKeplrBtn.addEventListener('click', () => connectWallet('keplr'));
    }
    
    const connectCosmostationBtn = document.getElementById('connectCosmostationBtn');
    if (connectCosmostationBtn) {
        connectCosmostationBtn.addEventListener('click', () => connectWallet('cosmostation'));
    }
    
    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeKeplrModal();
        }
    });
    
    // Modal overlay
    const keplrModal = document.getElementById('keplrModal');
    if (keplrModal) {
        keplrModal.addEventListener('click', function(event) {
            if (event.target === this) {
                closeKeplrModal();
            }
        });
    }
    
    // Modal close button
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    modalCloseButtons.forEach(function(button) {
        button.addEventListener('click', closeKeplrModal);
    });
    
    // Guide links
    const guideLinks = document.querySelectorAll('a[href*="Guide"]');
    guideLinks.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            openKeplrModal();
        });
    });
    
    console.log('✅ How To Delegate event listeners attached');
});
