import * as pino from "pino"

export type SignalingFunction = (
    ip: string,
    sdp: RTCSessionDescription,
    log: pino.Logger,
) => Promise<RTCSessionDescriptionInit>
