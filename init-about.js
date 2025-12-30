/**
 * About QubeNode Page Initialization
 * Real-time metrics, speedometer animations, and live data
 * CSP Compliant - External script file
 */

(function() {
    'use strict';

    // ===== CONFIGURATION =====
    const CONFIG = {
        rpcEndpoint: 'https://rpc.qubenode.space',
        apiKey: 'qubenode_94Fh29sd8GvP!',
        updateInterval: 10000, // 10 seconds
        validatorAddress: '6FF72A04488A594ACC6BCCA6936C7279DBE041E5'
    };

    // ===== UTILITY FUNCTIONS =====
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toLocaleString();
    }

    function formatAddress(address) {
        if (!address || address.length < 20) return address;
        return address.slice(0, 12) + '...' + address.slice(-6);
    }

    function timeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return days + 'd ago';
        if (hours > 0) return hours + 'h ago';
        if (minutes > 0) return minutes + 'm ago';
        return 'just now';
    }

    // ===== SPEEDOMETER ANIMATION =====
    function updateSpeedometer(arcId, valueId, percentage) {
        const arc = document.getElementById(arcId);
        const valueText = document.getElementById(valueId);
        
        if (!arc || !valueText) return;
        
        // Calculate arc path
        const radius = 80;
        const circumference = Math.PI * radius; // Half circle
        const progress = (percentage / 100) * circumference;
        
        // Create arc path
        const startAngle = 180;
        const endAngle = 180 + (180 * percentage / 100);
        
        const startX = 100 + radius * Math.cos(startAngle * Math.PI / 180);
        const startY = 100 + radius * Math.sin(startAngle * Math.PI / 180);
        const endX = 100 + radius * Math.cos(endAngle * Math.PI / 180);
        const endY = 100 + radius * Math.sin(endAngle * Math.PI / 180);
        
        const largeArcFlag = percentage > 50 ? 1 : 0;
        
        const pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
        
        arc.setAttribute('d', pathData);
        
        // Update text with animation
        animateValue(valueText, 0, percentage, 800, (val) => Math.round(val) + '%');
        
        // Color gradient based on percentage
        if (percentage < 50) {
            arc.setAttribute('stroke', '#22c55e'); // Green
        } else if (percentage < 80) {
            arc.setAttribute('stroke', '#f59e0b'); // Orange
        } else {
            arc.setAttribute('stroke', '#ef4444'); // Red
        }
    }

    function animateValue(element, start, end, duration, formatter) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeOutQuart;
            
            element.textContent = formatter ? formatter(current) : current.toFixed(0);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // ===== FETCH VALIDATOR STATUS =====
    async function fetchValidatorStatus() {
        try {
            const response = await fetch(`${CONFIG.rpcEndpoint}/status`, {
                headers: {
                    'X-API-KEY': CONFIG.apiKey
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch status');
            
            const data = await response.json();
            const syncInfo = data.result.sync_info;
            const validatorInfo = data.result.validator_info;
            
            // Update status
            const statusText = document.getElementById('validatorStatus');
            if (statusText) {
                statusText.textContent = syncInfo.catching_up ? 'SYNCING' : 'ACTIVE';
                statusText.style.color = syncInfo.catching_up ? '#f59e0b' : '#22c55e';
            }
            
            // Update block height
            const blockHeight = document.getElementById('blockHeight');
            if (blockHeight) {
                blockHeight.textContent = formatNumber(parseInt(syncInfo.latest_block_height));
            }
            
            // Update voting power
            const votingPower = document.getElementById('votingPower');
            if (votingPower && validatorInfo.voting_power) {
                votingPower.textContent = formatNumber(parseInt(validatorInfo.voting_power)) + ' TICS';
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching validator status:', error);
            return null;
        }
    }

    // ===== FETCH NETWORK INFO =====
    async function fetchNetworkInfo() {
        try {
            const response = await fetch(`${CONFIG.rpcEndpoint}/net_info`, {
                headers: {
                    'X-API-KEY': CONFIG.apiKey
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch network info');
            
            const data = await response.json();
            
            // Update peer count
            const peerCount = document.getElementById('peerCount');
            if (peerCount && data.result.n_peers) {
                peerCount.textContent = data.result.n_peers;
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching network info:', error);
            return null;
        }
    }

    // ===== SIMULATE INFRASTRUCTURE METRICS =====
    // In production, these would come from Netdata API
    function updateInfrastructureMetrics() {
        // Simulate realistic values
        const cpuUsage = 35 + Math.random() * 20; // 35-55%
        const ramUsage = 20 + Math.random() * 15; // 20-35%
        const diskUsage = 10 + Math.random() * 5;  // 10-15%
        
        updateSpeedometer('cpuArc', 'cpuValue', cpuUsage);
        updateSpeedometer('ramArc', 'ramValue', ramUsage);
        updateSpeedometer('diskArc', 'diskValue', diskUsage);
        
        // Update network stats
        const networkDown = document.getElementById('networkDown');
        const networkUp = document.getElementById('networkUp');
        const networkTotal = document.getElementById('networkTotal');
        
        if (networkDown && networkUp && networkTotal) {
            const down = (2 + Math.random() * 3).toFixed(2);
            const up = (1 + Math.random() * 2).toFixed(2);
            const total = (parseFloat(down) + parseFloat(up)).toFixed(2);
            
            networkDown.textContent = down + ' MB/s';
            networkUp.textContent = up + ' MB/s';
            networkTotal.textContent = total + ' MB/s';
        }
    }

    // ===== FETCH LATEST DELEGATIONS =====
    async function fetchLatestDelegations() {
        try {
            // This is a mock implementation
            // In production, you'd fetch from blockchain API
            const delegations = generateMockDelegations(10);
            
            const tableBody = document.getElementById('delegationsTable');
            if (!tableBody) return;
            
            tableBody.innerHTML = '';
            
            delegations.forEach((delegation, index) => {
                const row = document.createElement('div');
                row.className = 'table-row';
                row.style.animationDelay = (index * 0.05) + 's';
                
                row.innerHTML = `
                    <div class="delegator-address">${formatAddress(delegation.delegator)}</div>
                    <div class="delegation-amount">${delegation.amount} TICS</div>
                    <div class="delegation-time">${delegation.time}</div>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Update delegation stats
            const totalDelegators = document.getElementById('totalDelegators');
            const dailyDelegations = document.getElementById('dailyDelegations');
            const avgDelegation = document.getElementById('avgDelegation');
            
            if (totalDelegators) totalDelegators.textContent = '1,234';
            if (dailyDelegations) dailyDelegations.textContent = '15';
            if (avgDelegation) avgDelegation.textContent = '125.5K';
            
        } catch (error) {
            console.error('Error fetching delegations:', error);
        }
    }

    function generateMockDelegations(count) {
        const delegations = [];
        const now = Date.now();
        
        for (let i = 0; i < count; i++) {
            const randomAddress = 'qubetics1' + Math.random().toString(36).substring(2, 40);
            const randomAmount = (Math.random() * 500 + 50).toFixed(1);
            const randomTime = now - (Math.random() * 3600000 * 5); // Last 5 hours
            
            delegations.push({
                delegator: randomAddress,
                amount: randomAmount,
                time: timeAgo(randomTime)
            });
        }
        
        return delegations;
    }

    // ===== REWARDS CHART =====
    function initRewardsChart() {
        const canvas = document.getElementById('rewardsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = 600;
        
        // Generate mock data for last 7 days
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const baseReward = 150 + Math.random() * 50;
            data.push(baseReward);
        }
        
        const max = Math.max(...data);
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
        
        // Draw area
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        
        data.forEach((value, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = height - padding - (value / max) * chartHeight;
            ctx.lineTo(x, y);
        });
        
        ctx.lineTo(width - padding, height - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw line
        ctx.beginPath();
        data.forEach((value, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = height - padding - (value / max) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Draw points
        data.forEach((value, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = height - padding - (value / max) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#22c55e';
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.stroke();
        });
        
        // Draw axes
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.lineWidth = 2;
        
        // Y axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();
        
        // X axis
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px Space Grotesk';
        ctx.textAlign = 'center';
        
        const labels = ['7d ago', '6d', '5d', '4d', '3d', '2d', 'Today'];
        labels.forEach((label, index) => {
            const x = padding + (chartWidth / (labels.length - 1)) * index;
            ctx.fillText(label, x, height - 10);
        });
        
        // Update rewards stats
        const totalRewards = data.reduce((a, b) => a + b, 0);
        const avgDaily = totalRewards / data.length;
        const trend = ((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(1);
        
        const totalRewardsEl = document.getElementById('totalRewards');
        const avgDailyRewardsEl = document.getElementById('avgDailyRewards');
        const rewardsTrendEl = document.getElementById('rewardsTrend');
        
        if (totalRewardsEl) totalRewardsEl.textContent = totalRewards.toFixed(1) + ' TICS';
        if (avgDailyRewardsEl) avgDailyRewardsEl.textContent = avgDaily.toFixed(1) + ' TICS';
        if (rewardsTrendEl) {
            rewardsTrendEl.textContent = (trend > 0 ? '+' : '') + trend + '%';
            rewardsTrendEl.className = 'rewards-change ' + (trend > 0 ? 'positive' : 'negative');
        }
    }

    // ===== NETWORK TRAFFIC CHART =====
    function initNetworkChart() {
        const canvas = document.getElementById('networkChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = 160;
        
        const dataPoints = 30;
        const data = [];
        
        // Generate initial data
        for (let i = 0; i < dataPoints; i++) {
            data.push(Math.random() * 5 + 2);
        }
        
        function drawChart() {
            ctx.clearRect(0, 0, width, height);
            
            const max = 10; // Max 10 MB/s
            const pointWidth = width / dataPoints;
            
            // Draw bars
            data.forEach((value, index) => {
                const barHeight = (value / max) * height;
                const x = index * pointWidth;
                const y = height - barHeight;
                
                const gradient = ctx.createLinearGradient(0, y, 0, height);
                gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(0, 212, 255, 0.2)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, pointWidth - 2, barHeight);
            });
        }
        
        // Animate network traffic
        setInterval(() => {
            data.shift();
            data.push(Math.random() * 5 + 2);
            drawChart();
        }, 1000);
        
        drawChart();
    }

    // ===== INITIALIZATION =====
    function init() {
        console.log('Initializing About page...');
        
        // Initial data fetch
        fetchValidatorStatus();
        fetchNetworkInfo();
        fetchLatestDelegations();
        updateInfrastructureMetrics();
        
        // Initialize charts
        initRewardsChart();
        initNetworkChart();
        
        // Set up periodic updates
        setInterval(() => {
            fetchValidatorStatus();
            fetchNetworkInfo();
            updateInfrastructureMetrics();
        }, CONFIG.updateInterval);
        
        // Update delegations every 30 seconds
        setInterval(fetchLatestDelegations, 30000);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

    // ===== FETCH TOP 20 DELEGATORS =====
    async function fetchTop20Delegators() {
        try {
            // Mock data - in production fetch from API
            const delegators = generateMockTop20();
            
            const tableBody = document.getElementById('topDelegatorsTable');
            if (!tableBody) return;
            
            tableBody.innerHTML = '';
            
            delegators.forEach((delegator, index) => {
                const row = document.createElement('div');
                row.className = 'table-row';
                row.style.animationDelay = (index * 0.03) + 's';
                
                const rank = index + 1;
                let medal = '';
                if (rank === 1) medal = '🥇';
                else if (rank === 2) medal = '🥈';
                else if (rank === 3) medal = '🥉';
                
                row.innerHTML = `
                    <div class="top-rank"><span class="medal">${medal}</span>#${rank}</div>
                    <div class="delegator-address">${formatAddress(delegator.address)}</div>
                    <div class="delegation-amount">${delegator.amount} TICS</div>
                    <div class="top-share">${delegator.share}%</div>
                `;
                
                tableBody.appendChild(row);
            });
            
        } catch (error) {
            console.error('Error fetching top delegators:', error);
        }
    }

    function generateMockTop20() {
        const delegators = [];
        const totalStake = 13600000; // 13.6M TICS
        
        for (let i = 0; i < 20; i++) {
            const amount = Math.floor((500000 - i * 20000) + Math.random() * 10000);
            const share = ((amount / totalStake) * 100).toFixed(2);
            const randomAddress = 'qubetics1' + Math.random().toString(36).substring(2, 40);
            
            delegators.push({
                address: randomAddress,
                amount: formatNumber(amount),
                share: share
            });
        }
        
        return delegators;
    }

    // ===== NETWORK SHARE =====
    function updateNetworkShare() {
        const ourStake = 13600000; // 13.6M TICS
        const networkTotal = 80000000; // 80M TICS total
        const share = ((ourStake / networkTotal) * 100).toFixed(2);
        
        const networkShareEl = document.getElementById('networkShare');
        const ourStakeEl = document.getElementById('ourStake');
        const networkTotalEl = document.getElementById('networkTotal');
        const validatorRankEl = document.getElementById('validatorRank');
        
        if (networkShareEl) networkShareEl.textContent = share + '%';
        if (ourStakeEl) ourStakeEl.textContent = formatNumber(ourStake);
        if (networkTotalEl) networkTotalEl.textContent = formatNumber(networkTotal);
        if (validatorRankEl) validatorRankEl.textContent = '#8';
    }

    // ===== DELEGATION GROWTH CHART =====
    function initGrowthChart() {
        const canvas = document.getElementById('growthChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = 600;
        
        // Generate mock growth data for 30 days
        const data = [];
        let baseValue = 10000000; // Start at 10M
        
        for (let i = 0; i < 30; i++) {
            baseValue += Math.random() * 300000 + 50000; // Growth trend
            data.push(baseValue);
        }
        
        const max = Math.max(...data);
        const min = Math.min(...data);
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
        
        // Draw area
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        
        data.forEach((value, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = height - padding - ((value - min) / (max - min)) * chartHeight;
            ctx.lineTo(x, y);
        });
        
        ctx.lineTo(width - padding, height - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw line
        ctx.beginPath();
        data.forEach((value, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = height - padding - ((value - min) / (max - min)) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Draw points
        data.forEach((value, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = height - padding - ((value - min) / (max - min)) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#00D4FF';
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        // Draw axes
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.lineWidth = 2;
        
        // Y axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();
        
        // X axis
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px Space Grotesk';
        ctx.textAlign = 'center';
        
        ctx.fillText('30d ago', padding + 50, height - 10);
        ctx.fillText('15d', width / 2, height - 10);
        ctx.fillText('Today', width - padding - 50, height - 10);
    }

    // ===== LIVE ACTIVITY FEED =====
    function initActivityFeed() {
        const feedEl = document.getElementById('activityFeed');
        if (!feedEl) return;
        
        const activities = generateMockActivities(8);
        feedEl.innerHTML = '';
        
        activities.forEach((activity, index) => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.style.animationDelay = (index * 0.05) + 's';
            
            item.innerHTML = `
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-type">${activity.type}</div>
                    <div class="activity-details">${activity.details}</div>
                </div>
                <div class="activity-time">${activity.time}</div>
            `;
            
            feedEl.appendChild(item);
        });
        
        // Add new activity every 10 seconds
        setInterval(() => {
            const newActivity = generateMockActivities(1)[0];
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            item.innerHTML = `
                <div class="activity-icon">${newActivity.icon}</div>
                <div class="activity-content">
                    <div class="activity-type">${newActivity.type}</div>
                    <div class="activity-details">${newActivity.details}</div>
                </div>
                <div class="activity-time">${newActivity.time}</div>
            `;
            
            feedEl.insertBefore(item, feedEl.firstChild);
            
            // Remove last item if more than 8
            if (feedEl.children.length > 8) {
                feedEl.removeChild(feedEl.lastChild);
            }
        }, 10000);
    }

    function generateMockActivities(count) {
        const activities = [];
        const types = [
            { icon: '💰', type: 'New Delegation', template: '+ {amount} TICS from {address}' },
            { icon: '🎁', type: 'Reward Claimed', template: '{address} claimed {amount} TICS' },
            { icon: '✓', type: 'Block Signed', template: 'Block #{block} signed successfully' },
            { icon: '🔄', type: 'Redelegate', template: '{address} redelegated {amount} TICS' },
            { icon: '📤', type: 'Undelegate', template: '{address} undelegated {amount} TICS' }
        ];
        
        const now = Date.now();
        
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const amount = (Math.random() * 500 + 50).toFixed(1);
            const address = 'qubetics1' + Math.random().toString(36).substring(2, 15) + '...';
            const block = Math.floor(2881000 + Math.random() * 100);
            const time = now - (Math.random() * 600000); // Last 10 minutes
            
            let details = type.template
                .replace('{amount}', amount)
                .replace('{address}', address)
                .replace('{block}', block);
            
            activities.push({
                icon: type.icon,
                type: type.type,
                details: details,
                time: timeAgo(time)
            });
        }
        
        return activities;
    }

    // ===== UPDATE INIT FUNCTION =====
    // Add to existing init() function
    const originalInit = init;
    init = function() {
        originalInit();
        
        // Initialize new sections
        fetchTop20Delegators();
        updateNetworkShare();
        initGrowthChart();
        initActivityFeed();
        
        // Update top 20 periodically
        setInterval(fetchTop20Delegators, 60000); // Every minute
    };

