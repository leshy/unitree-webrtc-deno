import { initEnv } from "./core.ts"
import { API } from "./api/api.ts"
import * as t from "./api/types.ts"

const env = initEnv()

async function main() {
    const robot = new API({ ip: "10.55.1.181" }, env)
    await robot.ready()
    console.log(
        "STANDUP",
        await robot.apiCall(t.Topic.SPORT_MOD, t.SportCmd.StandUp),
    )
    console.log(
        "STANDDOWN",
        await robot.apiCall(t.Topic.SPORT_MOD, t.SportCmd.StandDown),
    )
}

main().then(() => process.exit(0))

// await robot.turn(Math.PI / 2)

// robot.jump()

// console.log(robot.status.charge)

// robot.on("status", ({ charge: number }) => console.log(`battery at ${charge}%`))

// robot.videoFeed()

// robot.lidarFeed()

// globalThis.rtc.publish("rt/api/sport/request", {
//     header: { identity: { id: uniqID, api_id: command } },
//     parameter: JSON.stringify(command),
//     // api_id: command,
//   });
// }
