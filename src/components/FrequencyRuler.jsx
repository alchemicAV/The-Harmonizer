import React from 'react';
import { calculatePosition, generateRulerTicks } from '../utils/rulerUtils';
import { frequencyToColor } from '../utils/colorUtils';
import '../styles/FrequencyRuler.css';

function FrequencyRuler({ frequencies, compareFrequencies, showComparison, minFreq, maxFreq }) {
	console.log("FrequencyRuler rendering", {
		frequenciesCount: frequencies?.length,
		compareCount: compareFrequencies?.length,
		showComparison
	});
	
	// Safety check for frequencies
	if (!frequencies || !Array.isArray(frequencies)) {
		console.error("FrequencyRuler: frequencies is not an array", frequencies);
		return <div className="ruler-container">Frequency data is loading...</div>;
	}
	
	try {
		// Generate ticks for the full range ruler
		const rulerTicks = generateRulerTicks(minFreq, maxFreq);
		
		return (
			<div className="ruler-container">
				<div className="frequency-ticks">
					{frequencies.filter(freq => freq >= minFreq && freq <= maxFreq).map((freq, index) => (
						<div
							key={`tick-${index}`}
							className="tick"
							style={{
								left: `${calculatePosition(freq, minFreq, maxFreq)}%`,
								backgroundColor: frequencyToColor(freq)
							}}
							title={`${freq.toExponential(2)} Hz`}
						/>
					))}
					
					{showComparison && compareFrequencies && compareFrequencies.length > 0 && compareFrequencies.map((freq, index) => (
						<div
							key={`compare-tick-${index}`}
							className="compare-tick"
							style={{
								left: `${calculatePosition(freq, minFreq, maxFreq)}%`,
								backgroundColor: frequencyToColor(freq)
							}}
							title={`${freq.toExponential(2)} Hz (comparison)`}
						/>
					))}
				</div>
				
				<div className="ruler">
					<div className="ruler-label left">100 years</div>
					<div className="ruler-label center">Time | Sound | Light | Radiation</div>
					<div className="ruler-label right">5160 THz</div>
					
					{rulerTicks.map((tick, index) => (
						<div
							key={`ruler-tick-${index}`}
							className={`ruler-tick ${tick.isMajor ? 'major' : 'minor'}`}
							style={{ left: `${tick.position}%` }}
						>
							<div className="tick-mark"></div>
							{tick.label && <div className="tick-label">{tick.label}</div>}
						</div>
					))}
				</div>
			</div>
		);
	} catch (error) {
		console.error("Error rendering FrequencyRuler:", error);
		return <div className="ruler-container">Error rendering ruler. Check console for details.</div>;
	}
}

export default FrequencyRuler;