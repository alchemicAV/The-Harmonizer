/**
 * Utility functions for ruler generation and positioning
 */

import { formatFrequency } from './frequencyUtils';

/**
 * Calculate the position on a logarithmic scale for a frequency
 * @param {number} frequency - Frequency in Hz
 * @param {number} minFreq - Minimum frequency of the range
 * @param {number} maxFreq - Maximum frequency of the range
 * @returns {number} Percentage position (0-100)
 */
export function calculatePosition(frequency, minFreq, maxFreq) {
	// Convert to logarithmic scale
	const logMin = Math.log10(minFreq);
	const logMax = Math.log10(maxFreq);
	const logFreq = Math.log10(frequency);
	
	// Calculate position as percentage
	return ((logFreq - logMin) / (logMax - logMin)) * 100;
}

/**
 * Generate ruler ticks for a frequency range
 * @param {number} minFreq - Minimum frequency of the range
 * @param {number} maxFreq - Maximum frequency of the range
 * @returns {Array} Array of tick objects with position and label
 */
export function generateRulerTicks(minFreq, maxFreq) {
	const ticks = [];
	
	// Calculate logarithmic range
	const logMin = Math.log10(minFreq);
	const logMax = Math.log10(maxFreq);
	const logRange = logMax - logMin;
	
	// Determine the appropriate tick spacing based on the range
	// For a very wide range, we need fewer ticks to avoid overcrowding
	const ticksCount = Math.min(20, Math.ceil(logRange * 2));
	
	// Calculate major tick interval on log scale
	const majorTickInterval = logRange / ticksCount;
	
	// Add major ticks
	for (let i = 0; i <= ticksCount; i++) {
		const logValue = logMin + (i * majorTickInterval);
		const frequency = Math.pow(10, logValue);
		
		const tick = {
			position: ((logValue - logMin) / logRange) * 100,
			frequency,
			label: formatFrequency(frequency),
			isMajor: true
		};
		
		ticks.push(tick);
		
		// For narrower ranges, add minor ticks between major ones
		if (logRange < 10 && i < ticksCount) {
			// Add 4 minor ticks between majors (giving a total of 5 divisions)
			for (let j = 1; j <= 4; j++) {
				const minorLogValue = logValue + (j * majorTickInterval / 5);
				const minorFreq = Math.pow(10, minorLogValue);
				
				// Only add if still within range
				if (minorLogValue <= logMax) {
					ticks.push({
						position: ((minorLogValue - logMin) / logRange) * 100,
						frequency: minorFreq,
						label: '',
						isMajor: false
					});
				}
			}
		}
	}
	
	// Add the 1Hz tick if in range (useful reference point)
	if (minFreq < 1 && maxFreq > 1) {
		const oneHzPosition = calculatePosition(1, minFreq, maxFreq);
		ticks.push({
			position: oneHzPosition,
			frequency: 1,
			label: '1 Hz',
			isMajor: true,
			isSpecial: true
		});
	}
	
	return ticks;
}

/**
 * Determine labels for different frequency ranges
 * @param {number} frequency - Frequency in Hz
 * @returns {string} Label describing the frequency range
 */
export function getFrequencyRangeLabel(frequency) {
	if (frequency < 1) {
		return 'Time Domain';
	} else if (frequency >= 20 && frequency <= 20000) {
		return 'Audible Sound';
	} else if (frequency > 20000 && frequency < 3e10) {
		return 'Radio Waves';
	} else if (frequency >= 4e14 && frequency <= 7.9e14) {
		return 'Visible Light';
	} else if (frequency > 7.9e14 && frequency < 3e19) {
		return 'UV/X-Ray/Gamma Radiation';
	} else {
		return '';
	}
}