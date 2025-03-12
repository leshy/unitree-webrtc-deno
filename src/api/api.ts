import * as types from "./types.ts"
import { Env, Module } from "../core.ts"
import { Connection, ConnectionConfig, Webrtc } from "../connection/mod.ts"

export type OAPIConfig = {
    apiVersion: string
}

export type RAPIConfig =
    | {
        connection: Connection
    }
    | ConnectionConfig

export type APIConfig = Partial<OAPIConfig> & RAPIConfig

function hasConnection(
    config: APIConfig,
): config is { connection: Connection } {
    return (config as { connection: Connection }).connection !== undefined
}

export class API extends Module<OAPIConfig, RAPIConfig> {
    connection: Connection
    constructor(config: APIConfig, env?: Env) {
        super(config, { apiVersion: "1" }, env)

        if (hasConnection(this.config)) {
            this.connection = this.config.connection
        } else {
            this.connection = new Webrtc(this.config, this.env)
        }
    }

    send<T, D>(msg: types.Msg<T, D>) {
        this.connection.send(msg)
    }

    genId(): number {
        return (new Date().valueOf() % 2147483648) +
            Math.floor(Math.random() * 1e3)
    }

    apiCall(
        endpoint: types.Topic,
        cmd: types.SportCmd,
        data: unknown,
    ) {
        this.send({
            topic: endpoint,
            header: { identity: { id: this.genId(), api_id: cmd } },
            type: types.MsgType.msg,
            //            parameter: data, // TODO: Complete type definition
        })
    }
}
