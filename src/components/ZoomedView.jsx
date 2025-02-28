import React, { useState, useEffect } from 'react';
import EnhancedRulerSystem from './EnhancedRulerSystem';
import { formatFrequency } from '../utils/frequencyUtils';
import '../styles/ZoomedView.css';

function ZoomedView({ frequencies, compareFrequencies, sharedNotes, selectedRange, minFreq, maxFreq, isRootInSeconds }) {
	// State for the current view range
	const [currentRange, setCurrentRange] = useState(null);
	
	// Define range bounds for each selected range
	const rangeBounds = {
		'full': { min: minFreq, max: maxFreq },
		'time': { min: minFreq, max: 1 }, // 100 years to 1 second
		'sound': { min: 20, max: 20000 }, // Audible range
		'color': { min: 4e14, max: 7.9e14 }, // Visible light range
		'radio': { min: 3e4, max: 3e11 }, // Radio wave range
		'radiation': { min: 3e15, max: 3e19 } // X-rays and gamma rays
	};
	
	// Get the appropriate base range
	const baseRange = rangeBounds[selectedRange] || rangeBounds.full;
	
	// Range labels for display
	const rangeLabels = {
		'full': 'Full Range (100 years to 5160 THz)',
		'time': 'Time Range (100 years to 1 second)',
		'sound': 'Sound Range (20Hz to 20kHz)',
		'color': 'Color Spectrum',
		'radio': 'Radio Waves',
		'radiation': 'Radiation'
	};
	
	// Handle range change from the enhanced ruler
	const handleRangeChange = (newRange) => {
		setCurrentRange(newRange);
	};
	
	// Get visible frequencies
	const getVisibleFrequencies = () => {
		const range = currentRange || baseRange;
		
		return frequencies
			.filter(f => f.frequency >= range.min && f.frequency <= range.max)
			.map(f => ({
				...f,
				formattedFrequency: formatFrequency(f.frequency)
			}));
	};
	
	const getVisibleCompareFrequencies = () => {
		if (!compareFrequencies || compareFrequencies.length === 0) return [];
		
		const range = currentRange || baseRange;
		
		return compareFrequencies
			.filter(f => f.frequency >= range.min && f.frequency <= range.max)
			.map(f => ({
				...f,
				formattedFrequency: formatFrequency(f.frequency)
			}));
	};
	
	// Get visible shared notes based on current magnifier range
	const getVisibleSharedNotes = () => {
		if (!sharedNotes || sharedNotes.length === 0) return [];
		
		const range = currentRange || baseRange;
		
		return sharedNotes.filter(note => 
			(note.freq1 >= range.min && note.freq1 <= range.max) || 
			(note.freq2 >= range.min && note.freq2 <= range.max)
		);
	};
	
	const visibleFrequencies = getVisibleFrequencies();
	const visibleCompareFrequencies = getVisibleCompareFrequencies();
	const visibleSharedNotes = getVisibleSharedNotes();
	
	return (
		<div className="zoomed-view">
			<h3>{rangeLabels[selectedRange] || 'Selected Range'}</h3>
			
			{/* Enhanced Ruler System */}
			<EnhancedRulerSystem
				frequencies={frequencies.map(f => f.frequency)}
				compareFrequencies={compareFrequencies.map(f => f.frequency)}
				showComparison={compareFrequencies && compareFrequencies.length > 0}
				selectedRange={selectedRange}
				minFreq={minFreq}
				maxFreq={maxFreq}
				onRangeChange={handleRangeChange}
				isRootInSeconds={isRootInSeconds}
				rootOctave={frequencies.length > 0 ? frequencies[0].octave : null}
			/>
			
			{/* Display shared frequency information when comparison is active */}
			<div className="visible-frequencies-info">
				{compareFrequencies && compareFrequencies.length > 0 ? (
					<div className="shared-notes-section">
						<h4>Shared Notes (within 23.46 cents tolerance) - Visible in Magnifier: {visibleSharedNotes.length}</h4>
						{visibleSharedNotes && visibleSharedNotes.length > 0 ? (
							<div className="shared-notes-cards">
								{visibleSharedNotes.slice(0, 10).map((pair, index) => {
									// Find the full frequency objects to get interval names
									const freq1Data = frequencies.find(f => Math.abs(f.frequency - pair.freq1) < 0.001);
									const freq2Data = compareFrequencies.find(f => Math.abs(f.frequency - pair.freq2) < 0.001);
									
									return (
										<div className="shared-note-card" key={index}>
											<div className="shared-note-header">
												<span className="cents-badge">{pair.centsDifference} cents</span>
											</div>
											<div className="shared-note-frequencies">
												<div className="frequency-value">Root 1: {formatFrequency(pair.freq1)}</div>
												{freq1Data && freq1Data.intervalName && (
													<div className="interval-name">({freq1Data.intervalName})</div>
												)}
												<div className="frequency-value">Root 2: {formatFrequency(pair.freq2)}</div>
												{freq2Data && freq2Data.intervalName && (
													<div className="interval-name">({freq2Data.intervalName})</div>
												)}
											</div>
										</div>
									);
								})}
								{visibleSharedNotes.length > 10 && (
									<div className="shared-note-card more-card">
										+{visibleSharedNotes.length - 10} more shared notes
									</div>
								)}
							</div>
						) : (
							<p className="no-shared-notes">No shared notes found within current view range.</p>
						)}
					</div>
				) : (
					<>
						<h4>Visible Frequencies ({visibleFrequencies.length})</h4>
						<div className="frequency-cards">
							{visibleFrequencies.slice(0, 10).map((freq, index) => (
								<div className="frequency-card" key={index}>
									<div className="frequency-value">{freq.formattedFrequency}</div>
									<div className="frequency-details">{freq.intervalName} from {formatFrequency(freq.octave)}</div>
								</div>
							))}
							{visibleFrequencies.length > 10 && (
								<div className="frequency-card more-card">
									+{visibleFrequencies.length - 10} more frequencies
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default ZoomedView;