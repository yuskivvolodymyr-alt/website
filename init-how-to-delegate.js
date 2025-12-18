/**
 * How To Delegate Page Functions
 * CSP Compliant - No inline scripts or styles
 */

const CHAIN_ID = 'qubetics_9030-1';

// Helper function to create wallet button content (CSP compliant)
function createWalletButtonContent(walletType, isLoading = false) {
    if (isLoading) {
        return '<span>⏳</span><span>Connecting...</span>';
    }
    
    const iconSrc = walletType === 'keplr' ? 'keplr.png' : 'Cosmostation.png';
    const altText = walletType === 'keplr' ? 'Keplr' : 'Cosmostation';
    const labelText = walletType === 'keplr' ? 'Keplr Wallet' : 'Cosmostation';
    
    // Create elements instead of inline HTML with styles
    const img = document.createElement('img');
    img.src = iconSrc;
    img.alt = altText;
    img.className = 'wallet-button-icon';
    
    const span = document.createElement('span');
    span.textContent = labelText;
    
    // Return as HTML string (images and spans are safe)
    return img.outerHTML + span.outerHTML;
}

async function connectWallet(walletType) {
    const btn = document.getElementById(walletType === 'keplr' ? 'connectKeplrBtn' : 'connectCosmostationBtn');
    btn.innerHTML = createWalletButtonContent(walletType, true);
    btn.style.pointerEvents = 'none';
    
    try {
        let address;
        
        if (walletType === 'keplr') {
            if (!window.keplr) {
                alert('Please install Keplr Wallet');
                btn.style.pointerEvents = 'auto';
                btn.innerHTML = createWalletButtonContent('keplr', false);
                return;
            }
            
            await window.keplr.enable(CHAIN_ID);
            const offlineSigner = window.keplr.getOfflineSigner(CHAIN_ID);
            const accounts = await offlineSigner.getAccounts();
            address = accounts[0].address;
            
        } else if (walletType === 'cosmostation') {
            if (!window.cosmostation) {
                alert('Please install Cosmostation Wallet');
                btn.style.pointerEvents = 'auto';
                btn.innerHTML = createWalletButtonContent('cosmostation', false);
                return;
            }
            
            const provider = window.cosmostation.providers.keplr;
            await provider.enable(CHAIN_ID);
            const offlineSigner = provider.getOfflineSigner(CHAIN_ID);
            const accounts = await offlineSigner.getAccounts();
            address = accounts[0].address;
        }
        
        // Redirect to dashboard with wallet info
        window.location.href = `dashboard.html?wallet=${walletType}&address=${address}`;
        
    } catch (error) {
        console.error('Wallet connection error:', error);
        alert('Connection error: ' + error.message);
        btn.style.pointerEvents = 'auto';
        btn.innerHTML = createWalletButtonContent(walletType, false);
    }
}

function openKeplrModal() {
    document.getElementById('keplrModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeKeplrModal() {
    document.getElementById('keplrModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeKeplrModal();
    }
});
