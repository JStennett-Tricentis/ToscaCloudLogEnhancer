document.addEventListener('DOMContentLoaded', function() {
	const toggle = document.getElementById('enhancerToggle');
	const statusText = document.getElementById('toggleStatus');

	// Use browser.storage for Firefox compatibility
	const storage = browser.storage.sync || browser.storage.local;

	// Retrieve the current state when popup opens
	storage.get(['enhancerEnabled'], function(result) {
		const isEnabled = result.enhancerEnabled !== false; // Default to true if not set
		toggle.checked = isEnabled;
		statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';
	});

	// Toggle change listener
	toggle.addEventListener('change', function() {
		const isEnabled = this.checked;

		// Save the state
		storage.set({
			enhancerEnabled: isEnabled
		}, function() {
			// Update status text
			statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';

			// Send message to content script
			browser.tabs.query({
				active: true,
				currentWindow: true
			}, function(tabs) {
				browser.tabs.sendMessage(tabs[0].id, {
					action: 'toggleEnhancer',
					enabled: isEnabled
				});
			});
		});
	});
});
