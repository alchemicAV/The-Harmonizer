import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EnhancedRulerSystem from './components/EnhancedRulerSystem';
import CentralWindow from './components/CentralWindow';
import { parseRootNote, findSharedNotes } from './utils/frequencyUtils';
import { calculateScaleFrequencies } from './utils/scaleUtils';
import './styles/App.css';

function App() {
	// Constants for the full frequency range
	const MIN_FREQ = 1 / (100 * 365 * 24 * 60 * 60); // 100 years in Hz
	const MAX_FREQ = 5.16e15; // 5160 THz
	
	// Configuration state
	const [rootNote, setRootNote] = useState('440');
	const [rootNoteHz, setRootNoteHz] = useState(440); // Default A4 = 440Hz
	const [isRootInSeconds, setIsRootInSeconds] = useState(false);
	
	const [compareRoot, setCompareRoot] = useState('');
	const [compareRootHz, setCompareRootHz] = useState(null);
	const [isCompareRootInSeconds, setIsCompareRootInSeconds] = useState(false);
	const [showComparison, setShowComparison] = useState(false);
	
	const [selectedScale, setSelectedScale] = useState('just-intonation');
	const [selectedRange, setSelectedRange] = useState('full');
	const [viewMode, setViewMode] = useState('zoomed');
	
	// Calculated data state
	const [frequencies, setFrequencies] = useState([]);
	const [compareFrequencies, setCompareFrequencies] = useState([]);
	const [sharedNotes, setSharedNotes] = useState([]);
	
	// Parse root note input and convert to Hz if necessary
	useEffect(() => {
		if (rootNote) {
			const parsedHz = parseRootNote(rootNote, isRootInSeconds);
			if (parsedHz !== null && !isNaN(parsedHz) && parsedHz > 0) {
				setRootNoteHz(parsedHz);
			}
		} else {
			setFrequencies([]);
		}
	}, [rootNote, isRootInSeconds]);
	
	// Parse comparison root note
	useEffect(() => {
		if (showComparison && compareRoot) {
			const parsedHz = parseRootNote(compareRoot, isCompareRootInSeconds);
			if (parsedHz !== null && !isNaN(parsedHz) && parsedHz > 0) {
				setCompareRootHz(parsedHz);
			}
		} else {
			setCompareRootHz(null);
			setCompareFrequencies([]);
			setSharedNotes([]);
		}
	}, [showComparison, compareRoot, isCompareRootInSeconds]);
	
	// Calculate frequencies based on root note and scale
	useEffect(() => {
		if (rootNoteHz) {
			const calculatedFreqs = calculateScaleFrequencies(
				rootNoteHz,
				selectedScale,
				MIN_FREQ,
				MAX_FREQ
			);
			setFrequencies(calculatedFreqs);
		}
	}, [rootNoteHz, selectedScale]);
	
	// Calculate comparison frequencies
	useEffect(() => {
		if (showComparison && compareRootHz) {
			const compareFreqs = calculateScaleFrequencies(
				compareRootHz,
				selectedScale,
				MIN_FREQ,
				MAX_FREQ
			);
			setCompareFrequencies(compareFreqs);
		}
	}, [showComparison, compareRootHz, selectedScale]);
	
	// Find shared notes between root and comparison frequencies
	useEffect(() => {
		if (frequencies.length > 0 && compareFrequencies.length > 0) {
			// Convert frequencies to Hz for comparison
			const freqArray1 = frequencies.map(f => f.frequency);
			const freqArray2 = compareFrequencies.map(f => f.frequency);
			
			// Find shared notes using our enhanced function
			const shared = findSharedNotes(freqArray1, freqArray2);
			
			// Sort shared notes by centsDifference for better display
			const sortedShared = [...shared].sort((a, b) => 
				parseFloat(a.centsDifference) - parseFloat(b.centsDifference)
			);
			
			setSharedNotes(sortedShared);
		}
	}, [frequencies, compareFrequencies]);
	
	return (
		<div className="app">
			<h1>The Harmonizer</h1>
			
			<Header
				rootNote={rootNote}
				setRootNote={setRootNote}
				isRootInSeconds={isRootInSeconds}
				setIsRootInSeconds={setIsRootInSeconds}
				compareRoot={compareRoot}
				setCompareRoot={setCompareRoot}
				isCompareRootInSeconds={isCompareRootInSeconds}
				setIsCompareRootInSeconds={setIsCompareRootInSeconds}
				showComparison={showComparison}
				setShowComparison={setShowComparison}
				selectedScale={selectedScale}
				setSelectedScale={setSelectedScale}
				selectedRange={selectedRange}
				setSelectedRange={setSelectedRange}
			/>
			
			<CentralWindow
				viewMode={viewMode}
				setViewMode={setViewMode}
				frequencies={frequencies}
				compareFrequencies={compareFrequencies}
				sharedNotes={sharedNotes}
				selectedRange={selectedRange}
				selectedScale={selectedScale}
				minFreq={MIN_FREQ}
				maxFreq={MAX_FREQ}
				isRootInSeconds={isRootInSeconds}
			/>
			
			{/* The old FrequencyRuler is now replaced by our Enhanced Ruler System */}
			{/* Only show it when not in zoomed view mode to avoid duplicate rulers */}
			{viewMode !== 'zoomed' && (
				<EnhancedRulerSystem
					frequencies={frequencies.map(f => f.frequency)}
					compareFrequencies={compareFrequencies.map(f => f.frequency)}
					showComparison={showComparison && compareRootHz !== null}
					selectedRange={selectedRange}
					minFreq={MIN_FREQ}
					maxFreq={MAX_FREQ}
					isRootInSeconds={isRootInSeconds}
					rootOctave={frequencies.length > 0 ? frequencies[0].octave : null}
				/>
			)}
		</div>
	);
}

export default App;