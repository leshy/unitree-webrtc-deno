import * as types from "./types"
import { Env, Module } from "../core"
import { AnyConnection } from "../connection/mod"
export * from "./types"

export type OptionalConfig = {
    apiVersion: string
}

export type RequiredConfig = { connection: AnyConnection }
export type APIConfig = Partial<OptionalConfig> & RequiredConfig

export class API extends Module<OptionalConfig, RequiredConfig> {
    public connection: AnyConnection
    constructor(config: APIConfig, env?: Env) {
        super(config, { apiVersion: "1" }, env)
        //        this.connection = connectionFromConfig(this.config)
        this.connection = this.config.connection
    }

    send<T, D>(msg: types.Msg<T, D>) {
        this.log.info({ payload: msg }, "Sending message")
        // @ts-ignore
        if (msg.data?.parameter?.constructor === Object) {
            // @ts-ignore
            msg.data.parameter = JSON.stringify(
                // @ts-ignore
                msg.data.parameter,
            )
        }
        this.connection.send(msg)
    }

    ready(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.connection.once("connect", () => resolve())
            this.connection.once("error", (err) => reject(err))
        })
    }

    genId(): number {
        return (new Date().valueOf() % 2147483648) +
            Math.floor(Math.random() * 1e3)
    }

    // one shot command, no response expected
    cmd(
        topic: types.Topic,
        data?: any,
        msgType?: types.MsgType,
    ) {
        const msg: types.Msg<unknown, any> = {
            type: msgType || types.MsgType.msg,
            topic: topic,
            data: data,
        }
        this.send(msg)
    }

    // query-response command
    req(
        topic: types.Topic,
        cmd: types.SportCmd | types.VUICmd,
        param: Record<string, unknown> = {},
        timeout: number = 5000,
    ): Promise<types.Msg<unknown, unknown>> {
        return new Promise((resolve, reject) => {
            const id = this.genId()

            const msg: types.Msg<types.MsgType.msg, types.RequestData> = {
                type: types.MsgType.msg,
                topic: topic,
                data: {
                    header: { identity: { id, api_id: cmd } },
                    parameter: param ? JSON.stringify(param) : "",
                },
            }

            const errorTimeout = setTimeout(() => {
                reject("Timeout")
            }, timeout)

            this.connection.once(String(id), (msg) => {
                clearTimeout(errorTimeout)
                resolve(msg.data)
            })
            this.send(msg)
        })
    }

    color(color: types.Color, time: number = 1) {
        return this.req(types.Topic.VUI, types.VUICmd.Color, { color, time })
    }

    colorBlink(color: types.Color, flash_cycle: 1000, time: number = 3) {
        return this.req(types.Topic.VUI, types.VUICmd.Color, {
            color,
            time,
            flash_cycle,
        })
    }

    enableVideo() {
        this.cmd(types.Topic.VIDEO, "ON")
        //{"type":"vid","topic":"","data":"on"}
    }

    lidarOff() {
        return this.cmd(types.Topic.ULIDAR_SWITCH, "OFF")
    }

    lidarOn() {
        return this.cmd(types.Topic.ULIDAR_SWITCH, "ON")
    }

    standup() {
        return this.req(types.Topic.SPORT_MOD, types.SportCmd.StandUp)
    }

    sitdown() {
        return this.req(types.Topic.SPORT_MOD, types.SportCmd.StandDown)
    }

    mov(x: number, y: number, rx: number, ry: number) {
        return this.cmd(
            types.Topic.WIRELESS_CONTROLLER,
            { ly: y, lx: x, rx, ry },
        )
    }
}
