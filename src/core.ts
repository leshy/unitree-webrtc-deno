import { EventEmitter2 } from "eventemitter2"
import * as pino from "pino"

// web bundler will flip this boolean
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

export abstract class Module<
    OPTCFG,
    REQCFG,
    Events = Record<string, (...args: any[]) => void>,
> extends EventEmitter2<Events> {
    protected env: Env
    protected log: pino.Logger
    protected config: REQCFG & OPTCFG
    constructor(
        config: REQCFG & Partial<OPTCFG>,
        protected defaultConfig: OPTCFG,
        env?: Env,
    ) {
        super()
        // if unified environment is not provided, class will initialize it's own
        this.env = env ? env : initEnv()
        this.config = { ...this.defaultConfig, ...config }
        this.log = this.env.logger.child({ module: this.constructor.name })
    }
}
