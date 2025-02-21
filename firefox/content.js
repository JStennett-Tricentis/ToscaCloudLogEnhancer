(function() {
	'use strict';

	console.log('Tosca Log Enhancer - Firefox Optimized');
	let isProcessing = false;
	let originalContent = '';
	let isEnhancerEnabled = true;
	let lastEnhancedContent = '';
	const ENHANCEMENT_INTERVAL = 5000; // 5 seconds, matching log update frequency
	let lastEnhancementTime = 0;

	// Use browser.storage for Firefox compatibility
	const storage = browser.storage.sync || browser.storage.local;

	// Check storage for initial state
	storage.get(['enhancerEnabled'], function(result) {
		isEnhancerEnabled = result.enhancerEnabled !== false;
		// Trigger initial enhancement with a slight delay
		setTimeout(initLogEnhancer, 1500);
	});

	// Listen for toggle messages
	browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.action === 'toggleEnhancer') {
			isEnhancerEnabled = request.enabled;
			
			if (isEnhancerEnabled) {
				// Force re-enhance logs when turning back on
				enhanceLogs(true);
			} else {
				resetLogContainer();
			}
		}
	});

	// Rest of the content remains the same as the Chrome version
	// ... (previous content.js implementation)
})();
