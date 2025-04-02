import { Module } from "../core"
import { Msg, MsgType } from "../api/types"

// Define connection events based on webrtc.ts usage
export type ConnectionEvents = {
    // Core connection events
    connect: () => void
    disconnected: () => void
    anymsg: (msg: Msg<MsgType, unknown>) => void

    // Message type events (mapped from MsgType enum)
    validation: (msg: Msg<MsgType.validation, unknown>) => void
    subscribe: (msg: Msg<MsgType.subscribe, unknown>) => void
    unsubscribe: (msg: Msg<MsgType.unsubscribe, unknown>) => void
    msg: (msg: Msg<MsgType.msg, unknown>) => void
    req: (msg: Msg<MsgType.req, unknown>) => void
    res: (msg: Msg<MsgType.res, unknown>) => void
    vid: (msg: Msg<MsgType.vid, unknown>) => void
    aud: (msg: Msg<MsgType.aud, unknown>) => void
    err: (msg: Msg<MsgType.err, unknown>) => void
    heartbeat: (msg: Msg<MsgType.heartbeat, unknown>) => void
    rtc_inner_req: (msg: Msg<MsgType.rtc_inner_req, unknown>) => void
    rtc_report: (msg: Msg<MsgType.rtc_report, unknown>) => void
    add_error: (msg: Msg<MsgType.add_error, unknown>) => void
    rm_error: (msg: Msg<MsgType.rm_error, unknown>) => void
    errors: (msg: Msg<MsgType.errors, unknown>) => void

    // Dynamic events based on message IDs and topics
    [key: `${string}${number}`]: (msg: Msg<MsgType, unknown>) => void
    [key: number]: (msg: Msg<MsgType, unknown>) => void

    // WebRTC specific events
    track: (event: RTCTrackEvent) => void
}

export abstract class Connection<ConfigOptional, ConfigRequired>
    extends Module<ConfigOptional, ConfigRequired, ConnectionEvents> {
    abstract send(msg: Msg<unknown, unknown>): void
    abstract connect(): Promise<void>
}

export type AnyConnection = Connection<unknown, unknown>
