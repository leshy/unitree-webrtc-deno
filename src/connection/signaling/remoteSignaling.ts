import * as types from "./types"
import * as pino from "pino"

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
