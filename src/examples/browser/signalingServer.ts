#!/usr/bin/env node
// Path module not used
import * as signaling from "../../connection/signaling/mod"
import { Env, Module } from "../../core"
import express from "express"
import bodyParser from "body-parser"
import process from "node:process"

export type OptionalConfig = {
    port: number
    staticDir: string | false
}

export type RequiredConfig = Record<string | number | symbol, never>

export type SignalingServerConfig = Partial<OptionalConfig> & RequiredConfig

export class SignalingServer extends Module<
    OptionalConfig,
    RequiredConfig,
    Record<string | number | symbol, never>
> {
    private app: express.Application

    constructor(config?: SignalingServerConfig, env?: Env) {
        super(
            config || {},
            { port: 3000, staticDir: false },
            env,
        )
        this.log.info(this.config, "starting server")
        this.app = express()
        this.setupServer()

        this.app.listen(this.config.port, () => {
            this.log.info("server listening on port " + this.config.port)
        })
    }

    private setupServer() {
        this.app.use((req, _res, next) => {
            this.log.info(req.method + " " + req.url)
            next()
        })

        this.app.use(bodyParser.json())

        if (this.config.staticDir !== false) {
            this.app.use(express.static(this.config.staticDir, {
                dotfiles: "deny",
                etag: true,
                extensions: ["html"],
                index: ["index.html"],
                maxAge: "1d",
            }))
        }

        this.app.post("/signal", async (req, res) => {
            this.log.info(req.body, "received signaling request")
            const response = await signaling.send_sdp_to_local_peer_new_method(
                req.body.ip,
                req.body.sdp,
                this.log,
            )
            res.json(response)
        })
    }
}

// Only create server instance if this file is executed directly (not imported as a module)
if (require.main === module) {
    const args = process.argv.slice(2)
    const config: SignalingServerConfig = {}

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--port" && i + 1 < args.length) {
            config.port = parseInt(args[i + 1], 10)
            i++
        } else if (args[i] === "--staticDir" && i + 1 < args.length) {
            config.staticDir = args[i + 1]
            i++
        }
    }

    new SignalingServer(config)
}
