import type { Env } from "../../core.ts"
import * as webrtc from "./webrtc.ts"
import { remote_signaling } from "../signaling/remoteSignaling.ts"

export class Webrtc extends webrtc.Webrtc {
    constructor(
        signalingServer: string,
        config: webrtc.Config,
        env?: Env,
    ) {
        super(
            {
                rtcPeerConnection:
                    RTCPeerConnection as unknown as RTCPeerConnection,
                signalingFunction: remote_signaling(signalingServer),
            },
            config,
            env,
        )
    }
}
