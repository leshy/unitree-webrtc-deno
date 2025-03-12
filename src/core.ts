import { EventEmitter } from "eventemitter3"
import * as pino from "pino"

export const runningInBrowser = false

export const initEnv = () => {
    const pinoConfig = {
        level: "debug",
    }

    if (runningInBrowser) {
        // @ts-ignore
        pinoConfig.browser = { asObject: true }
    }

    return {
        logger: pino.pino(pinoConfig),
    }
}

export type Env = {
    logger: pino.Logger
}

export abstract class Module<OPTIONAL_CONFIG, REQUIRED_CONFIG>
    extends EventEmitter {
    protected env: Env
    protected log: pino.Logger
    protected config: REQUIRED_CONFIG & OPTIONAL_CONFIG
    constructor(
        config: REQUIRED_CONFIG & Partial<OPTIONAL_CONFIG>,
        protected defaultConfig: OPTIONAL_CONFIG,
        env?: Env,
    ) {
        super()
        // if unified environment is not provided, class will initialize it's own
        this.env = env ? env : initEnv()
        this.log = this.env.logger.child({ module: this.constructor.name })
        this.config = { ...this.defaultConfig, ...config }
    }
}
