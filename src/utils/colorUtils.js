/**
 * Utilities for mapping frequencies to colors
 */

// Define the visible spectrum range
const VISIBLE_SPECTRUM_MIN = 4.0e14; // ~750nm (red) - 400 THz
const VISIBLE_SPECTRUM_MAX = 7.9e14; // ~380nm (violet) - 790 THz

/**
 * Convert a frequency to a visible color based on its actual relation to visible light
 * @param {number} frequency - Frequency in Hz
 * @returns {string} CSS color string
 */
export function frequencyToColor(frequency) {
	// Handle zero or negative frequencies
	if (frequency <= 0) {
		return '#888888';
	}
	
	// Find what frequency this would be if we transposed it into the visible spectrum
	// by doubling or halving it by octaves
	let equivalentFreq = frequency;
	
	// Double the frequency until we reach the visible range or go past it
	while (equivalentFreq < VISIBLE_SPECTRUM_MIN) {
		equivalentFreq *= 2;
	}
	
	// Halve the frequency until we're in the visible range
	while (equivalentFreq > VISIBLE_SPECTRUM_MAX) {
		equivalentFreq /= 2;
	}
	
	// Now map the equivalent frequency within the visible spectrum to a color
	let normalizedPosition = (equivalentFreq - VISIBLE_SPECTRUM_MIN) / 
		(VISIBLE_SPECTRUM_MAX - VISIBLE_SPECTRUM_MIN);
	
	// Ensure it's within 0-1 range due to potential floating point errors
	normalizedPosition = Math.max(0, Math.min(1, normalizedPosition));
	
	// Convert to HSL color (visible spectrum goes from red at 0° to violet at 270°)
	// Red is at the low end of the visible spectrum, violet at the high end
	const hue = normalizedPosition * 270;
	
	// Return the HSL color
	return `hsl(${hue}, 100%, 50%)`;
}

/**
 * Get a simple color representation for frequency ranges
 * @param {number} frequency - Frequency in Hz
 * @returns {object} Object containing color and label for the range
 */
export function getFrequencyRangeColor(frequency) {
	if (frequency < 1) {
		return { color: '#3A3B3C', label: 'Time' }; // Dark gray for time scales
	} else if (frequency >= 20 && frequency <= 20000) {
		return { color: '#4682B4', label: 'Sound' }; // Steel blue for audible range
	} else if (frequency > 20000 && frequency < 3e10) { 
		return { color: '#CD5C5C', label: 'Radio' }; // Indian red for radio
	} else if (frequency >= 4e14 && frequency <= 7.9e14) {
		// This is actually in the visible spectrum, so use the real color
		return { 
			color: frequencyToColor(frequency), 
			label: 'Visible Light' 
		};
	} else if (frequency > 7.9e14 && frequency < 3e19) {
		return { color: '#9370DB', label: 'UV/X-Ray/Gamma' }; // Medium purple for high radiation
	} else {
		return { color: '#A9A9A9', label: 'Other' }; // Dark gray for other
	}
}