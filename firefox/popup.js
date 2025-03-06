/**
 * Popup interface for Tosca Cloud Log Enhancer
 * Provides toggle functionality for enabling/disabling log enhancement
 */
document.addEventListener('DOMContentLoaded', function () {
	// Get UI elements
	const toggle = document.getElementById('enhancerToggle');
	const statusText = document.getElementById('toggleStatus');
	const statusContainer = document.getElementById('status');

	/**
	 * Displays error message in the popup
	 * @param {string} message - Error message to display
	 */
	function showError(message) {
		if (statusContainer) {
			statusContainer.innerHTML = `<div class="error">${message}</div>`;
		}
		console.error(message);
	}

	// Use Promise-based API for Firefox
	browser.storage.local.get(['enhancerEnabled'])
		.then(result => {
			const isEnabled = result.enhancerEnabled !== false; // Default to true if not set
			toggle.checked = isEnabled;
			statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';
		})
		.catch(error => {
			showError('Could not load settings: ' + error.message);
		});

	// Toggle change listener
	toggle.addEventListener('change', function () {
		const isEnabled = this.checked;
		statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';

		// Save the state
		browser.storage.local.set({ enhancerEnabled: isEnabled })
			.then(() => {
				// Send message to content script
				return browser.tabs.query({
					active: true,
					currentWindow: true
				});
			})
			.then(tabs => {
				if (!tabs || tabs.length === 0) {
					throw new Error('No active tab found');
				}

				return browser.tabs.sendMessage(tabs[0].id, {
					action: 'toggleEnhancer',
					enabled: isEnabled
				});
			})
			.catch(error => {
				showError('Error: ' + error.message);
				console.error('Extension error:', error);
			});
	});
});
