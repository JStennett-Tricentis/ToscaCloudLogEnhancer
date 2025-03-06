/**
 * Tosca Cloud Log Enhancer
 *
 * This extension improves the readability of Tosca Cloud logs by adding
 * color-coded formatting to indicate success, failure, and info messages.
 *
 * @version 9.1.0
 * @author Tricentis
 */
(function () {
	'use strict';

	// Configuration and state variables
	const VERSION = '9.1.0';
	const ENHANCEMENT_INTERVAL = 4000; // Minimum time between enhancements (ms)

	// State management
	let isProcessing = false;        // Prevents concurrent processing
	let originalContent = '';        // Stores original log content
	let isEnhancerEnabled = true;    // Feature toggle
	let lastEnhancedContent = '';    // Caches last enhanced content
	let lastEnhancementTime = 0;     // Tracks last enhancement timestamp

	console.log(`Tosca Log Enhancer v${VERSION} - Performance Optimized`);

	const styles = `
        .tosca-log-container {
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-break: break-word;
            min-width: 1700px;
            max-width: 2000px;
            margin: 0 auto;
			padding: 0 0 10px 0;
        }
        .log-line {
            display: block;
            margin: 2px 0;
            border-radius: 3px;
            font-family: monospace;
        }
        .log-line.succeeded {
            background-color: rgba(40, 167, 69, 0.1);
        }
        .log-line.failed {
            background-color: rgba(220, 53, 69, 0.1);
        }
        .log-line.info {
            background-color: rgba(23, 162, 184, 0.1);
        }
    `;

	// Use Firefox storage API directly for better compatibility
	// Check storage for initial state
	browser.storage.local.get(['enhancerEnabled'])
		.then(result => {
			isEnhancerEnabled = result.enhancerEnabled !== false;
			// Trigger initial enhancement with a slight delay
			setTimeout(initLogEnhancer, 1500);
		})
		.catch(error => {
			console.error('Error retrieving settings:', error);
			// Default to enabled if there's an error
			isEnhancerEnabled = true;
			setTimeout(initLogEnhancer, 1500);
		});

	// Listen for toggle messages
	browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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

	/**
	 * Finds the container element holding Tosca logs
	 * Uses multiple selector strategies for robustness against UI changes
	 *
	 * @returns {HTMLElement|null} - The log container element or null if not found
	 */
	function findLogContainer() {
		// Selectors in order of preference
		const selectors = [
			'.MuiBox-root.css-0',          // Primary selector
			'[class*="MuiBox"][class*="css-"]' // Fallback with broader match
		];

		// Try each selector strategy
		for (const selector of selectors) {
			const elements = document.querySelectorAll(selector);
			for (const element of elements) {
				// Identify log container by characteristic content
				if (element.textContent.includes('[INF][TBox]')) {
					return element;
				}
			}
		}
		return null;
	}

	/**
	 * Resets log container to its original state
	 * Removes enhanced formatting and restores original content
	 */
	function resetLogContainer() {
		const logContainer = findLogContainer();
		if (!logContainer) return;

		// Remove enhanced container and restore original content
		const enhancedContainer = logContainer.querySelector('.tosca-log-container');
		if (enhancedContainer && originalContent) {
			// Restore original content without extra newlines
			logContainer.innerHTML = originalContent.trim();
		}
	}

	/**
	 * Enhances log display with color coding and formatting
	 * @param {boolean} forceEnhance - Whether to force enhancement regardless of timing
	 */
	function enhanceLogs(forceEnhance = false) {
		const currentTime = Date.now();

		// Prevent too frequent updates and respect enabled state
		if (!forceEnhance &&
			(currentTime - lastEnhancementTime < ENHANCEMENT_INTERVAL ||
				!isEnhancerEnabled)) {
			return;
		}

		if (isProcessing) return;
		isProcessing = true;

		const logContainer = findLogContainer();
		if (!logContainer) {
			isProcessing = false;
			return;
		}

		// Store original content if not already stored
		if (!originalContent) {
			originalContent = logContainer.innerHTML;
		}

		const currentContent = logContainer.innerText;

		// Prevent unnecessary re-rendering
		if (!forceEnhance && currentContent === lastEnhancedContent) {
			isProcessing = false;
			return;
		}

		// Add style to document (only once)
		if (!document.getElementById('tosca-log-styles')) {
			const styleElement = document.createElement('style');
			styleElement.id = 'tosca-log-styles';
			styleElement.textContent = styles;
			document.head.appendChild(styleElement);
		}

		const logLines = currentContent.split('\n');

		const processedLines = logLines.map(line => {
			if (!line.trim()) return '';

			let cssClass = 'info';
			if (line.includes('[Succeeded]')) {
				cssClass = 'succeeded';
			} else if (line.includes('[Failed]')) {
				cssClass = 'failed';
			}

			return `<div class="log-line ${cssClass}">${line}</div>`;
		}).filter(line => line !== '');

		let enhancedContainer = logContainer.querySelector('.tosca-log-container');
		if (!enhancedContainer) {
			enhancedContainer = document.createElement('div');
			enhancedContainer.className = 'tosca-log-container';
		}

		enhancedContainer.innerHTML = processedLines.join('');

		// Replace container content
		logContainer.innerHTML = '';
		logContainer.appendChild(enhancedContainer);

		// Update tracking variables
		lastEnhancedContent = currentContent;
		lastEnhancementTime = currentTime;
		isProcessing = false;
	}

	/**
	 * Initializes the log enhancer
	 * Sets up initial enhancement and establishes DOM mutation observer
	 */
	function initLogEnhancer() {
		// Initial enhancement if enabled
		if (isEnhancerEnabled) {
			enhanceLogs(true);
		}

		// Set up MutationObserver with performance optimizations
		const observer = new MutationObserver((mutations) => {
			const currentTime = Date.now();

			// Performance optimization: Only check for updates if enough time has passed
			if (currentTime - lastEnhancementTime >= ENHANCEMENT_INTERVAL) {
				// Check if the mutations contain relevant log content changes
				const hasRelevantChanges = mutations.some(mutation => {
					if (mutation.type === 'childList') {
						return Array.from(mutation.addedNodes).some(node =>
							node.textContent && node.textContent.includes('[INF][TBox]')
						);
					}
					return false;
				});

				// Process changes only if relevant, not already processing, and feature is enabled
				if (hasRelevantChanges && !isProcessing && isEnhancerEnabled) {
					enhanceLogs();
				}
			}
		});

		// Configure observer for optimal performance
		observer.observe(document.body, {
			childList: true,    // Watch for element additions/removals
			subtree: true,      // Watch the entire DOM tree
			characterData: false // Ignore text content changes (reduces noise)
		});
	}

	// Run the enhancer
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initLogEnhancer);
	} else {
		initLogEnhancer();
	}
})();
