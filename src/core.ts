// @ts-types="./eventemitter2.d.ts"
import EventEmitter2 from "npm:eventemitter2@6.4.9"
import * as pino from "npm:pino@9.6.0"

// web bundler will flip this boolean
export const runningInBrowser = false

export type Env = {
    logger: pino.Logger
}

export const initEnv = (): Env => {
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

export abstract class Module<
    OPTCFG,
    REQCFG,
    Events extends Record<string | symbol, (...args: any[]) => void> = Record<
        string,
        (...args: any[]) => void
    >,
> extends EventEmitter2 {
    protected env: Env
    protected log: pino.Logger
    protected config: REQCFG & OPTCFG
    constructor(
        config: REQCFG & Partial<OPTCFG>,
        protected defaultConfig: OPTCFG,
        env?: Env,
    ) {
        super({ wildcard: true, verboseMemoryLeak: true })
        // if unified environment is not provided, class will initialize it's own
        this.env = env ? env : initEnv()
        this.config = { ...this.defaultConfig, ...config }
        console.log("THIS ENV", env)
        console.log("THIS CONFIG", this.config)

        this.log = this.env.logger.child({ module: this.constructor.name })
    }
}
