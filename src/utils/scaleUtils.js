/**
 * Utilities for musical scale calculations
 */

// Define interval ratios for different tuning systems
export const scaleIntervals = {
	// Just Intonation ratios
	'just-intonation': [
		{ name: 'Unison', ratio: 1 },
		{ name: 'Minor Second', ratio: 16/15 },
		{ name: 'Major Second', ratio: 9/8 },
		{ name: 'Minor Third', ratio: 6/5 },
		{ name: 'Major Third', ratio: 5/4 },
		{ name: 'Perfect Fourth', ratio: 4/3 },
		{ name: 'Tritone', ratio: 45/32 },
		{ name: 'Perfect Fifth', ratio: 3/2 },
		{ name: 'Minor Sixth', ratio: 8/5 },
		{ name: 'Major Sixth', ratio: 5/3 },
		{ name: 'Minor Seventh', ratio: 9/5 },
		{ name: 'Major Seventh', ratio: 15/8 },
		{ name: 'Octave', ratio: 2 }
	],
	
	// Pythagorean Tuning ratios
	'pythagorean': [
		{ name: 'Unison', ratio: 1 },
		{ name: 'Minor Second', ratio: 256/243 },
		{ name: 'Major Second', ratio: 9/8 },
		{ name: 'Minor Third', ratio: 32/27 },
		{ name: 'Major Third', ratio: 81/64 },
		{ name: 'Perfect Fourth', ratio: 4/3 },
		{ name: 'Tritone', ratio: 729/512 },
		{ name: 'Perfect Fifth', ratio: 3/2 },
		{ name: 'Minor Sixth', ratio: 128/81 },
		{ name: 'Major Sixth', ratio: 27/16 },
		{ name: 'Minor Seventh', ratio: 16/9 },
		{ name: 'Major Seventh', ratio: 243/128 },
		{ name: 'Octave', ratio: 2 }
	],
	
	// 12-Tone Equal Temperament
	'et-12': Array.from({ length: 13 }, (_, i) => ({
		name: getIntervalNameET12(i),
		ratio: Math.pow(2, i/12)
	})),
	
	// 31-Tone Equal Temperament
	'et-31': Array.from({ length: 32 }, (_, i) => ({
		name: `Step ${i}`,
		ratio: Math.pow(2, i/31)
	})),
	
	// 53-Tone Equal Temperament
	'et-53': Array.from({ length: 54 }, (_, i) => ({
		name: `Step ${i}`,
		ratio: Math.pow(2, i/53)
	}))
};

// Helper function to get interval names for 12-TET
function getIntervalNameET12(step) {
	const names = [
		'Unison', 'Minor Second', 'Major Second', 'Minor Third', 'Major Third',
		'Perfect Fourth', 'Tritone', 'Perfect Fifth', 'Minor Sixth', 'Major Sixth',
		'Minor Seventh', 'Major Seventh', 'Octave'
	];
	return names[step] || `Step ${step}`;
}

// Get interval names for a given scale
export function getIntervalNames(scale) {
	return (scaleIntervals[scale] || scaleIntervals['just-intonation'])
		.map(interval => interval.name);
}

// Calculate all octaves within range
export function calculateOctaves(rootHz, minHz, maxHz) {
	const octaves = [rootHz];
	let current = rootHz;
	
	// Calculate octaves below root - ensure we go down to the minimum
	while (current / 2 >= minHz) {
		current /= 2;
		octaves.unshift(current);
	}
	
	// Add one more octave below the threshold for good measure
	// This ensures we don't miss frequencies right at the boundary
	if (current / 2 > 0) {
		current /= 2;
		if (current > minHz * 0.5) { // Only add if reasonably close to the range
			octaves.unshift(current);
		}
	}
	
	current = rootHz;
	
	// Calculate octaves above root - ensure we go up to the maximum
	while (current * 2 <= maxHz) {
		current *= 2;
		octaves.push(current);
	}
	
	console.log("Generated octaves:", octaves); // Debug log
	return octaves;
}

// Calculate all frequencies for the selected scale
export function calculateScaleFrequencies(rootHz, scale, minHz, maxHz) {
	console.log("calculateScaleFrequencies called with:", rootHz, scale, minHz, maxHz);
	
	// Get intervals for the selected scale
	const intervals = scaleIntervals[scale] || scaleIntervals['just-intonation'];
	
	// Calculate all octaves within range
	const octaves = calculateOctaves(rootHz, minHz, maxHz);
	console.log("Octaves calculated:", octaves);
	
	// Generate all frequencies
	const frequencies = [];
	
	try {
		for (const octave of octaves) {
			for (const interval of intervals) {
				const frequency = octave * interval.ratio;
				
				// Only include frequencies within the specified range
				if (frequency >= minHz && frequency <= maxHz) {
					frequencies.push({
						frequency,
						octave,
						intervalName: interval.name,
						ratio: interval.ratio
					});
				}
			}
		}
		
		// Sort by frequency (low to high)
		return frequencies.sort((a, b) => a.frequency - b.frequency);
	} catch (error) {
		console.error("Error in calculateScaleFrequencies:", error);
		return [];
	}
}