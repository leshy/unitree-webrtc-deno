import { initEnv } from "./core.ts"
import { API } from "./api/api.ts"

const env = initEnv()

const robot = new API({ ip: "192.168.12.1" }, env)

// await robot.turn(Math.PI / 2)

// robot.jump()

// console.log(robot.status.charge)

// robot.on("status", ({ charge: number }) => console.log(`battery at ${charge}%`))

// robot.videoFeed()

// robot.lidarFeed()
