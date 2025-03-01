import React, { useState, useEffect } from 'react';
import '../styles/WelcomePopup.css';

function WelcomePopup() {
	// State to control visibility of the popup
	const [isVisible, setIsVisible] = useState(false);
	
	// Show the popup when the component mounts
	useEffect(() => {
		// Small delay to ensure the animation works correctly
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 300);
		
		return () => clearTimeout(timer);
	}, []);
	
	// Handle closing the popup
	const handleClose = () => {
		setIsVisible(false);
	};
	
	return (
		<div className={`welcome-popup-overlay ${isVisible ? 'visible' : ''}`}>
			<div className="welcome-popup">
				<button className="close-button" onClick={handleClose}>×</button>
				<div className="popup-content">
					<h1>The Harmonizer</h1>
					<p>
						This tool is meant to extend the use of music theory into time and 
						extended frequencies outside of the audible range. The goal is to 
						find patterns in all frequency ranges for hyper-tuning things to 
						a specific frequency. This app can also compare frequencies of two
						different Root Notes and find similar frequencies in both scales
						with an adjustable tolerance for finding extended resonance patterns.
					</p>
					<p>
						Some helpful tips:<br />
						Zoomed View will show you the frequencies in the range of the magnifier 
						on the Magnification Ruler. You can zoom the magnifier 
						and move it across the ruler. You can also view the colored ticks in
						Logarithmic or Linear scales.<br />
						Readout View will show you the frequency tables for the Root Note,
						Comparison Root, and any shared frequencies will be listed. 						
					</p>
					<button className="start-button" onClick={handleClose}>
						Continue
					</button>
				</div>
			</div>
		</div>
	);
}

export default WelcomePopup;