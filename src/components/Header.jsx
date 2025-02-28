import React from 'react';
import '../styles/Header.css';

function Header({
	rootNote,
	setRootNote,
	isRootInSeconds,
	setIsRootInSeconds,
	compareRoot,
	setCompareRoot,
	isCompareRootInSeconds,
	setIsCompareRootInSeconds,
	showComparison,
	setShowComparison,
	selectedScale,
	setSelectedScale,
	selectedRange,
	setSelectedRange
}) {
	console.log("Header rendering", {
		rootNote, 
		showComparison,
		compareRoot,
		selectedScale
	});

	try {
		// Scale options for dropdown
		const scaleOptions = [
			{ value: 'just-intonation', label: 'Just Intonation' },
			{ value: 'pythagorean', label: 'Pythagorean Tuning' },
			{ value: 'et-12', label: '12 Equal Temperament' },
			{ value: 'et-31', label: '31 Equal Temperament' },
			{ value: 'et-53', label: '53 Equal Temperament' }
		];
		
		// Range options for dropdown
		const rangeOptions = [
			{ value: 'full', label: 'Full Range' },
			{ value: 'time', label: 'Time (100 years to 1 second)' },
			{ value: 'sound', label: 'Sound (20Hz to 20,000Hz)' },
			{ value: 'color', label: 'Color Spectrum' },
			{ value: 'radio', label: 'Radio Waves' },
			{ value: 'radiation', label: 'Radiation' }
		];
		
		return (
			<div className="header">
				<div className="config-row">
					<div className="config-item">
						<label htmlFor="range-select">Range Selection</label>
						<select
							id="range-select"
							value={selectedRange}
							onChange={(e) => setSelectedRange(e.target.value)}
						>
							{rangeOptions.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>
					
					<div className="config-item">
						<label htmlFor="root-note">Root Note</label>
						<input
							id="root-note"
							type="text"
							value={rootNote}
							onChange={(e) => setRootNote(e.target.value)}
						/>
						<div className="radio-group">
							<label>
								<input
									type="radio"
									checked={!isRootInSeconds}
									onChange={() => setIsRootInSeconds(false)}
								/>
								Hertz
							</label>
							<label>
								<input
									type="radio"
									checked={isRootInSeconds}
									onChange={() => setIsRootInSeconds(true)}
								/>
								Seconds
							</label>
						</div>
					</div>
					
					<div className="config-item">
						<label htmlFor="scale-select">Scale</label>
						<select
							id="scale-select"
							value={selectedScale}
							onChange={(e) => setSelectedScale(e.target.value)}
						>
							{scaleOptions.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>
				</div>
				
				<div className="config-row">
					<div className="config-item compare-section">
						<label>
							<input
								type="checkbox"
								checked={showComparison}
								onChange={(e) => {
									setShowComparison(e.target.checked);
									// Initialize with some value when checkbox is first checked
									if (e.target.checked && !compareRoot) {
										setCompareRoot("523.25"); // Default to C5 if no value set
									}
								}}
							/>
							Compare Roots
						</label>
						
						{showComparison && (
							<div className="compare-config">
								<input
									type="text"
									value={compareRoot}
									onChange={(e) => setCompareRoot(e.target.value)}
									placeholder="Second Root Note"
								/>
								<div className="radio-group">
									<label>
										<input
											type="radio"
											checked={!isCompareRootInSeconds}
											onChange={() => setIsCompareRootInSeconds(false)}
										/>
										Hertz
									</label>
									<label>
										<input
											type="radio"
											checked={isCompareRootInSeconds}
											onChange={() => setIsCompareRootInSeconds(true)}
										/>
										Seconds
									</label>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	} catch (error) {
		console.error("Error rendering Header:", error);
		return (
			<div className="header">
				<h2>The Harmonizer - Error loading controls</h2>
				<p>Please check the console for error details.</p>
			</div>
		);
	}
}

export default Header;