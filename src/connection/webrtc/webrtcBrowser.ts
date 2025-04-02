import { Env } from "../../core"
import * as webrtc from "./webrtc"
import { remote_signaling } from "../signaling/remoteSignaling"

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
