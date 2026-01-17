/**
 * MetaMask Connector for QubeNode Validator
 * Integrates MetaMask wallet for EVM-compatible Qubetics staking
 * 
 * IMPORTANT: This file is standalone and does NOT modify existing Keplr/Cosmostation functionality
 */

class MetaMaskConnector {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null; // EVM address
        this.cosmosAddress = null; // Cosmos bech32 address
        this.connected = false;
        
        // Qubetics Network Configuration for MetaMask
        this.networkConfig = {
            chainId: '0x234E', // 9038 in hex (qubetics_9030-1 → chain 9038)
            chainName: 'Qubetics Network',
            nativeCurrency: {
                name: 'TICS',
                symbol: 'TICS',
                decimals: 18
            },
            rpcUrls: ['https://rpc.qubetics.com'],
            blockExplorerUrls: ['https://v2.ticsscan.com']
        };
        
        // REST API endpoint
        this.restUrl = 'https://swagger.qubetics.com';
        
        // Staking Precompile Addresses
        this.STAKING_PRECOMPILE = '0x0000000000000000000000000000000000000800';
        this.DISTRIBUTION_PRECOMPILE = '0x0000000000000000000000000000000000000801';
        
        // QubeNode Validator Address (from chain-config.js)
        this.VALIDATOR_ADDRESS = 'qubeticsvaloper1tzk9f84cv2gmk3du3m9dpxcuph70sfj6uf6kld';
        
        console.log('🦊 MetaMask Connector initialized');
    }
    
    /**
     * Convert EVM address (0x...) to Cosmos address (qubetics...)
     * Uses bech32 encoding
     */
    evmToCosmos(evmAddress, prefix = 'qubetics') {
        const hex = evmAddress.toLowerCase().replace('0x', '');
        const bytes = [];
        for (let i = 0; i < hex.length; i += 2) {
            bytes.push(parseInt(hex.substr(i, 2), 16));
        }
        
        // Convert bits from 8 to 5
        const converted = this.convertBits(bytes, 8, 5);
        
        // Encode to bech32
        return this.bech32Encode(prefix, converted);
    }
    
    /**
     * Convert bits helper
     */
    convertBits(data, fromBits, toBits) {
        let acc = 0;
        let bits = 0;
        const result = [];
        const maxv = (1 << toBits) - 1;
        
        for (const value of data) {
            acc = (acc << fromBits) | value;
            bits += fromBits;
            
            while (bits >= toBits) {
                bits -= toBits;
                result.push((acc >> bits) & maxv);
            }
        }
        
        if (bits > 0) {
            result.push((acc << (toBits - bits)) & maxv);
        }
        
        return result;
    }
    
    /**
     * Bech32 encode
     */
    bech32Encode(prefix, data) {
        const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
        const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
        
        const polymod = (values) => {
            let chk = 1;
            for (const value of values) {
                const top = chk >> 25;
                chk = ((chk & 0x1ffffff) << 5) ^ value;
                for (let i = 0; i < 5; i++) {
                    if ((top >> i) & 1) {
                        chk ^= GENERATOR[i];
                    }
                }
            }
            return chk;
        };
        
        const hrpExpand = (hrp) => {
            const result = [];
            for (let i = 0; i < hrp.length; i++) {
                result.push(hrp.charCodeAt(i) >> 5);
            }
            result.push(0);
            for (let i = 0; i < hrp.length; i++) {
                result.push(hrp.charCodeAt(i) & 31);
            }
            return result;
        };
        
        const createChecksum = (hrp, data) => {
            const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
            const mod = polymod(values) ^ 1;
            const result = [];
            for (let i = 0; i < 6; i++) {
                result.push((mod >> (5 * (5 - i))) & 31);
            }
            return result;
        };
        
        const checksum = createChecksum(prefix, data);
        const combined = data.concat(checksum);
        
        let result = prefix + '1';
        for (const value of combined) {
            result += CHARSET.charAt(value);
        }
        
        return result;
    }
    
    /**
     * Check if MetaMask is installed
     */
    isMetaMaskInstalled() {
        return typeof window !== 'undefined' && 
               typeof window.ethereum !== 'undefined' && 
               window.ethereum.isMetaMask;
    }
    
    /**
     * Connect to MetaMask wallet
     */
    async connect() {
        try {
            if (!this.isMetaMaskInstalled()) {
                throw new Error('MetaMask не встановлено. Будь ласка, встановіть розширення MetaMask.');
            }
            
            console.log('🔗 Connecting to MetaMask...');
            
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length === 0) {
                throw new Error('No accounts found in MetaMask');
            }
            
            this.address = accounts[0];
            this.provider = window.ethereum;
            
            // Convert EVM address to Cosmos address for REST API
            this.cosmosAddress = this.evmToCosmos(this.address, 'qubetics');
            console.log('🔄 Converted address:', this.address, '→', this.cosmosAddress);
            
            // Try to switch to Qubetics network
            await this.switchToQubeticsNetwork();
            
            // Setup ethers provider and signer
            if (typeof ethers !== 'undefined') {
                const ethersProvider = new ethers.BrowserProvider(window.ethereum);
                this.signer = await ethersProvider.getSigner();
            }
            
            this.connected = true;
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ MetaMask connected:', this.address);
            
            return {
                success: true,
                address: this.address,
                wallet: 'MetaMask'
            };
            
        } catch (error) {
            console.error('❌ MetaMask connection failed:', error);
            throw new Error(error.message || 'Failed to connect to MetaMask');
        }
    }
    
    /**
     * Switch to Qubetics Network or add it if not exists
     */
    async switchToQubeticsNetwork() {
        try {
            // Try to switch to the network
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.networkConfig.chainId }],
            });
            
            console.log('✅ Switched to Qubetics Network');
            
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [this.networkConfig],
                    });
                    
                    console.log('✅ Qubetics Network added to MetaMask');
                    
                } catch (addError) {
                    console.error('Failed to add Qubetics Network:', addError);
                    throw addError;
                }
            } else {
                throw switchError;
            }
        }
    }
    
    /**
     * Setup event listeners for account and network changes
     */
    setupEventListeners() {
        if (!this.provider) return;
        
        // Account changed
        this.provider.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                console.log('🔌 MetaMask disconnected');
                this.disconnect();
            } else {
                this.address = accounts[0];
                console.log('🔄 Account changed:', this.address);
                // Trigger refresh if callback exists
                if (window.cosmosStaking && typeof window.cosmosStaking.refresh === 'function') {
                    window.cosmosStaking.refresh();
                }
            }
        });
        
        // Network changed
        this.provider.on('chainChanged', (chainId) => {
            console.log('🔄 Network changed:', chainId);
            // Reload the page when network changes
            window.location.reload();
        });
    }
    
    /**
     * Disconnect MetaMask
     */
    disconnect() {
        this.address = null;
        this.signer = null;
        this.connected = false;
        
        console.log('🔌 MetaMask disconnected');
        
        return { success: true };
    }
    
    /**
     * Get current connection status
     */
    isConnected() {
        return this.connected && this.address !== null;
    }
    
    /**
     * Get wallet info
     */
    getWalletInfo() {
        return {
            connected: this.isConnected(),
            address: this.address,
            walletType: 'metamask',
            isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        };
    }
    
    /**
     * Get current address
     */
    getAddress() {
        if (!this.address) {
            throw new Error('Wallet not connected. Please connect MetaMask first.');
        }
        return this.address;
    }
    
    /**
     * Get balance in TICS using REST API with Cosmos address
     */
    async getBalance() {
        try {
            if (!this.cosmosAddress) {
                throw new Error('Cosmos address not available');
            }
            
            // Use REST API instead of eth_getBalance
            const response = await fetch(
                `${this.restUrl}/cosmos/bank/v1beta1/balances/${this.cosmosAddress}`
            );
            
            if (!response.ok) {
                throw new Error(`Failed to fetch balance: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Find TICS balance
            const ticsBalance = data.balances.find(b => b.denom === 'tics');
            
            return {
                denom: 'tics',
                amount: ticsBalance ? ticsBalance.amount : '0'
            };
            
        } catch (error) {
            console.error('Error fetching balance:', error);
            // Return 0 balance on error instead of throwing
            return {
                denom: 'tics',
                amount: '0'
            };
        }
    }
    
    /**
     * Get delegations using REST API with Cosmos address
     */
    async getDelegations() {
        try {
            if (!this.cosmosAddress) {
                throw new Error('Cosmos address not available');
            }
            
            const response = await fetch(
                `${this.restUrl}/cosmos/staking/v1beta1/delegations/${this.cosmosAddress}`
            );
            
            if (!response.ok) {
                throw new Error(`Failed to fetch delegations: ${response.status}`);
            }
            
            const data = await response.json();
            return data.delegation_responses || [];
            
        } catch (error) {
            console.error('Error fetching delegations:', error);
            return [];
        }
    }
    
    /**
     * Get rewards using REST API with Cosmos address
     */
    async getRewards() {
        try {
            if (!this.cosmosAddress) {
                throw new Error('Cosmos address not available');
            }
            
            const response = await fetch(
                `${this.restUrl}/cosmos/distribution/v1beta1/delegators/${this.cosmosAddress}/rewards`
            );
            
            if (!response.ok) {
                throw new Error(`Failed to fetch rewards: ${response.status}`);
            }
            
            const data = await response.json();
            return data || { rewards: [], total: [] };
            
        } catch (error) {
            console.error('Error fetching rewards:', error);
            return { rewards: [], total: [] };
        }
    }
    
    /**
     * Get unbonding delegations using REST API with Cosmos address
     */
    async getUnbondingDelegations() {
        try {
            if (!this.cosmosAddress) {
                throw new Error('Cosmos address not available');
            }
            
            const response = await fetch(
                `${this.restUrl}/cosmos/staking/v1beta1/delegators/${this.cosmosAddress}/unbonding_delegations`
            );
            
            if (!response.ok) {
                throw new Error(`Failed to fetch unbonding delegations: ${response.status}`);
            }
            
            const data = await response.json();
            return data.unbonding_responses || [];
            
        } catch (error) {
            console.error('Error fetching unbonding delegations:', error);
            return [];
        }
    }
    
    /**
     * Delegate TICS to validator (via staking precompile)
     * @param {string} validatorAddress - Validator operator address
     * @param {string} amountMinimal - Amount in minimal units (18 decimals)
     */
    async delegate(validatorAddress, amountMinimal) {
        try {
            if (!this.signer) {
                throw new Error('Signer not initialized');
            }
            
            console.log('🔷 Delegating via MetaMask...');
            console.log('   Validator:', validatorAddress);
            console.log('   Amount (minimal):', amountMinimal);
            
            // Staking precompile ABI for delegate function
            const stakingABI = [
                "function delegate(address delegator, string calldata validator, uint256 amount) external returns (bool)"
            ];
            
            const stakingContract = new ethers.Contract(
                this.STAKING_PRECOMPILE,
                stakingABI,
                this.signer
            );
            
            // Call delegate function
            const tx = await stakingContract.delegate(
                this.address,
                validatorAddress,
                BigInt(amountMinimal),
                {
                    gasLimit: 250000
                }
            );
            
            console.log('📤 Transaction submitted:', tx.hash);
            
            // Wait for confirmation
            const receipt = await tx.wait();
            
            console.log('✅ Transaction confirmed:', receipt);
            
            return {
                success: true,
                hash: tx.hash,
                receipt: receipt
            };
            
        } catch (error) {
            console.error('❌ Delegation failed:', error);
            throw error;
        }
    }
    
    /**
     * Undelegate TICS from validator
     */
    async undelegate(validatorAddress, amountMinimal) {
        try {
            if (!this.signer) {
                throw new Error('Signer not initialized');
            }
            
            console.log('🔷 Undelegating via MetaMask...');
            
            const stakingABI = [
                "function undelegate(address delegator, string calldata validator, uint256 amount) external returns (bool)"
            ];
            
            const stakingContract = new ethers.Contract(
                this.STAKING_PRECOMPILE,
                stakingABI,
                this.signer
            );
            
            const tx = await stakingContract.undelegate(
                this.address,
                validatorAddress,
                BigInt(amountMinimal),
                {
                    gasLimit: 300000
                }
            );
            
            console.log('📤 Undelegate transaction submitted:', tx.hash);
            
            const receipt = await tx.wait();
            
            return {
                success: true,
                hash: tx.hash,
                receipt: receipt
            };
            
        } catch (error) {
            console.error('❌ Undelegation failed:', error);
            throw error;
        }
    }
    
    /**
     * Claim rewards from validator
     */
    async claimRewards(validatorAddress) {
        try {
            if (!this.signer) {
                throw new Error('Signer not initialized');
            }
            
            console.log('🔷 Claiming rewards via MetaMask...');
            
            const distributionABI = [
                "function withdrawDelegatorReward(address delegator, string calldata validator) external returns (bool)"
            ];
            
            const distributionContract = new ethers.Contract(
                this.DISTRIBUTION_PRECOMPILE,
                distributionABI,
                this.signer
            );
            
            const tx = await distributionContract.withdrawDelegatorReward(
                this.address,
                validatorAddress,
                {
                    gasLimit: 200000
                }
            );
            
            console.log('📤 Claim rewards transaction submitted:', tx.hash);
            
            const receipt = await tx.wait();
            
            return {
                success: true,
                hash: tx.hash,
                receipt: receipt
            };
            
        } catch (error) {
            console.error('❌ Claim rewards failed:', error);
            throw error;
        }
    }
}

// Export for browser usage
if (typeof window !== 'undefined') {
    window.MetaMaskConnector = MetaMaskConnector;
    console.log('✅ MetaMask Connector loaded');
}
