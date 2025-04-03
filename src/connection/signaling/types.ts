import * as pino from "npm:pino"

export type SignalingFunction = (
    ip: string,
    sdp: RTCSessionDescription,
    log: pino.Logger,
) => Promise<RTCSessionDescriptionInit>
