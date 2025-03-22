import { EventEmitter } from "events"

// Event interfaces
export interface TerminalMouseEvent {
  x: number
  y: number
  normalizedX: number
  normalizedY: number
  buttonPressed: boolean
  eventType: string
}

export interface KeyboardEvent {
  key: string
  isSpecial: boolean
  ctrl: boolean
  alt: boolean
  meta: boolean
  raw: string
}

export interface ResizeEvent {
  width: number
  height: number
}

// Terminal input handler class
export class TerminalInputHandler extends EventEmitter {
  private termWidth: number
  private termHeight: number

  constructor() {
    super()

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

    // Emit initial resize event
    this.emit("resize", {
      width: this.termWidth,
      height: this.termHeight,
    })
  }

  private setupResizeHandler(): void {
    process.stdout.on("resize", () => {
      this.termWidth = process.stdout.columns
      this.termHeight = process.stdout.rows

      const resizeEvent: ResizeEvent = {
        width: this.termWidth,
        height: this.termHeight,
      }

      this.emit("resize", resizeEvent)
    })
  }

  private setupInputHandler(): void {
    process.stdin.on("data", (data: Buffer) => {
      const str = data.toString()

      // Check for Ctrl+C (ASCII value 3)
      if (str.length === 1 && str.charCodeAt(0) === 3) {
        // Create a keyboard event for Ctrl+C
        const ctrlCEvent: KeyboardEvent = {
          key: "C",
          isSpecial: true,
          ctrl: true,
          alt: false,
          meta: false,
          raw: str,
        }

        // Emit the event so main.ts can respond
        this.emit("key", ctrlCEvent)
        this.emit("key:C-ctrl", ctrlCEvent)

        // Also emit a specific interrupt event
        this.emit("interrupt", ctrlCEvent)

        // Don't immediately call cleanup - let the handler decide
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

    // Set up cleanup on exit signals
    process.on("SIGINT", () => {
      this.emit("interrupt")
      this.stop()
    })

    process.on("SIGTERM", () => {
      this.emit("interrupt")
      this.stop()
    })
  }

  private handleMouseEvent(str: string): void {
    try {
      // Parse SGR mouse event format: ESC[<params;x;yM or ESC[<params;x;ym
      const match = str.match(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/)
      if (!match) return

      const [, params, xStr, yStr, eventTypeChar] = match

      // Parse event details
      const paramsNum = parseInt(params, 10)
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

      // Emit mouse events - but filter out unknown events
      if (eventType !== "unknown") {
        this.emit("mouse", mouseEvent)

        // Also emit specific event types for convenience
        this.emit(`mouse:${eventType}`, mouseEvent)
      }
    } catch (err) {
      this.emit("error", new Error(`Failed to parse mouse event: ${err}`))
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

    let keyEvent: KeyboardEvent = {
      key: "",
      isSpecial: true,
      ctrl: false,
      alt: false,
      meta: false,
      raw: str,
    }

    // Check for known special keys
    if (specialKeyMap[str]) {
      keyEvent.key = specialKeyMap[str]
      this.emit("key", keyEvent)
      this.emit(`key:${keyEvent.key.replace(/\s+/g, "-")}`, keyEvent)
      return
    }

    // Check for Alt+key combinations
    if (str.length === 2 && str[0] === "\x1b") {
      keyEvent.key = str[1]
      keyEvent.alt = true
      this.emit("key", keyEvent)

      // Also emit specific event
      this.emit(`key:${keyEvent.key}-alt`, keyEvent)
      return
    }

    // Unrecognized escape sequence
    const hex = Array.from(str).map((c) =>
      c.charCodeAt(0).toString(16).padStart(2, "0")
    ).join(" ")

    keyEvent.key = `unknown(${hex})`
    this.emit("key", keyEvent)
  }

  private handleRegularKey(str: string): void {
    const charCode = str.charCodeAt(0)

    let keyEvent: KeyboardEvent = {
      key: str,
      isSpecial: false,
      ctrl: false,
      alt: false,
      meta: false,
      raw: str,
    }

    // Control characters
    if (charCode < 32) {
      const ctrlChar = String.fromCharCode(charCode + 64)
      keyEvent.key = ctrlChar
      keyEvent.ctrl = true
      keyEvent.isSpecial = true
    }

    // Handle common named keys
    switch (str) {
      case " ":
        keyEvent.key = "space"
        keyEvent.isSpecial = true
        break
      case "\r":
        keyEvent.key = "enter"
        keyEvent.isSpecial = true
        break
      case "\t":
        keyEvent.key = "tab"
        keyEvent.isSpecial = true
        break
      case "\b":
        keyEvent.key = "backspace"
        keyEvent.isSpecial = true
        break
    }

    // Emit the key event
    this.emit("key", keyEvent)

    // Also emit specific key event
    if (keyEvent.isSpecial) {
      // For special keys or control keys, emit with the key name
      let eventName = `key:${keyEvent.key.toLowerCase()}`
      if (keyEvent.ctrl) eventName += "-ctrl"
      if (keyEvent.alt) eventName += "-alt"
      if (keyEvent.meta) eventName += "-meta"

      this.emit(eventName, keyEvent)
    } else {
      // For regular characters, emit with the character as the event name
      this.emit(`key:${keyEvent.key}`, keyEvent)
    }
  }

  public stop(): void {
    // Emit a cleanup event before disabling input tracking
    this.emit("stop")

    // Disable mouse tracking
    process.stdout.write("\x1b[?1003l") // Disable mouse movement tracking
    process.stdout.write("\x1b[?1006l") // Disable SGR extended mode

    // Restore terminal settings
    process.stdin.setRawMode(false)
    process.stdin.pause()

    // Remove all listeners
    this.removeAllListeners()
  }
}
