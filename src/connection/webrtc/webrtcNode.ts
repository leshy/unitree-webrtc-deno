import { Env } from "../../core"
import * as webrtc from "./webrtc"
import { send_sdp_to_local_peer_new_method } from "../signaling/signaling"
import { RTCPeerConnection as polyFillRTCPeerConnection } from "@roamhq/wrtc"

export class Webrtc extends webrtc.Webrtc {
    constructor(
        config: webrtc.Config,
        env?: Env,
    ) {
        super(
            {
                rtcPeerConnection:
                    polyFillRTCPeerConnection as unknown as RTCPeerConnection,
                signalingFunction: send_sdp_to_local_peer_new_method,
            },
            config,
            env,
        )
    }
}
