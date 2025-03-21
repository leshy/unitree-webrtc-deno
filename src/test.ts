import { API } from "./api/api.ts"
import { SportCmd, Topic } from "./api/types.ts"

async function main() {
    const args = process.argv.slice(2)
    const ip = args[0] || "192.168.12.1"

    const robot = new API({ ip })

    await robot.ready()

    console.log(
        "stand up response",
        await robot.apiCall(Topic.SPORT_MOD, SportCmd.StandUp),
    )
    console.log(
        "stand down response",
        await robot.apiCall(Topic.SPORT_MOD, SportCmd.StandDown),
    )
}

main().then(() => process.exit(0)).catch((e) => {
    console.error(e)
    process.exit(1)
})

// just sketching out some ideas here

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
