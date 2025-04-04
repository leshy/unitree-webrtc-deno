import type * as types from "./types.ts"
import type * as pino from "npm:pino"

export function remote_signaling(
    signalingServerUrl: string,
): types.SignalingFunction {
    return async (ip: string, sdp: RTCSessionDescription, log: pino.Logger) => {
        log.debug({ sdp }, `Sending SDP Offer to signaling proxy`)
        const response = await fetch(signalingServerUrl, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ip, sdp }),
        })

        return response.json()
    }
}
