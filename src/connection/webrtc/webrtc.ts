// how are we doing optional browser vs node imports?
import {
    RTCDataChannel,
    RTCPeerConnection,
    RTCSessionDescription,
} from "@roamhq/wrtc"

import * as signaling from "./signaling.ts"

// @ts-ignore
import md5 from "md5"

import { Connection } from "../mod.ts"
import { Env, Module } from "../../core.ts"
import { Msg, MsgType, ValidationMsg } from "../../api/types.ts"

export type ConfigRequired = {
    ip: string
}

export type ConfigOptional = {
    autoconnect: boolean
}

type MsgEvent = { data: string }

export type WebrtcConfig = ConfigRequired & Partial<ConfigOptional>

export class Webrtc extends Module<ConfigOptional, ConfigRequired>
    implements Connection {
    private pc: RTCPeerConnection
    private channel: RTCDataChannel

    constructor(
        config: WebrtcConfig,
        env?: Env,
    ) {
        super(config, { autoconnect: true }, env)
        this.pc = new RTCPeerConnection()

        this.pc.addTransceiver("video", { direction: "recvonly" })
        this.pc.addTransceiver("audio", { direction: "sendrecv" })

        this.channel = this.pc.createDataChannel("data")

        if (this.config.autoconnect) this.connect()
    }

    public async send(msg: Msg<unknown, unknown>) {
        this.channel.send(JSON.stringify(msg))
    }

    public async connect() {
        this.log.debug("WebRTC connecting...")
        const offer = await this.pc.createOffer()
        await this.pc.setLocalDescription(offer)

        // Contacts the signaling server on the robot, authenticates, and gets WebRTC session info
        const remoteSession = await this.handshake(
            this.pc.localDescription as RTCSessionDescription,
        )

        // Set up the data channel and event emitting for this class
        this.setupEvents()

        // Establish WebRTC connection
        await this.pc.setRemoteDescription(
            new RTCSessionDescription(remoteSession),
        )
    }

    private setupEvents() {
        this.channel.onopen = () => {
            console.log("data channel opened")
        }

        this.channel.onclose = () => {
            console.log("data channel closed")
            this.emit("disconnected")
        }

        this.channel.onmessage = (event: MsgEvent) => {
            const msg: Msg<MsgType, unknown> = JSON.parse(event.data)
            const msgType = MsgType[msg.type]
            if (msgType) {
                this.emit(msgType, msg)
            } else console.warn("unknown message type", msg)

            this.emit("anymsg", msg)
        }

        this.pc.addEventListener("track", (event) => {
            console.log("track received", event)
            this.emit("track", event)
        })

        this.on("validation", this.validationHandler)
    }

    // Handle validation messages from robot and send appropriate responses
    private validationHandler = (msg: ValidationMsg) => {
        if (msg.data === "Validation Ok.") {
            this.log.info("connection established")
            this.emit("connected")

            return console.log("Validation passed")
        }
        console.log("Replying to validation query")
        this.send({
            type: MsgType.validation,
            data: md5(`UnitreeGo2_${msg.data}`),
            // data: encodeBase64(md5(`UnitreeGo2_${msg.data}`)),
            // data: crypto
            //     .createHash("md5")
            //     .update(`UnitreeGo2_${msg.data}`)
            //     .digest("base64"),
        })
    }

    private async handshake(
        sdp: RTCSessionDescription,
    ): Promise<RTCSessionDescription> {
        return await signaling.send_sdp_to_local_peer_new_method(
            this.config.ip,
            sdp,
            this.log.child({ module: "WebrtcSignaling" }),
        )
    }

    private async proxyHandshake(
        sdp: RTCSessionDescription,
    ): Promise<RTCSessionDescription> {
        const ip = this.config.ip
        this.log.debug(this.config, `WebRTC starting signalling with ${ip}`)

        // @ts-ignore
        //sdp = cheat.mergeOffers(sdp, offers.exampleOffer2)

        this.log.debug({ sdp }, `SDP offer generated`)
        const response = await fetch("http://localhost:3000/sdp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sdp, ip }),
        })

        const data = await response.json()
        this.log.debug(data, "received handshake response")
        return new RTCSessionDescription(data)
    }
}
