import * as unitree from "./unitree/unitreeAuth"
import { RTCPeerConnection, RTCSessionDescription } from "@roamhq/wrtc"

async function main() {
    const args = process.argv.slice(2)
    const ip = args[0] || "192.168.12.1"

    const pc = new RTCPeerConnection()

    const channel = pc.createDataChannel("data")
    //pc.addTransceiver("video", { direction: "recvonly" })
    //pc.addTransceiver("audio", { direction: "sendrecv" })

    const offer = await pc.createOffer() as unitree.Offer
    pc.setLocalDescription(offer)

    const remoteDescription: RTCSessionDescription = await unitree
        .send_sdp_to_local_peer_new_method(
            ip,
            offer,
        )

    channel.onopen = () => {
        console.log("data channel opened")
    }

    channel.onclose = () => {
        console.log("data channel closed")
    }

    channel.onmessage = (event) => {
        console.log("received message", event)
    }

    channel.onerror = (event) => {
        console.log("data chanel error", event)
    }

    await pc.setRemoteDescription(remoteDescription)
}

main().then(console.log)
