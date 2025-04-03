import { Env } from "../../core.ts"
import * as webrtc from "./webrtc.ts"
import { send_sdp_to_local_peer_new_method } from "../signaling/signaling.ts"

export class Webrtc extends webrtc.Webrtc {
    constructor(
        config: webrtc.Config,
        env?: Env,
    ) {
        super(
            {
                rtcPeerConnection: RTCPeerConnection,
                signalingFunction: send_sdp_to_local_peer_new_method,
            },
            config,
            env,
        )
    }
}
