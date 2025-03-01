import React, { useState, useRef, useEffect } from 'react';
import { calculatePosition, generateRulerTicks, getFrequencyRangeLabel } from '../utils/rulerUtils';
import { frequencyToColor } from '../utils/colorUtils';
import { formatFrequency, getIntervalName } from '../utils/frequencyUtils';
import '../styles/EnhancedRulerSystem.css';

function EnhancedRulerSystem({
	frequencies,
	compareFrequencies,
	showComparison,
	selectedRange,
	minFreq,
	maxFreq,
	isLogScale = true,
	onRangeChange,
	isRootInSeconds = false, // Add property to control display units
	rootOctave = null // Add property to get root octave for scale degree calculation
}) {
	// State for the zoomed view controls
	const [zoomLevel, setZoomLevel] = useState(1); // Start at 1x zoom (was 7x)
	const [isDragging, setIsDragging] = useState(false); // For drag functionality
	const [useLogScale, setUseLogScale] = useState(false); // Start in linear mode (was true for log)
	const [focusPoint, setFocusPoint] = useState(0.5); // Normalized position (0-1) where zoom is centered
	
	// Helper to get the frequency value from either an object or a number
	const getFrequencyValue = (freqItem) => {
		// If it's a plain number, return it
		if (typeof freqItem === 'number') {
			return freqItem;
		}
		// If it's an object with a frequency property, return that
		if (freqItem && typeof freqItem === 'object' && 'frequency' in freqItem) {
			return freqItem.frequency;
		}
		// Fallback (should not happen)
		console.warn('Unknown frequency format:', freqItem);
		return 0;
	};
	
	// Define range bounds for each selected range
	const rangeBounds = {
		'full': { min: minFreq, max: maxFreq },
		'time': { min: minFreq, max: 1 },
		'sound': { min: 20, max: 20000 },
		'color': { min: 4e14, max: 7.9e14 },
		'radio': { min: 3e4, max: 3e11 },
		'radiation': { min: 3e15, max: 3e19 }
	};
	
	// Determine current view range
	const baseRange = rangeBounds[selectedRange] || rangeBounds.full;
	
	// Refs for ruler elements
	const fullRulerRef = useRef(null);
	const magnifierRef = useRef(null);
	
	// Format frequency based on display preference - now we use the formatFrequency 
	// utility which already handles both Hz and time units appropriately
	
	// Calculate scale degree relative to root
	const calculateScaleDegree = (frequency, rootFreq) => {
		if (!rootFreq) return null;
		
		// Calculate cents above root
		const cents = 1200 * Math.log2(frequency / rootFreq);
		
		// Map cents to scale degree
		// 0 cents = 1st degree (root)
		// 100 cents = 2nd degree (minor 2nd)
		// 200 cents = 3rd degree (major 2nd)
		// etc.
		
		const degree = Math.round(cents / 100) + 1;
		return degree;
	};
	
	// Calculate the zoomed range based on zoom level and focus point
	const calculateZoomedRange = () => {
		if (useLogScale) {
			// For logarithmic scale - unchanged
			const logMin = Math.log10(baseRange.min);
			const logMax = Math.log10(baseRange.max);
			const logRange = logMax - logMin;
			
			// Zoom window is smaller as zoom level increases
			const zoomWindowSize = logRange / zoomLevel;
			
			// Calculate new min and max based on focus point
			// focusPoint is 0-1 representing where in the range we're focused
			const newLogMin = logMin + (logRange * focusPoint) - (zoomWindowSize / 2);
			const newLogMax = newLogMin + zoomWindowSize;
			
			// Clamp to ensure we don't go outside the base range
			const clampedLogMin = Math.max(newLogMin, logMin);
			const clampedLogMax = Math.min(newLogMax, logMax);
			
			return {
				min: Math.pow(10, clampedLogMin),
				max: Math.pow(10, clampedLogMax)
			};
		} else {
			// For linear scale - always use logarithmic mapping to ensure smooth magnifier movement
			// especially important for time domain and other extreme ranges
			const logMin = Math.log10(baseRange.min);
			const logMax = Math.log10(baseRange.max);
			const logRange = logMax - logMin;
			
			// Map the linear focus point to a logarithmic position
			const logPosition = logMin + (logRange * focusPoint);
			
			// Calculate a window size that feels proportional
			const logWindowSize = logRange / zoomLevel;
			
			// Calculate new min and max in log space
			let newLogMin = logPosition - (logWindowSize / 2);
			let newLogMax = logPosition + (logWindowSize / 2);
			
			// Clamp to ensure we don't go outside the base range
			newLogMin = Math.max(newLogMin, logMin);
			newLogMax = Math.min(newLogMax, logMax);
			
			// Convert back to linear space
			return {
				min: Math.pow(10, newLogMin),
				max: Math.pow(10, newLogMax)
			};
		}
	};
	
	// Get current zoomed range
	const zoomedRange = calculateZoomedRange();
	
	// Generate ticks for both rulers
	const fullRulerTicks = generateRulerTicks(baseRange.min, baseRange.max);
	const zoomedRulerTicks = generateRulerTicks(zoomedRange.min, zoomedRange.max);
	
	// Filter frequencies to those within the current range for zoomed view
	const visibleFrequencies = frequencies
		.filter(freq => {
			const freqValue = getFrequencyValue(freq);
			return freqValue >= zoomedRange.min && freqValue <= zoomedRange.max;
		});
	
	const visibleCompareFrequencies = compareFrequencies
		.filter(freq => {
			const freqValue = getFrequencyValue(freq);
			return freqValue >= zoomedRange.min && freqValue <= zoomedRange.max;
		});
	
	// Update parent component with new range when it changes
	useEffect(() => {
		if (onRangeChange) {
			onRangeChange(zoomedRange);
		}
	}, [zoomedRange, onRangeChange]);
	
	// Keep the click handler for users who want to click directly on the ruler
	const handleRulerClick = (e) => {
		if (!fullRulerRef.current || isDragging) return;
		
		const rect = fullRulerRef.current.getBoundingClientRect();
		const clickPositionNormalized = (e.clientX - rect.left) / rect.width;
		
		// Update the focus point
		setFocusPoint(Math.max(0, Math.min(1, clickPositionNormalized)));
	};
	
	// Update magnifier position based on focus point
	useEffect(() => {
		if (magnifierRef.current && fullRulerRef.current) {
			const fullWidth = fullRulerRef.current.offsetWidth;
			// The width of the magnifier depends on zoom level
			const magnifierWidth = (fullWidth / zoomLevel);
			
			// Position the magnifier centered on the focus point
			const leftPosition = (focusPoint * fullWidth) - (magnifierWidth / 2);
			
			// Ensure magnifier stays within ruler bounds
			const clampedLeft = Math.max(0, Math.min(fullWidth - magnifierWidth, leftPosition));
			
			// Set fixed width
			magnifierRef.current.style.width = `${magnifierWidth}px`;
			magnifierRef.current.style.left = `${clampedLeft}px`;
			
			// If the magnifier width plus left position would exceed the ruler width, 
			// adjust the width to fit within the ruler bounds
			const rightEdge = clampedLeft + magnifierWidth;
			if (rightEdge > fullWidth) {
				const adjustedWidth = fullWidth - clampedLeft;
				magnifierRef.current.style.width = `${adjustedWidth}px`;
			}
		}
	}, [focusPoint, zoomLevel]);
	
	// Handle zoom in and out
	const handleZoomIn = () => {
		setZoomLevel(prevZoom => Math.min(prevZoom * 1.5, 100));
	};
	
	const handleZoomOut = () => {
		setZoomLevel(prevZoom => Math.max(prevZoom / 1.5, 1));
	};
	
	// Handle dragging the magnifier
	const handleMagnifierMouseDown = (e) => {
		e.stopPropagation();
		setIsDragging(true);
	};
	
	// Handle mouse move with prevention of text selection
	const handleMouseMove = (e) => {
		if (isDragging && fullRulerRef.current) {
			// Prevent default browser behavior like text selection
			e.preventDefault();
			
			const rect = fullRulerRef.current.getBoundingClientRect();
			const clickPositionNormalized = (e.clientX - rect.left) / rect.width;
			setFocusPoint(Math.max(0, Math.min(1, clickPositionNormalized)));
		}
	};
	
	const handleMouseUp = () => {
		setIsDragging(false);
	};
	
	// Add and remove event listeners for dragging
	useEffect(() => {
		const handleMouseMoveWrapper = (e) => {
			if (isDragging) {
				handleMouseMove(e);
				// Prevent text selection during drag
				e.preventDefault();
			}
		};
		
		document.addEventListener('mousemove', handleMouseMoveWrapper);
		document.addEventListener('mouseup', handleMouseUp);
		
		// Add CSS to body to prevent selection while dragging
		if (isDragging) {
			document.body.style.userSelect = 'none';
			document.body.style.WebkitUserSelect = 'none';
			document.body.style.msUserSelect = 'none';
		}
		
		return () => {
			document.removeEventListener('mousemove', handleMouseMoveWrapper);
			document.removeEventListener('mouseup', handleMouseUp);
			
			// Reset body styles
			document.body.style.userSelect = '';
			document.body.style.WebkitUserSelect = '';
			document.body.style.msUserSelect = '';
		};
	}, [isDragging, handleMouseMove, handleMouseUp]);
	
	// Toggle scale type
	const toggleScale = () => {
		setUseLogScale(prev => !prev);
	};
	
	// Calculate position on the ruler - accounting for log vs linear scale
	const getTickPosition = (frequency, min, max, isLog = useLogScale) => {
		if (isLog) {
			return calculatePosition(frequency, min, max);
		} else {
			// Linear scale calculation
			return ((frequency - min) / (max - min)) * 100;
		}
	};
	
	return (
		<div className="enhanced-ruler-system">
			{/* Zoomed Ruler View */}
			<div className="zoomed-ruler-container">
				{/* Frequency Ticks Section */}
				<div className="zoomed-view-section">
					<div className="zoomed-ticks">
						{visibleFrequencies.map((freqItem, index) => {
							const freqValue = getFrequencyValue(freqItem);
							// Get additional data if it's available
							const hasFreqData = typeof freqItem === 'object' && 'intervalName' in freqItem;
							
							return (
								<div
									key={`tick-${index}`}
									className="tick"
									style={{
										left: `${getTickPosition(freqValue, zoomedRange.min, zoomedRange.max, useLogScale)}%`,
										backgroundColor: frequencyToColor(freqValue)
									}}
									data-frequency={freqValue}
								>
									<div className="tick-tooltip">
										<div className="tooltip-title">Frequency: {formatFrequency(freqValue)}</div>
										{hasFreqData && (
											<>
												<div className="tooltip-row">Interval: {freqItem.intervalName}</div>
												<div className="tooltip-row">Octave: {formatFrequency(freqItem.octave || 0)}</div>
												{freqItem.ratio && <div className="tooltip-row">Ratio: {freqItem.ratio}</div>}
											</>
										)}
									</div>
								</div>
							);
						})}
						
						{showComparison && visibleCompareFrequencies.map((freqItem, index) => {
							const freqValue = getFrequencyValue(freqItem);
							const hasFreqData = typeof freqItem === 'object' && 'intervalName' in freqItem;
							
							return (
								<div
									key={`compare-tick-${index}`}
									className="compare-tick"
									style={{
										left: `${getTickPosition(freqValue, zoomedRange.min, zoomedRange.max, useLogScale)}%`,
										backgroundColor: frequencyToColor(freqValue)
									}}
									data-frequency={freqValue}
								>
									<div className="tick-tooltip">
										<div className="tooltip-title">Comparison: {formatFrequency(freqValue)}</div>
										{hasFreqData && (
											<>
												<div className="tooltip-row">Interval: {freqItem.intervalName}</div>
												<div className="tooltip-row">Octave: {formatFrequency(freqItem.octave || 0)}</div>
												{freqItem.ratio && <div className="tooltip-row">Ratio: {freqItem.ratio}</div>}
											</>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
				
				{/* Ruler Section */}
				<div className="zoomed-ruler-section">
					<div className="zoomed-ruler">
						<div className="ruler-range-labels">
							<span className="range-label left">{formatFrequency(zoomedRange.min)}</span>
							<span className="range-label center">{getFrequencyRangeLabel((zoomedRange.min + zoomedRange.max) / 2)}</span>
							<span className="range-label right">{formatFrequency(zoomedRange.max)}</span>
						</div>
						
						{zoomedRulerTicks.map((tick, index) => (
							<div
								key={`zoomed-tick-${index}`}
								className={`ruler-tick ${tick.isMajor ? 'major' : 'minor'}`}
								style={{ left: `${tick.position}%` }}
							>
								<div className="tick-mark"></div>
								{tick.label && <div className="tick-label">{tick.label}</div>}
							</div>
						))}
					</div>
				</div>
				
				{/* Controls Section */}
				<div className="controls-section">
					<div className="scale-controls">
						<button 
							className={`scale-toggle ${useLogScale ? 'active' : ''}`}
							onClick={toggleScale}
						>
							{useLogScale ? 'Logarithmic Scale' : 'Linear Scale'}
						</button>
						
						<div className="zoom-controls">
							<span className="zoom-label">Zoom:</span>
							<button onClick={handleZoomOut} disabled={zoomLevel <= 1}>
								<span className="zoom-icon">−</span>
							</button>
							<span className="zoom-level">{zoomLevel.toFixed(1)}x</span>
							<button onClick={handleZoomIn} disabled={zoomLevel >= 100}>
								<span className="zoom-icon">+</span>
							</button>
						</div>
					</div>
				</div>
			</div>
			
			{/* Full Range Ruler with Magnifier Overlay */}
			<div 
				className="full-ruler-container" 
				ref={fullRulerRef}
				onClick={handleRulerClick}
			>
				<div className="full-ruler">
					<div className="ruler-range-labels">
						<span className="range-label left">{formatFrequency(baseRange.min)}</span>
						<span className="range-label center">{selectedRange.charAt(0).toUpperCase() + selectedRange.slice(1)} Range</span>
						<span className="range-label right">{formatFrequency(baseRange.max)}</span>
					</div>
					
					{fullRulerTicks.map((tick, index) => (
						<div
							key={`full-tick-${index}`}
							className={`ruler-tick ${tick.isMajor ? 'major' : 'minor'}`}
							style={{ left: `${tick.position}%` }}
						>
							<div className="tick-mark"></div>
							{tick.isMajor && tick.label && <div className="tick-label">{tick.label}</div>}
						</div>
					))}
					
					{/* Magnifier Overlay */}
					<div 
						className="magnifier" 
						ref={magnifierRef}
						onMouseDown={handleMagnifierMouseDown}
					>
						<div className="magnifier-handle left"></div>
						<div className="magnifier-content">
							<span className="magnifier-drag-hint">Drag to move</span>
						</div>
						<div className="magnifier-handle right"></div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default EnhancedRulerSystem;