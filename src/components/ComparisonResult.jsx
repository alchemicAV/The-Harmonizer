import React, { useState, useEffect } from 'react';
import { formatFrequency, findSharedNotes } from '../utils/frequencyUtils';
import '../styles/ComparisonResult.css';

function ComparisonResult({ sharedNotes: initialSharedNotes, frequencies, compareFrequencies }) {
	// State for cents tolerance
	const [centsTolerance, setCentsTolerance] = useState(23.46);
	// State for recalculated shared notes based on tolerance
	const [sharedNotes, setSharedNotes] = useState(initialSharedNotes || []);

	// Update shared notes when cents tolerance changes
	const handleCentsToleranceChange = (e) => {
		const newTolerance = parseFloat(e.target.value);
		if (!isNaN(newTolerance) && newTolerance > 0) {
			setCentsTolerance(newTolerance);
			
			// Only recalculate if we have both frequency arrays
			if (frequencies?.length > 0 && compareFrequencies?.length > 0) {
				// Get raw frequencies from both arrays
				const freqArray1 = frequencies.map(f => f.frequency);
				const freqArray2 = compareFrequencies.map(f => f.frequency);
				
				// Find shared notes with new tolerance
				const newSharedNotes = findSharedNotes(freqArray1, freqArray2, newTolerance);
				
				// Sort by frequency (low to high) instead of cents difference
				const sortedSharedNotes = [...newSharedNotes].sort((a, b) => a.freq1 - b.freq1);
				
				setSharedNotes(sortedSharedNotes);
			}
		}
	};
	
	// Handle initial sorting and tolerance setting
	useEffect(() => {
		if (initialSharedNotes && initialSharedNotes.length > 0) {
			// Sort by frequency instead of cents difference
			const sortedNotes = [...initialSharedNotes].sort((a, b) => a.freq1 - b.freq1);
			setSharedNotes(sortedNotes);
		} else {
			setSharedNotes([]);
		}
	}, [initialSharedNotes]);

	if (!sharedNotes || sharedNotes.length === 0) {
		return (
			<div className="comparison-results">
				<div className="tolerance-control">
					<label>
						Shared Notes (within 
						<input 
							type="number" 
							value={centsTolerance}
							onChange={handleCentsToleranceChange}
							className="cents-tolerance-input"
							min="0.01"
							step="0.01"
						/>
						cents tolerance)
					</label>
				</div>
				<p>No shared notes found within {centsTolerance} cents tolerance.</p>
			</div>
		);
	}
	
	return (
		<div className="comparison-results">
			<div className="tolerance-control">
				<label>
					Shared Notes (within 
					<input 
						type="number" 
						value={centsTolerance}
						onChange={handleCentsToleranceChange}
						className="cents-tolerance-input"
						min="0.01"
						step="0.01"
					/>
					cents tolerance)
				</label>
			</div>
			<table className="shared-notes-table">
				<thead>
					<tr>
						<th>Root 1 Frequency</th>
						<th>Scale Degree 1</th>
						<th>Root 2 Frequency</th>
						<th>Scale Degree 2</th>
						<th>Difference (cents)</th>
					</tr>
				</thead>
				<tbody>
					{sharedNotes.map((pair, index) => {
						// Find the corresponding frequency objects to get the interval names
						const freq1Data = frequencies.find(f => Math.abs(f.frequency - pair.freq1) < 0.001);
						const freq2Data = compareFrequencies.find(f => Math.abs(f.frequency - pair.freq2) < 0.001);
						
						return (
							<tr key={`shared-${index}`}>
								<td>{formatFrequency(pair.freq1)}</td>
								<td>{freq1Data ? freq1Data.intervalName : 'Unknown'}</td>
								<td>{formatFrequency(pair.freq2)}</td>
								<td>{freq2Data ? freq2Data.intervalName : 'Unknown'}</td>
								<td>{pair.centsDifference} cents</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

export default ComparisonResult;