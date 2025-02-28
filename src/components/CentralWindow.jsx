import React from 'react';
import ZoomedView from './ZoomedView'; // Using our updated ZoomedView component
import ReadoutView from './ReadoutView';
import '../styles/CentralWindow.css';

function CentralWindow({
	viewMode,
	setViewMode,
	frequencies,
	compareFrequencies,
	sharedNotes,
	selectedRange,
	selectedScale,
	minFreq,
	maxFreq,
	isRootInSeconds
}) {
	console.log("CentralWindow rendering", {
		viewMode,
		frequenciesCount: frequencies?.length,
		compareCount: compareFrequencies?.length
	});

	try {
		return (
			<div className="central-window">
				<div className="view-controls">
					<button
						className={viewMode === 'zoomed' ? 'active' : ''}
						onClick={() => setViewMode('zoomed')}
					>
						<i className="view-icon">🔍</i>
						Zoomed View
					</button>
					<button
						className={viewMode === 'readout' ? 'active' : ''}
						onClick={() => setViewMode('readout')}
					>
						<i className="view-icon">📋</i>
						Readout View
					</button>
				</div>
				
				<div className="view-content">
					{viewMode === 'zoomed' ? (
						<ZoomedView
							frequencies={frequencies}
							compareFrequencies={compareFrequencies}
							sharedNotes={sharedNotes}
							selectedRange={selectedRange}
							minFreq={minFreq}
							maxFreq={maxFreq}
							isRootInSeconds={isRootInSeconds}
						/>
					) : (
						<ReadoutView
							frequencies={frequencies}
							compareFrequencies={compareFrequencies}
							sharedNotes={sharedNotes}
							selectedScale={selectedScale}
						/>
					)}
				</div>
			</div>
		);
	} catch (error) {
		console.error("Error rendering CentralWindow:", error);
		return (
			<div className="central-window">
				<div className="view-controls">
					<button
						className={viewMode === 'zoomed' ? 'active' : ''}
						onClick={() => setViewMode('zoomed')}
					>
						Zoomed View
					</button>
					<button
						className={viewMode === 'readout' ? 'active' : ''}
						onClick={() => setViewMode('readout')}
					>
						Readout View
					</button>
				</div>
				<div className="view-content">
					Error loading content. Check console for details.
				</div>
			</div>
		);
	}
}

export default CentralWindow;