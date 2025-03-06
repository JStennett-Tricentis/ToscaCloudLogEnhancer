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

	// Retrieve the current state when popup opens
	chrome.storage.sync.get(['enhancerEnabled'], function (result) {
		if (chrome.runtime.lastError) {
			showError('Could not load settings: ' + chrome.runtime.lastError.message);
			return;
		}

		const isEnabled = result.enhancerEnabled !== false; // Default to true if not set
		toggle.checked = isEnabled;
		statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';
	});

	// Toggle change listener
	toggle.addEventListener('change', function () {
		const isEnabled = this.checked;

		// Save the state
		chrome.storage.sync.set({
			enhancerEnabled: isEnabled
		}, function () {
			if (chrome.runtime.lastError) {
				showError('Could not save settings: ' + chrome.runtime.lastError.message);
				return;
			}

			// Update status text
			statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';

			// Send message to content script
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function (tabs) {
				if (chrome.runtime.lastError) {
					showError('Error accessing tab: ' + chrome.runtime.lastError.message);
					return;
				}

				if (!tabs || tabs.length === 0) {
					showError('No active tab found');
					return;
				}

				chrome.tabs.sendMessage(tabs[0].id, {
					action: 'toggleEnhancer',
					enabled: isEnabled
				}, function (response) {
					if (chrome.runtime.lastError) {
						// This may happen on pages where content script isn't loaded
						console.log('Could not communicate with content script: ' + chrome.runtime.lastError.message);
					}
				});
			});
		});
	});
});
