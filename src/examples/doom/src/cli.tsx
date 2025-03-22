#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
	Usage
	  $ doom

	Options
		--name    Your name
		--no-mouse  Disable mouse capture (use if you experience issues)

	Examples
	  $ doom --name=Jane
	  $ doom --no-mouse
`,
	{
		importMeta: import.meta,
		flags: {
			name: {
				type: 'string',
			},
			mouse: {
				type: 'boolean',
				default: true
			}
		},
	},
);

// Handle cleanup on exit
process.on('exit', () => {
	// Nothing specific to clean up here as the App component's useEffect cleanup will handle termination
	console.log('\nThank you for using DOOM Terminal Dashboard!');
});

// Forward signals to ensure clean exit
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

// Set environment variable to disable mouse if --no-mouse flag is used
if (!cli.flags.mouse) {
	process.env['NO_MOUSE_CAPTURE'] = 'true';
}

// Render the UI with graceful cleanup on exit
render(<App name={cli.flags.name} />);