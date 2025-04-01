import { Env, Module } from "./core.ts"
import { Connection, ConnectionEvents } from "./connection/mod.ts"
import { Msg } from "./api/types.ts"
import { WebSocket, WebSocketServer } from "ws"

export type ConfigRequired = {
    connection: Connection
}

export type ConfigOptional = {
    port: number
}

export type ProxyServerConfig = Partial<ConfigOptional> & ConfigRequired

export class ProxyServer
    extends Module<ConfigOptional, ConfigRequired, ConnectionEvents>
    implements Connection {
    private connection: Connection

    constructor(config: ProxyServerConfig, env?: Env) {
        super(config, { port: 3333 }, env)
        this.connection = config.connection
    }

    // Override EventEmitter methods to pass through to connection
    on(
        event: string | symbol,
        listener: (...args: any[]) => void,
    ): this {
        this.connection.on(event, listener)
        return this
    }

    once(
        event: string | symbol,
        listener: (...args: any[]) => void,
    ): this {
        this.connection.once(event, listener)
        return this
    }

    off(
        event: string | symbol,
        listener: (...args: any[]) => void,
    ): this {
        this.connection.off(event, listener)
        return this
    }

    emit(event: string | symbol, ...args: any[]): boolean {
        return this.connection.emit(event, ...args)
    }

    removeAllListeners(event?: string | symbol): this {
        this.connection.removeAllListeners(event)
        return this
    }

    connect(): Promise<void> {
        return this.connection.connect()
    }

    send(msg: Msg<unknown, unknown>) {
        return this.connection.send(msg)
    }
}

// Used to circumvent slightly unreliable and slow direct webrtc->unitree connection
// Allows immediate connections, multiple clients etc. No idea atm how to do video/audio though
export class WebsocketProxyServer extends ProxyServer {
    private wss: WebSocketServer
    private clients: Set<WebSocket>

    constructor(config: ProxyServerConfig, env?: Env) {
        super(config, env)
        this.clients = new Set()
        this.wss = this.listen(this.config.port)
    }

    listen(port: number): WebSocketServer {
        const wss = new WebSocketServer({ port })
        wss.on("listening", () => {
            this.log.info(
                `WebSocket server listening on port ${this.config.port}`,
            )
        })

        wss.on("error", (error: Error) => {
            this.log.error(
                `WebSocket server error: ${error.message}`,
            )
            // We directly log errors since they're WebSocket specific
        })

        wss.on("connection", (ws: WebSocket) => {
            this.log.info("Client connected to WebSocket server")
            this.clients.add(ws)

            // Forward messages from WebSocket clients to the connection
            ws.on("message", (message: Buffer) => {
                try {
                    const msg = JSON.parse(message.toString()) as Msg<
                        unknown,
                        unknown
                    >
                    this.log.debug(
                        { msg },
                        "WebSocket message received",
                    )
                    super.send(msg)
                } catch (error) {
                    this.log.error(
                        `Failed to parse message: ${(error as Error).message}`,
                    )
                }
            })

            // Handle client disconnection
            ws.on("close", () => {
                this.log.info(
                    "Client disconnected from WebSocket server",
                )
                this.clients.delete(ws)
            })

            // Handle errors
            ws.on("error", (error: Error) => {
                this.log.error(
                    `WebSocket client error: ${error.message}`,
                )
            })
        })
        return wss
    }

    connect(): Promise<void> {
        return super.connect()
    }

    override send(msg: Msg<unknown, unknown>) {
        // Forward messages from the connection to all WebSocket clients
        const message = JSON.stringify(msg)

        // Use Array.from to convert Set to Array for better compatibility
        Array.from(this.clients).forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message)
            }
        })

        return super.send(msg)
    }

    async close(): Promise<void> {
        this.wss.close()
    }
}
