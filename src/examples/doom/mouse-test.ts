// Custom event interface
export interface TerminalMouseEvent {
  x: number
  y: number
  normalizedX: number
  normalizedY: number
  buttonPressed: boolean
  eventType: string
}

// Terminal input handler class
export class TerminalInputHandler {
  private termWidth: number
  private termHeight: number

  constructor() {
    // Initialize terminal for mouse event capture
    process.stdout.write("\x1b[?1003h") // Enable mouse movement tracking
    process.stdout.write("\x1b[?1006h") // Enable SGR extended mode

    // Set up raw mode
    process.stdin.setRawMode(true)
    process.stdin.resume()

    // Get initial terminal size
    this.termWidth = process.stdout.columns || 80
    this.termHeight = process.stdout.rows || 24

    // Set up event handlers
    this.setupResizeHandler()
    this.setupInputHandler()

    // Display startup info
    console.log(`Terminal size: ${this.termWidth}x${this.termHeight}`)
    console.log("Mouse and keyboard tracking enabled.")
    console.log("Press Ctrl+C to exit")
  }

  private setupResizeHandler(): void {
    process.stdout.on("resize", () => {
      this.termWidth = process.stdout.columns
      this.termHeight = process.stdout.rows
      console.log(`Terminal resized: ${this.termWidth}x${this.termHeight}`)
    })
  }

  private setupInputHandler(): void {
    process.stdin.on("data", (data: Buffer) => {
      const str = data.toString()

      // Check for Ctrl+C (ASCII value 3)
      if (str.length === 1 && str.charCodeAt(0) === 3) {
        this.cleanup()
        return
      }

      // Route input to appropriate handler
      if (str.startsWith("\x1b[<")) {
        this.handleMouseEvent(str)
      } else if (str.startsWith("\x1b")) {
        this.handleSpecialKey(str)
      } else if (str.length === 1) {
        this.handleRegularKey(str)
      }
    })

    // Set up cleanup on exit
    process.on("SIGINT", () => this.cleanup())
    process.on("SIGTERM", () => this.cleanup())
  }

  private handleMouseEvent(str: string): void {
    try {
      // Parse SGR mouse event format: ESC[<params;x;yM or ESC[<params;x;ym
      const match = str.match(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/)
      if (!match) return

      const [, params, xStr, yStr, eventTypeChar] = match

      // Parse event details
      const paramsNum = parseInt(params, 10)
      const buttonCode = paramsNum & 3 // First two bits indicate button
      const buttonState = (paramsNum >> 2) & 1 // Third bit indicates pressed state
      const moveFlag = paramsNum & 32 // 32 bit indicates motion

      // Parse coordinates
      const x = parseInt(xStr, 10)
      const y = parseInt(yStr, 10)

      // Determine event type
      const isUp = eventTypeChar === "m"
      const isDown = eventTypeChar === "M"
      let eventType = "unknown"

      if (moveFlag && buttonState === 0) eventType = "move"
      else if (moveFlag && buttonState === 1) eventType = "drag"
      else if (isDown) eventType = "down"
      else if (isUp) eventType = "up"

      // Calculate normalized coordinates (0-1)
      const normalizedX = x / this.termWidth
      const normalizedY = y / this.termHeight

      const mouseEvent: TerminalMouseEvent = {
        x,
        y,
        normalizedX,
        normalizedY,
        buttonPressed: buttonState === 1,
        eventType,
      }

      // Only report movements and clicks, not every mouse event
      if (eventType === "move" || eventType === "down" || eventType === "up") {
        console.log(
          `Mouse ${eventType}: x=${x}, y=${y} ` +
            `(normalized: ${normalizedX.toFixed(3)}, ${
              normalizedY.toFixed(3)
            })`,
        )
      }
    } catch (err) {
      // Ignore parsing errors
    }
  }

  private handleSpecialKey(str: string): void {
    // Map of escape sequences to key names
    const specialKeyMap: Record<string, string> = {
      "\x1b[A": "up arrow",
      "\x1b[B": "down arrow",
      "\x1b[C": "right arrow",
      "\x1b[D": "left arrow",
      "\x1bOP": "F1",
      "\x1bOQ": "F2",
      "\x1bOR": "F3",
      "\x1bOS": "F4",
      "\x1b[15~": "F5",
      "\x1b[17~": "F6",
      "\x1b[18~": "F7",
      "\x1b[19~": "F8",
      "\x1b[20~": "F9",
      "\x1b[21~": "F10",
      "\x1b[23~": "F11",
      "\x1b[24~": "F12",
      "\x1b": "escape",
      "\x1b[H": "home",
      "\x1b[F": "end",
      "\x1b[5~": "page up",
      "\x1b[6~": "page down",
      "\x1b[2~": "insert",
      "\x1b[3~": "delete",
    }

    // Check for known special keys
    if (specialKeyMap[str]) {
      console.log(`Key pressed: ${specialKeyMap[str]}`)
      return
    }

    // Check for Alt+key combinations
    if (str.length === 2 && str[0] === "\x1b") {
      console.log(`Key pressed: ${str[1]} (alt)`)
      return
    }

    // Unrecognized escape sequence
    const hex = Array.from(str).map((c) =>
      c.charCodeAt(0).toString(16).padStart(2, "0")
    ).join(" ")
    console.log(`Unknown special key: ${hex}`)
  }

  private handleRegularKey(str: string): void {
    const charCode = str.charCodeAt(0)

    // Control characters
    if (charCode < 32) {
      const ctrlChar = String.fromCharCode(charCode + 64)
      console.log(`Key pressed: ${ctrlChar} (ctrl)`)
    } // Regular printable characters
    else {
      console.log(`Key pressed: ${str}`)
    }

    // Handle specific keys
    switch (str) {
      case " ":
        console.log("Space pressed")
        break
      case "\r":
        console.log("Enter pressed")
        break
      case "\t":
        console.log("Tab pressed")
        break
      case "\b":
        console.log("Backspace pressed")
        break
    }
  }

  public cleanup(): void {
    process.stdout.write("\x1b[?1003l") // Disable mouse movement tracking
    process.stdout.write("\x1b[?1006l") // Disable SGR extended mode
    process.stdin.setRawMode(false)
    process.stdin.pause()
    console.log("\nMouse and keyboard tracking disabled")
    process.exit(0)
  }
}

// Start the application
const terminalInputHandler = new TerminalInputHandler()
