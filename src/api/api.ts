import * as types from "./types.ts"
import { Env, Module } from "../core.ts"
import { Connection, ConnectionConfig, Webrtc } from "../connection/mod.ts"
export * from "./types.ts"

export type OptionalConfig = {
    apiVersion: string
}

export type RequiredConfig =
    | {
        connection: Connection
    }
    | ConnectionConfig

export type APIConfig = Partial<OptionalConfig> & RequiredConfig

function hasConnectionInstance(
    config: APIConfig,
): config is { connection: Connection } {
    return (config as { connection: Connection }).connection !== undefined
}

export class API extends Module<OptionalConfig, RequiredConfig> {
    public connection: Connection
    constructor(config: APIConfig, env?: Env) {
        super(config, { apiVersion: "1" }, env)

        // either receives already constructed connection instance
        // or it assumes it received connection config
        if (hasConnectionInstance(this.config)) {
            this.connection = this.config.connection
        } else {
            // in the future we'll need to differentiate between connection config types
            this.connection = new Webrtc(this.config, this.env)
        }
    }

    send<T, D>(msg: types.Msg<T, D>) {
        this.log.info(msg, "Sending message")
        this.connection.send(msg)
    }

    ready(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.connection.once("connect", () => resolve())
            this.connection.once("error", (err) => reject(err))
        })
    }

    //    genId(): number {
    //       return Date.now()
    //   }
    genId(): number {
        return (new Date().valueOf() % 2147483648) +
            Math.floor(Math.random() * 1e3)
    }

    //     {
    //     "type": "msg",
    //     "topic": "rt/api/sport/request",
    //     "data": {
    //         "header": {
    //             "identity": {
    //                 "id": 352501830,
    //                 "api_id": 1005
    //             }
    //         },
    //         "parameter": "1005"
    //     }
    // }

    apiCall(
        endpoint: types.Topic,
        cmd: types.SportCmd,
        //data: any,
    ): Promise<types.Msg<unknown, unknown>> {
        return new Promise((resolve, reject) => {
            const id = this.genId()
            const errorTimeout = setTimeout(() => {
                reject("Timeout")
            }, 5000)

            console.log("WAITING FOR ", types.Topic.SPORT_RESPONSE + id)
            this.connection.once(types.Topic.SPORT_RESPONSE + id, (msg) => {
                clearTimeout(errorTimeout)
                resolve(msg.data)
            })

            this.send({
                type: types.MsgType.msg,
                topic: endpoint,
                data: {
                    header: { identity: { id, api_id: cmd } },
                    parameter: String(cmd),
                },
            })
        })
    }
}
