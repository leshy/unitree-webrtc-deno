import { Msg } from "../api/types.ts"
import { WebrtcConfig } from "./webrtc/webrtc.ts"
export * from "./webrtc/webrtc.ts"

export interface Connection {
    send(msg: Msg<unknown, unknown>): void
    connect(): Promise<void>
}

export type ConnectionConfig = WebrtcConfig
