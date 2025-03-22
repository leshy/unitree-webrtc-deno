import React, { useState, useEffect } from 'react';
import {Box, Text} from 'ink';
import { TerminalInputHandler, TerminalMouseEvent } from './inputEvents.js';

type Props = {
	name: string | undefined;
};

// Create a reusable panel component
const Panel = ({
	title,
	titleColor = 'blue',
	width,
	height,
	children,
	marginRight = 0,
	marginTop = 0,
	borderStyle = 'single'
}: {
	title: string;
	titleColor?: string;
	width: number;
	height: number;
	children: React.ReactNode;
	marginRight?: number;
	marginTop?: number;
	borderStyle?: 'single' | 'double' | 'round' | 'bold';
}) => (
	<Box 
		borderStyle={borderStyle}
		flexDirection="column"
		width={width} 
		height={height}
		marginRight={marginRight}
		marginTop={marginTop}
		paddingX={1}
	>
		<Box paddingX={1} borderStyle="single" borderColor={titleColor}>
			<Text bold color={titleColor}>{title}</Text>
		</Box>
		{children}
	</Box>
);

export default function App({name = 'Stranger'}: Props) {
	// State for mouse position
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const [mouseEventType, setMouseEventType] = useState('');
	const [terminalSize, setTerminalSize] = useState({ width: 80, height: 24 });
	const [isMouseSupported, setIsMouseSupported] = useState(false);
	const [logs, setLogs] = useState([
		'System started at 12:00:00 PM',
		`User ${name} logged in`,
		'Network connection established'
	]);

	// Initialize and clean up terminal input handler
	useEffect(() => {
		let inputHandler: TerminalInputHandler | null = null;
		
		try {
			// Initialize terminal input handler
			inputHandler = new TerminalInputHandler();
			setIsMouseSupported(true);
			
			// Add log entry
			setLogs(prev => [...prev, 'Mouse tracking enabled']);
			
			// Handle mouse events
			inputHandler.on('mouse', (event: TerminalMouseEvent) => {
				setMousePos({ x: event.x, y: event.y });
				setMouseEventType(event.eventType);
				
				// For mouse clicks and moves, update logs
				if (event.eventType === 'down') {
					setLogs(prev => {
						const newLogs = [...prev, `Mouse click at x=${event.x}, y=${event.y}`];
						// Keep only the last 5 logs
						return newLogs.slice(Math.max(0, newLogs.length - 5));
					});
				} else if (event.eventType === 'move' && Math.random() < 0.1) {
					// Only log some moves (10%) to avoid log flooding
					setLogs(prev => {
						const newLogs = [...prev, `Mouse move at x=${event.x}, y=${event.y}`];
						return newLogs.slice(Math.max(0, newLogs.length - 5));
					});
				}
			});
			
			// Handle keyboard events for exit
			inputHandler.on('key', (event) => {
				// Exit on ESC key
				if (event.key === 'escape') {
					process.exit(0);
				}
				
				// Exit on Ctrl+C
				if (event.ctrl && event.key === 'C') {
					process.exit(0);
				}
				
				// Log key presses
				setLogs(prev => {
					const newLogs = [...prev, `Key press: ${event.key}${event.ctrl ? ' (ctrl)' : ''}${event.alt ? ' (alt)' : ''}`];
					return newLogs.slice(Math.max(0, newLogs.length - 5));
				});
			});
			
			// Handle terminal resize events
			inputHandler.on('resize', (event) => {
				setTerminalSize({ width: event.width, height: event.height });
			});
			
		} catch (error) {
			// Mouse tracking failed to initialize
			setIsMouseSupported(false);
			console.error('Failed to initialize mouse tracking:', error);
		}
		
		// Clean up function
		return () => {
			if (inputHandler) {
				inputHandler.stop();
			}
		};
	}, [name]); // Only run once on component mount
	
	return (
		<Box flexDirection="column">
			{/* Header */}
			<Box 
				borderStyle="double" 
				borderColor="green" 
				paddingX={2}
				paddingY={1}
				width={80}
			>
				<Text bold color="green">DOOM Terminal Dashboard</Text>
			</Box>

			{/* Top row with three panels */}
			<Box flexDirection="row" marginTop={1}>
				<Panel 
					title="User Info" 
					titleColor="blue" 
					width={25} 
					height={8} 
					marginRight={2}
				>
					<Box paddingX={1} paddingY={1}>
						<Text>Name: <Text color="yellow">{name}</Text></Text>
					</Box>
					<Box paddingX={1}>
						<Text>Status: <Text color="green">Active</Text></Text>
					</Box>
					<Box paddingX={1}>
						<Text>ID: <Text color="cyan">USR-7238</Text></Text>
					</Box>
				</Panel>
				
				<Panel 
					title="System Stats" 
					titleColor="red" 
					width={25} 
					height={8} 
					marginRight={2}
				>
					<Box paddingX={1} paddingY={1}>
						<Text>Time: <Text color="magenta">12:00:00 PM</Text></Text>
					</Box>
					<Box paddingX={1}>
						<Text>Uptime: <Text color="cyan">123s</Text></Text>
					</Box>
					<Box paddingX={1}>
						<Text>CPU: <Text color="green">32%</Text></Text>
					</Box>
				</Panel>
				
				<Panel 
					title="Network" 
					titleColor="magenta" 
					width={25} 
					height={8}
				>
					<Box paddingX={1} paddingY={1}>
						<Text>Status: <Text backgroundColor="green" color="black"> ONLINE </Text></Text>
					</Box>
					<Box paddingX={1}>
						<Text>Ping: <Text color="green">32ms</Text></Text>
					</Box>
					<Box paddingX={1}>
						<Text>Conn: <Text color="yellow">4</Text></Text>
					</Box>
				</Panel>
			</Box>
			
			{/* Middle row with two panels */}
			<Box flexDirection="row" marginTop={1}>
				<Panel 
					title="Memory Usage" 
					titleColor="cyan" 
					width={38} 
					height={7} 
					marginRight={2}
				>
					<Box paddingX={1} paddingY={1}>
						<Text>Total: <Text color="yellow">8192 MB</Text></Text>
					</Box>
					<Box paddingX={1}>
						<Text>Used: <Text color="green">2048 MB (25%)</Text></Text>
					</Box>
					<Box paddingX={1}>
						<Text>Free: <Text color="cyan">6144 MB</Text></Text>
					</Box>
				</Panel>
				
				<Panel 
					title="Storage" 
					titleColor="blue" 
					width={38} 
					height={7}
				>
					<Box paddingX={1} paddingY={1}>
						<Text>Total: <Text color="yellow">512 GB</Text></Text>
					</Box>
					<Box paddingX={1}>
						<Text>Used: <Text color="red">384 GB (75%)</Text></Text>
					</Box>
					<Box paddingX={1}>
						<Text>Free: <Text color="green">128 GB</Text></Text>
					</Box>
				</Panel>
			</Box>

			{/* Mouse position panel - only shown if mouse support is available */}
			{isMouseSupported && (
				<Panel 
					title="Mouse Position" 
					titleColor="cyan" 
					width={80} 
					height={3}
					marginTop={1}
					borderStyle="bold"
				>
					<Box paddingX={1} paddingY={1}>
						<Text>
							Position: <Text color="yellow">X={mousePos.x}, Y={mousePos.y}</Text> | 
							Event: <Text color="green">{mouseEventType}</Text> | 
							Terminal: <Text color="magenta">{terminalSize.width}x{terminalSize.height}</Text>
						</Text>
					</Box>
				</Panel>
			)}

			{/* Bottom row with logs panel */}
			<Panel 
				title="System Logs" 
				titleColor="yellow" 
				width={80} 
				height={6}
				marginTop={1}
				borderStyle="round"
			>
				{logs.map((log, index) => (
					<Box key={index} paddingX={1} paddingY={0}>
						<Text>
							<Text color="gray">[{index}]</Text> {log}
						</Text>
					</Box>
				))}
			</Panel>

			{/* Footer */}
			<Box 
				borderStyle="round" 
				marginTop={1}
				paddingX={1}
				paddingY={1}
				width={80}
			>
				<Text>
					Current Session: <Text color="yellow">81</Text> | 
					Mouse: <Text color={isMouseSupported ? "green" : "red"}>
						{isMouseSupported ? "ENABLED" : "DISABLED"}
					</Text> | 
					Press <Text color="cyan">ESC</Text> to quit
				</Text>
			</Box>
		</Box>
	);
}