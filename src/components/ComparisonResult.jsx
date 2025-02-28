import React from 'react';
import { formatFrequency } from '../utils/frequencyUtils';
import '../styles/ComparisonResult.css';

function ComparisonResult({ sharedNotes, frequencies, compareFrequencies }) {
	if (!sharedNotes || sharedNotes.length === 0) {
		return (
			<div className="comparison-results">
				<h3>Shared Notes (within 23.46 cents tolerance)</h3>
				<p>No shared notes found within 23.46 cents tolerance.</p>
			</div>
		);
	}
	
	return (
		<div className="comparison-results">
			<h3>Shared Notes (within 23.46 cents tolerance)</h3>
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