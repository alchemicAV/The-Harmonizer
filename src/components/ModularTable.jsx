import React from 'react';
import { formatFrequency } from '../utils/frequencyUtils';
import { calculateModular } from '../utils/frequencyUtils';
import { getIntervalNames } from '../utils/scaleUtils';
import '../styles/ModularTable.css';

function ModularTable({ frequencies, displayMode, modulus, selectedScale }) {
	if (!frequencies || frequencies.length === 0) {
		return <p>No frequency data available.</p>;
	}
	
	// Extract and organize data for the table
	// Extract unique octaves
	const uniqueOctaves = [...new Set(frequencies.map(f => f.octave))].sort((a, b) => a - b);
	
	// Get interval names for the selected scale
	const intervalNames = getIntervalNames(selectedScale);
	
	// Create a mapping of interval to octave to frequency
	const frequencyMap = {};
	
	// Initialize the map with nulls
	intervalNames.forEach(interval => {
		frequencyMap[interval] = {};
		uniqueOctaves.forEach(octave => {
			frequencyMap[interval][octave] = null;
		});
	});
	
	// Fill in the frequencies
	frequencies.forEach(f => {
		if (frequencyMap[f.intervalName] && uniqueOctaves.includes(f.octave)) {
			frequencyMap[f.intervalName][f.octave] = f.frequency;
		}
	});
	
	return (
		<div className="modular-table-container">
			<table className="modular-table">
				<thead>
					<tr>
						<th>Interval</th>
						{uniqueOctaves.map((octave, index) => (
							<th key={`octave-${index}`}>
								{formatFrequency(octave)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{intervalNames.map((interval, rowIndex) => (
						<tr key={`interval-${rowIndex}`}>
							<td className="interval-name">{interval}</td>
							{uniqueOctaves.map((octave, colIndex) => {
								const freq = frequencyMap[interval][octave];
								return (
									<td key={`freq-${rowIndex}-${colIndex}`}>
										{freq !== null ? (
											displayMode === 'frequencies' 
												? formatFrequency(freq)
												: calculateModular(freq, modulus)
										) : '-'}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default ModularTable;