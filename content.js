(function() {
	'use strict';

	console.log('Tosca Log Enhancer v9 - Performance Optimized');
	let isProcessing = false;
	let originalContent = '';
	let isEnhancerEnabled = true;
	let lastEnhancedContent = '';
	const ENHANCEMENT_INTERVAL = 4000;
	let lastEnhancementTime = 0;

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

	// Check storage for initial state
	chrome.storage.sync.get(['enhancerEnabled'], function(result) {
		isEnhancerEnabled = result.enhancerEnabled !== false;
		// Trigger initial enhancement with a slight delay
		setTimeout(initLogEnhancer, 1500);
	});

	// Listen for toggle messages
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
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

	function findLogContainer() {
		const selectors = ['.MuiBox-root.css-0', '[class*="MuiBox"][class*="css-"]'];
		for (const selector of selectors) {
			const elements = document.querySelectorAll(selector);
			for (const element of elements) {
				if (element.textContent.includes('[INF][TBox]')) {
					return element;
				}
			}
		}
		return null;
	}

	function resetLogContainer() {
		const logContainer = findLogContainer();
		if (logContainer) {
			// Remove enhanced container and restore original content
			const enhancedContainer = logContainer.querySelector('.tosca-log-container');
			if (enhancedContainer) {
				// Restore original content without extra newlines
				logContainer.innerHTML = originalContent.trim();
			}
		}
	}

	function enhanceLogs(forceEnhance = false) {
		const currentTime = Date.now();

		// Prevent too frequent updates
		if (!forceEnhance &&
			(currentTime - lastEnhancementTime < ENHANCEMENT_INTERVAL) &&
			(!isEnhancerEnabled)) {
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

	function initLogEnhancer() {
		// Initial enhancement if enabled
		if (isEnhancerEnabled) {
			enhanceLogs(true);
		}

		// Set up MutationObserver with reduced sensitivity
		const observer = new MutationObserver((mutations) => {
			const currentTime = Date.now();

			// Only check for updates if enough time has passed
			if (currentTime - lastEnhancementTime >= ENHANCEMENT_INTERVAL) {
				const hasRelevantChanges = mutations.some(mutation => {
					if (mutation.type === 'childList') {
						return Array.from(mutation.addedNodes).some(node =>
							node.textContent && node.textContent.includes('[INF][TBox]')
						);
					}
					return false;
				});

				if (hasRelevantChanges && !isProcessing && isEnhancerEnabled) {
					enhanceLogs();
				}
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
			characterData: false
		});
	}

	// Run the enhancer
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initLogEnhancer);
	} else {
		initLogEnhancer();
	}
})();
