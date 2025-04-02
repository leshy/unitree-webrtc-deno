import path from "path"
import * as signaling from "../connection/signaling/mod"
import { Env, Module } from "../core"
import express from "express"
import bodyParser from "body-parser"

export type OptionalConfig = {
    port: number
    staticDir: string
}

export type RequiredConfig = {}

export type SignalingServerConfig = Partial<OptionalConfig> & RequiredConfig

export class SignalingServer
    extends Module<OptionalConfig, RequiredConfig, {}> {
    private app: express.Application

    constructor(config?: SignalingServerConfig, env?: Env) {
        super(
            config || {},
            { port: 3000, staticDir: path.join(__dirname, "static") },
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
        this.app.use((req, res, next) => {
            this.log.info(req.method + " " + req.url)
            next()
        })

        this.app.use(bodyParser.json())

        this.app.use(express.static(this.config.staticDir, {
            dotfiles: "deny",
            etag: true,
            extensions: ["html"],
            index: ["index.html"],
            maxAge: "1d",
        }))
    }
}

const server = new SignalingServer()
