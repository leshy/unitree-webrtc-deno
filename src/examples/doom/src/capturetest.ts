import {
    KeyboardEvent,
    ResizeEvent,
    TerminalInputHandler,
    TerminalMouseEvent,
} from "./inputEvents.js"

// Create input handler
const inputHandler = new TerminalInputHandler()

// Display startup info
console.log("Terminal input tracking started")
console.log("Press Ctrl+C to exit")

// Listen for resize events
inputHandler.on("resize", (event: ResizeEvent) => {
    console.log(`Terminal resized: ${event.width}x${event.height}`)
})

// Listen for mouse events
inputHandler.on("mouse", (event: TerminalMouseEvent) => {
    console.log(
        `Mouse ${event.eventType}: x=${event.x}, y=${event.y} ` +
            `(normalized: ${event.normalizedX.toFixed(3)}, ${
                event.normalizedY.toFixed(3)
            })`,
    )
})

// Listen for keyboard events
inputHandler.on("key", (event: KeyboardEvent) => {
    if (event.isSpecial) {
        let description = event.key
        if (event.ctrl) description += " (ctrl)"
        if (event.alt) description += " (alt)"
        if (event.meta) description += " (meta)"
        console.log(`Special key pressed: ${description}`)
    } else {
        console.log(`Key pressed: ${event.key}`)
    }
})

// Handle interrupts (like Ctrl+C)
inputHandler.on("interrupt", () => {
    console.log("Interrupt received, exiting...")
    inputHandler.stop()
    process.exit(0)
})

// Handle cleanup
inputHandler.on("cleanup", () => {
    console.log("Cleanup: Terminal input tracking disabled")
})