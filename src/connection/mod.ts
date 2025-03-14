import { Module } from "../core.ts"
import { Msg } from "../api/types.ts"
import { WebrtcConfig } from "./webrtc/webrtc.ts"
export * from "./webrtc/webrtc.ts"

export interface Connection extends Module<unknown, unknown> {
    send(msg: Msg<unknown, unknown>): void
    connect(): Promise<void>
}

export type ConnectionConfig = WebrtcConfig
