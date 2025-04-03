import { Env } from "./core.ts"
import { AnyConnection, Connection } from "./connection/mod.ts"
import { Msg } from "./api/types.ts"
import { WebSocket, WebSocketServer } from "ws"
import { Buffer } from "node:buffer"

export type ConfigRequired = {
    connection: AnyConnection
}

export type ConfigOptional = {
    port: number
}

export type ProxyServerConfig = Partial<ConfigOptional> & ConfigRequired

export class ProxyServer extends Connection<ConfigOptional, ConfigRequired> {
    public connection: AnyConnection

    constructor(config: ProxyServerConfig, env?: Env) {
        super(config, { port: 3333 }, env)
        this.connection = config.connection
    }

    connect(): Promise<void> {
        this.connection.on("*", (event: string, ...args: any[]) => {
            this.emit(event, ...args)
        })
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

    override connect(): Promise<void> {
        return this.connection.connect()
    }

    override send(msg: Msg<unknown, unknown>) {
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
