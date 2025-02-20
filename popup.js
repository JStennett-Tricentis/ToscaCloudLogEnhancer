document.addEventListener('DOMContentLoaded', function() {
	const toggle = document.getElementById('enhancerToggle');
	const statusText = document.getElementById('toggleStatus');

	// Retrieve the current state when popup opens
	chrome.storage.sync.get(['enhancerEnabled'], function(result) {
		const isEnabled = result.enhancerEnabled !== false; // Default to true if not set
		toggle.checked = isEnabled;
		statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';
	});

	// Toggle change listener
	toggle.addEventListener('change', function() {
		const isEnabled = this.checked;

		// Save the state
		chrome.storage.sync.set({
			enhancerEnabled: isEnabled
		}, function() {
			// Update status text
			statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';

			// Send message to content script
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {
					action: 'toggleEnhancer',
					enabled: isEnabled
				});
			});
		});
	});
});
