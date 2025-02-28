/**
 * Utility functions for frequency calculations and conversions
 */

// Convert seconds to Hz
export function secondsToHz(seconds) {
	return 1 / seconds;
}

// Convert Hz to seconds
export function hzToSeconds(hz) {
	return 1 / hz;
}

// Parse root note input, accounting for seconds or Hz
export function parseRootNote(input, isInSeconds) {
	const value = parseFloat(input);
	if (isNaN(value) || value <= 0) return null;
	
	return isInSeconds ? secondsToHz(value) : value;
}

// Format frequency for display
export function formatFrequency(frequency) {
	if (frequency < 1) {
		// Display as time period
		const seconds = 1 / frequency;
		
		if (seconds >= 60 * 60 * 24 * 365) {
			return `${(seconds / (60 * 60 * 24 * 365)).toFixed(2)} years`;
		} else if (seconds >= 60 * 60 * 24) {
			return `${(seconds / (60 * 60 * 24)).toFixed(2)} days`;
		} else if (seconds >= 60 * 60) {
			return `${(seconds / (60 * 60)).toFixed(2)} hours`;
		} else if (seconds >= 60) {
			return `${(seconds / 60).toFixed(2)} minutes`;
		} else {
			return `${seconds.toFixed(2)} seconds`;
		}
	} else if (frequency >= 1e15) {
		return `${(frequency / 1e15).toFixed(2)} PHz`;
	} else if (frequency >= 1e12) {
		return `${(frequency / 1e12).toFixed(2)} THz`;
	} else if (frequency >= 1e9) {
		return `${(frequency / 1e9).toFixed(2)} GHz`;
	} else if (frequency >= 1e6) {
		return `${(frequency / 1e6).toFixed(2)} MHz`;
	} else if (frequency >= 1e3) {
		return `${(frequency / 1e3).toFixed(2)} kHz`;
	} else {
		return `${frequency.toFixed(2)} Hz`;
	}
}

// Find shared notes within tolerance measured in cents
export function findSharedNotes(freqs1, freqs2) {
	const shared = [];
	const CENTS_TOLERANCE = 23.46; // Tolerance in cents
	
	for (const f1 of freqs1) {
		for (const f2 of freqs2) {
			// Handle division by zero or invalid frequencies
			if (f1 <= 0 || f2 <= 0) continue;
			
			// Calculate cents difference between frequencies
			// Formula: cents = 1200 * log2(f2/f1)
			const centsDifference = f1 === f2 ? 0 : Math.abs(1200 * Math.log2(f2/f1));
			
			// Check if within tolerance (including exact matches)
			if (centsDifference <= CENTS_TOLERANCE) {
				shared.push({
					freq1: f1,
					freq2: f2,
					centsDifference: centsDifference.toFixed(2)
				});
			}
		}
	}
	
	return shared;
}

/**
 * Gets the interval name for a frequency in relation to its root
 * @param {number} frequency - The frequency to find the interval for
 * @param {number} rootFrequency - The root frequency 
 * @param {string} scale - The scale type
 * @returns {string} The interval name
 */
export function getIntervalName(frequency, rootFrequency, scale) {
	if (!rootFrequency || !frequency) return '';
	
	// Calculate cents from root
	const cents = 1200 * Math.log2(frequency / rootFrequency);
	
	// Map to scale degrees (for ET-12 or similar scales)
	const intervalNames = {
		0: 'Unison',
		100: 'Minor Second',
		200: 'Major Second',
		300: 'Minor Third',
		400: 'Major Third', 
		500: 'Perfect Fourth',
		600: 'Tritone',
		700: 'Perfect Fifth',
		800: 'Minor Sixth',
		900: 'Major Sixth', 
		1000: 'Minor Seventh',
		1100: 'Major Seventh',
		1200: 'Octave'
	};
	
	// Find the closest interval
	const normalizedCents = ((cents % 1200) + 1200) % 1200;
	const closestInterval = Math.round(normalizedCents / 100) * 100;
	const wrappedInterval = closestInterval === 1200 ? 0 : closestInterval;
	
	return intervalNames[wrappedInterval] || `${Math.round(normalizedCents)} cents`;
}

// Calculate modular arithmetic value for a frequency
export function calculateModular(frequency, modulus) {
	// Get the base-10 logarithm of the frequency
	const logFreq = Math.log10(frequency);
	
	// Take the fractional part and multiply by the modulus
	const fractionalPart = logFreq - Math.floor(logFreq);
	const modValue = Math.floor((fractionalPart * modulus) % modulus);
	
	// Return an integer value between 0 and modulus-1
	return modValue;
}