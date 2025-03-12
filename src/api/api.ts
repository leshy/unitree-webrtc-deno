import * as types from "./types.ts"
import { Env, Module } from "../core.ts"
import { Connection, ConnectionConfig, Webrtc } from "../connection/mod.ts"

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
        this.connection.send(msg)
    }

    // TODO: copied from python, but what is this? let's review at some point
    genId(): number {
        return (new Date().valueOf() % 2147483648) +
            Math.floor(Math.random() * 1e3)
    }

    apiCall(
        endpoint: types.Topic,
        cmd: types.SportCmd,
        //data: unknown,
    ) {
        // @ts-ignore
        this.send({
            topic: endpoint,
            header: { identity: { id: this.genId(), api_id: cmd } },
            type: types.MsgType.msg,
            //parameter: data, // TODO: Complete type definition
        })
    }
}
