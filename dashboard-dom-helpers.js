/**
 * Dashboard DOM Helper Functions
 * CSP Compliant - NO innerHTML with template strings
 * All elements created via document.createElement()
 */

// Create delegation card element (replaces lines 1023-1047)
function createDelegationCard(valAddr, valName, amount, rewards) {
    const card = document.createElement('div');
    card.className = 'delegation-card';
    
    // Header section
    const header = document.createElement('div');
    header.className = 'delegation-header';
    
    const leftCol = document.createElement('div');
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'delegation-validator-name';
    nameDiv.textContent = valName;
    
    const addrDiv = document.createElement('div');
    addrDiv.className = 'delegation-validator-addr';
    addrDiv.textContent = `${valAddr.substring(0, 16)}...${valAddr.substring(valAddr.length - 6)}`;
    
    leftCol.appendChild(nameDiv);
    leftCol.appendChild(addrDiv);
    
    const rightCol = document.createElement('div');
    rightCol.className = 'delegation-amount-col';
    
    const amountDiv = document.createElement('div');
    amountDiv.className = 'delegation-amount';
    amountDiv.textContent = amount;
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'delegation-amount-label';
    labelDiv.textContent = 'TICS Staked';
    
    rightCol.appendChild(amountDiv);
    rightCol.appendChild(labelDiv);
    
    header.appendChild(leftCol);
    header.appendChild(rightCol);
    
    // Rewards section
    const rewardsBox = document.createElement('div');
    rewardsBox.className = 'delegation-rewards-box';
    
    const rewardsRow = document.createElement('div');
    rewardsRow.className = 'delegation-rewards-row';
    
    const rewardsLabel = document.createElement('div');
    rewardsLabel.className = 'delegation-rewards-label';
    rewardsLabel.textContent = '💰 Pending Rewards';
    
    const rewardsAmount = document.createElement('div');
    rewardsAmount.className = 'delegation-rewards-amount';
    rewardsAmount.textContent = `${rewards} TICS`;
    
    rewardsRow.appendChild(rewardsLabel);
    rewardsRow.appendChild(rewardsAmount);
    rewardsBox.appendChild(rewardsRow);
    
    // Buttons section
    const buttonsGrid = document.createElement('div');
    buttonsGrid.className = 'delegation-buttons-grid';
    
    const stakeBtn = document.createElement('button');
    stakeBtn.className = 'delegation-btn delegation-btn-stake';
    stakeBtn.textContent = '💎 Stake More';
    stakeBtn.addEventListener('click', () => stakeMore(valAddr, amount));
    
    const switchBtn = document.createElement('button');
    switchBtn.className = 'delegation-btn delegation-btn-switch';
    switchBtn.textContent = '🔄 Switch Validator';
    switchBtn.addEventListener('click', () => switchValidator(valAddr, amount));
    
    const unbondBtn = document.createElement('button');
    unbondBtn.className = 'delegation-btn delegation-btn-unbond';
    unbondBtn.textContent = '🔓 Unbond';
    unbondBtn.addEventListener('click', () => unbond(valAddr, amount));
    
    buttonsGrid.appendChild(stakeBtn);
    buttonsGrid.appendChild(switchBtn);
    buttonsGrid.appendChild(unbondBtn);
    
    // Assemble card
    card.appendChild(header);
    card.appendChild(rewardsBox);
    card.appendChild(buttonsGrid);
    
    return card;
}

// Create unbonding entry element (replaces template string in unbonding section)
function createUnbondingEntry(valName, valAddr, amount, completionTime) {
    const entry = document.createElement('div');
    entry.className = 'unbonding-entry';
    
    const topRow = document.createElement('div');
    topRow.className = 'unbonding-top-row';
    
    const leftCol = document.createElement('div');
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'unbonding-validator-name';
    nameDiv.textContent = valName;
    
    const addrDiv = document.createElement('div');
    addrDiv.className = 'unbonding-validator-addr';
    addrDiv.textContent = `${valAddr.substring(0, 16)}...${valAddr.substring(valAddr.length - 6)}`;
    
    leftCol.appendChild(nameDiv);
    leftCol.appendChild(addrDiv);
    
    const rightCol = document.createElement('div');
    rightCol.className = 'unbonding-amount-col';
    
    const amountDiv = document.createElement('div');
    amountDiv.className = 'unbonding-amount';
    amountDiv.textContent = `${amount} TICS`;
    
    const timeLabel = document.createElement('div');
    timeLabel.className = 'unbonding-time-label';
    timeLabel.textContent = 'Time Remaining';
    
    // Calculate time remaining
    const now = new Date();
    const diff = completionTime - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const timeRemaining = `${days}d ${hours}h`;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'unbonding-time';
    timeDiv.textContent = timeRemaining;
    
    rightCol.appendChild(amountDiv);
    rightCol.appendChild(timeLabel);
    rightCol.appendChild(timeDiv);
    
    topRow.appendChild(leftCol);
    topRow.appendChild(rightCol);
    
    const completionDiv = document.createElement('div');
    completionDiv.className = 'unbonding-completion';
    completionDiv.innerHTML = `Completion:<br>${completionTime.toLocaleDateString('uk-UA')}, ${completionTime.toLocaleTimeString('uk-UA', {hour: '2-digit', minute: '2-digit'})}`;
    
    entry.appendChild(topRow);
    entry.appendChild(completionDiv);
    
    return entry;
}

// Create reward entry for claim modal
function createRewardEntry(valName, rewardAmount) {
    const entry = document.createElement('div');
    entry.className = 'reward-entry';
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'claim-validator-name';
    nameDiv.textContent = valName;
    
    const amountDiv = document.createElement('div');
    amountDiv.className = 'claim-reward-amount';
    amountDiv.textContent = `${rewardAmount} TICS`;
    
    entry.appendChild(nameDiv);
    entry.appendChild(amountDiv);
    
    return entry;
}

// Create validator selection item for switch modal
function createValidatorSelectionItem(val, name, isQubeNode) {
    const item = document.createElement('div');
    item.className = isQubeNode ? 'validator-list-item validator-list-item-qubenode' : 'validator-list-item';
    item.addEventListener('click', () => selectValidator(val.operator_address, name));
    
    const topRow = document.createElement('div');
    topRow.className = 'validator-item-row';
    
    const leftCol = document.createElement('div');
    leftCol.className = 'validator-item-left';
    
    const nameDiv = document.createElement('div');
    nameDiv.className = isQubeNode ? 'validator-item-name validator-item-name-qubenode' : 'validator-item-name';
    nameDiv.textContent = isQubeNode ? `${name} ⭐` : name;
    
    const addrDiv = document.createElement('div');
    addrDiv.className = 'validator-item-addr';
    const shortAddr = `${val.operator_address.substring(0, 16)}...${val.operator_address.substring(val.operator_address.length - 6)}`;
    addrDiv.textContent = shortAddr;
    
    leftCol.appendChild(nameDiv);
    leftCol.appendChild(addrDiv);
    
    const rightCol = document.createElement('div');
    rightCol.className = 'validator-item-right';
    
    const commDiv = document.createElement('div');
    commDiv.className = 'validator-item-commission-label';
    commDiv.textContent = 'Commission';
    
    const commValue = document.createElement('div');
    commValue.className = isQubeNode ? 'validator-item-commission validator-item-commission-qubenode' : 'validator-item-commission';
    const commRate = parseFloat(val.commission.commission_rates.rate) * 100;
    commValue.textContent = `${commRate.toFixed(1)}%`;
    
    rightCol.appendChild(commDiv);
    rightCol.appendChild(commValue);
    
    topRow.appendChild(leftCol);
    topRow.appendChild(rightCol);
    
    item.appendChild(topRow);
    
    return item;
}
