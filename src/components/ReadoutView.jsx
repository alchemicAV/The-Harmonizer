import React, { useState } from 'react';
import ModularTable from './ModularTable';
import ComparisonResult from './ComparisonResult';
import '../styles/ReadoutView.css';

function ReadoutView({ frequencies, compareFrequencies, sharedNotes, selectedScale }) {
	const [modulus, setModulus] = useState(9); // Default modulus
	const [displayMode, setDisplayMode] = useState('frequencies');
	
	// Available modulus options
	const modulusOptions = [3, 4, 5, 6, 7, 8, 9, 10];
	
	// Check if we have data to display
	const hasFrequencies = frequencies && frequencies.length > 0;
	const hasCompareFrequencies = compareFrequencies && compareFrequencies.length > 0;
	
	return (
		<div className="readout-view">
			{!hasFrequencies && (
				<div className="no-data-message">
					<p>Please enter a valid root note to see frequency data.</p>
				</div>
			)}
			
			{hasFrequencies && (
				<>
					<h3>Root Note Frequencies</h3>
					<ModularTable
						frequencies={frequencies}
						displayMode="frequencies"
						modulus={modulus}
						selectedScale={selectedScale}
					/>
					
					{hasCompareFrequencies && (
						<>
							<h3>Comparison Root Frequencies</h3>
							<ModularTable
								frequencies={compareFrequencies}
								displayMode="frequencies"
								modulus={modulus}
								selectedScale={selectedScale}
							/>
							
							<ComparisonResult 
								sharedNotes={sharedNotes} 
								frequencies={frequencies}
								compareFrequencies={compareFrequencies}
							/>
						</>
					)}
				</>
			)}
		</div>
	);
}

export default ReadoutView;