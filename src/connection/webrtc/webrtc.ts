import { Connection } from "../mod.ts"
import type { Env } from "../../core.ts"
import { type Msg, MsgType, type ValidationMsg } from "../../api/types.ts"
import { SignalingFunction, signalingProxyClient } from "./signaling/mod.ts"

//@ts-ignore
import md5 from "npm:md5"

export type ConfigRequired = {
    ip: string
    signaling: SignalingFunction | string
}

export type ConfigOptional = {
    autoconnect: boolean
    token?: string
}

export type Config = ConfigRequired & Partial<ConfigOptional>

type MsgEvent = { data: string }

export type EnvPolyfill = {
    rtcPeerConnection: RTCPeerConnection
    signalingFunction: SignalingFunction
}

function md5b64(targetString: string): string {
    const hexString = md5(targetString)
    let binary = ""
    for (let i = 0; i < hexString.length; i += 2) {
        const byte = parseInt(hexString.substring(i, i + 2), 16)
        binary += String.fromCharCode(byte)
    }
    return btoa(binary)
}

export class Webrtc extends Connection<ConfigOptional, ConfigRequired> {
    public pc: RTCPeerConnection
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

    public async close() {
        this.channel.close()
        this.pc.close()
    }

    public async send(msg: Msg<unknown, unknown>) {
        if (msg.type != "heartbeat") console.log(">>>>", JSON.stringify(msg))
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
            console.log(event)
            const msg: Msg<MsgType, unknown> = JSON.parse(event.data)
            if (msg.type != "heartbeat") {
                console.log("<<<<", JSON.stringify(msg))
            }
            this.log.info(msg, "Message received")
            const msgType = MsgType[msg.type]
            if (msgType) {
                this.emit(msgType, msg)

                // @ts-ignore
                const id = msg.data?.header?.identity?.id
                if (id) {
                    this.emit(msg.topic + id, msg)
                    this.emit(String(id), msg)
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
            this.heartbeatLoop()

            //this.send({ "type": "subscribe", "topic": Topic.MULTIPLE_STATE })

            return this.emit("connect")
        }

        const validationReply = {
            type: MsgType.validation,
            data: md5b64(`UnitreeGo2_${msg.data}`),
        }

        this.log.info(validationReply, "Replying to validation query")
        this.send(validationReply)
    }

    private async handshake(
        sdp: RTCSessionDescription,
    ): Promise<RTCSessionDescriptionInit> {
        if (typeof this.config.signaling === "string") {
            this.config.signaling = signalingProxyClient(this.config.signaling)
        }

        return await this.config.signaling(
            this.config.ip,
            this.config.token
                ? { ...sdp, token: this.config.token } as RTCSessionDescription
                : sdp,
            this.log.child({ module: "WebrtcSignaling" }),
        )
    }

    public heartbeatLoop(period: number = 2000) {
        this.sendHeartbeat()
        setInterval(this.sendHeartbeat, period)
    }

    sendHeartbeat = () =>
        this.send({ type: "heartbeat", data: generateHeartbeat() })
}

export function generateHeartbeat(): { timeInStr: string; timeInNum: number } {
    const now = new Date()
    const timeInStr = now.toISOString().replace("T", " ").split(".")[0]
    const timeInNum = Math.floor(now.getTime() / 1000)
    return { timeInStr, timeInNum }
}

export type WebrtcConfig = ConfigRequired & Partial<ConfigOptional>
