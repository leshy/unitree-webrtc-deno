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
    token?: string
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

        // this.pc.addTransceiver("video", { direction: "recvonly" })
        // this.pc.addTransceiver("audio", { direction: "sendrecv" })

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
            this.log.info("Data channel Open")
        }

        this.channel.onclose = () => {
            this.log.error("Data channel Closed")
            this.emit("disconnected")
        }

        this.channel.onmessage = (event: MsgEvent) => {
            //this.log.debug(event, "Data channel event received")
            const msg: Msg<MsgType, unknown> = JSON.parse(event.data)
            this.log.info(msg, "Message received")
            const msgType = MsgType[msg.type]
            if (msgType) {
                this.emit(msgType, msg)

                // @ts-ignore
                const id = msg.data?.header?.identity?.id
                if (id) {
                    this.emit(msg.topic + id, msg)
                }
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
            this.log.info("Validation Passed")
            this.off("validation", this.validationHandler)
            return this.emit("connect")
        }

        const validationReply = {
            type: MsgType.validation,
            data: Buffer.from(md5(`UnitreeGo2_${msg.data}`), "hex").toString(
                "base64",
            ),
            // data: encodeBase64(md5(`UnitreeGo2_${msg.data}`)),
            // data: crypto
            //     .createHash("md5")
            //     .update(`UnitreeGo2_${msg.data}`)
            //     .digest("base64"),
        }

        this.log.info(validationReply, "Replying to validation query")
        this.send(validationReply)
    }

    private async handshake(
        sdp: RTCSessionDescription,
    ): Promise<RTCSessionDescription> {
        return await signaling.send_sdp_to_local_peer_new_method(
            this.config.ip,
            this.config.token
                ? { ...sdp, token: this.config.token } as RTCSessionDescription
                : sdp,
            this.log.child({ module: "WebrtcSignaling" }),
        )
    }

    // private async proxyHandshake(
    //     sdp: RTCSessionDescription,
    // ): Promise<RTCSessionDescription> {
    //     const ip = this.config.ip
    //     this.log.debug(this.config, `WebRTC starting signalling with ${ip}`)

    //     this.log.debug({ sdp }, `SDP offer generated`)
    //     const response = await fetch("http://localhost:3000/sdp", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ sdp, ip }),
    //     })

    //     if (!response.ok) {
    //         this.log.error(
    //             { status: response.status, statusText: response.statusText },
    //             "HTTP Request Error",
    //         )
    //     }

    //     const data = await response.json()
    //     this.log.debug(data, "received handshake response")

    //     return new RTCSessionDescription(data)
    // }
}
