import { API } from "../api/api"
import { Webrtc } from "../connection/webrtc/webrtcNode"
import { Color, SportCmd, Topic, VUICmd } from "../api/types"

async function main() {
    const args = process.argv.slice(2)
    const ip = args[0] || "192.168.12.1"

    const robot = new API({ connection: new Webrtc({ ip }) })

    await robot.ready()

    // robot.connection.send({
    //     "type": "req",
    //     "topic": Topic.MOTION_SWITCHER,
    //     "data": {
    //         "header": { "identity": { "id": 6001002, "api_id": 1002 } },
    //         "parameter": '{"name":"ai"}',
    //     },
    // })

    // robot.send({
    //     "type": "msg",
    //     "topic": Topic.VUI,
    //     "data": {
    //         "header": {
    //             "identity": { "id": robot.genId(), "api_id": VUICmd.Blink },
    //         },
    //         "parameter": {
    //             "color": Color.RED,
    //             "time": 50,
    //             //                "flash_cycle": 1000,
    //         },
    //     },
    // })

    // let cnt = 10
    // const interval = setInterval(() => {
    //     cnt++
    //     robot.send({
    //         "type": "msg",
    //         "topic": Topic.VUI,
    //         "data": {
    //             "header": {
    //                 "identity": {
    //                     "id": robot.genId(),
    //                     "api_id": VUICmd.Brightness,
    //                 },
    //             },
    //             "parameter": {
    //                 "brightness": cnt,
    //             },
    //         },
    //     })
    // }, 500)

    // await new Promise((resolve) =>
    //     setTimeout(() => {
    //         clearInterval(interval)
    //         resolve(true)
    //     }, 5000)
    // )

    // console.log(
    //     "stand up response",
    //     await robot.apiCall(Topic.SPORT_MOD, SportCmd.BalanceStand),
    // )

    // // robot.connection.send({
    // //     "type": "rtc_inner_req",
    // //     "topic": "",
    // //     "data": { "req_type": "disable_traffic_saving", "instruction": "on" },
    // // })

    // // robot.connection.send({
    // //     "type": "req",
    // //     "topic": Topic.MOTION_SWITCHER,
    // //     "data": {
    // //         "header": { "identity": { "id": 6001001, "api_id": 1001 } },
    // //         "parameter": "",
    // //     },
    // // })

    // // if stuff is playing

    // // robot.connection.send({
    // //     "type": "subscribe",
    // //     "topic": Topic.AUDIO_HUB_PLAY_STATE,
    // // })

    // // robot.connection.send({
    // //     "type": "req",
    // //     "topic": Topic.MOTION_SWITCHER,
    // //     "data": {
    // //         "header": { "identity": { "id": 6001002, "api_id": 1002 } },
    // //         "parameter": '{"name":"ai"}',
    // //     },
    // // })

    await robot.lidarOff()

    // //    await robot.apiCall(Topic.MOTION_SWITCHER, SportCmd.Euler)
    // //   await robot.apiCall(Topic.MOTION_SWITCHER, SportCmd.Damp)
    // //

    // // low level info, temps, battery
    // robot.connection.send({ "type": "subscribe", "topic": Topic.LOW_STATE })

    // // gets robot version

    // // robot.connection.send({
    // //     "type": "req",
    // //     "topic": Topic.BASH_REQ,
    // //     "data": {
    // //         "header": { "identity": { "id": 978686983, "api_id": 1001 } },
    // //         "parameter": '{"script":"get_whole_packet_version.sh"}',
    // //     },
    // // })

    // robot.connection.send({
    //     "type": "subscribe",
    //     "topic": Topic.MULTIPLE_STATE,
    // })

    // // let rotation = 0
    // // const interval = setInterval(() => {
    // //     rotation += 0.03
    // //     robot.connection.send({
    // //         "type": "msg",
    // //         "topic": Topic.WIRELESS_CONTROLLER,
    // //         "data": { "lx": 0, "ly": rotation, "rx": 0, "ry": 0 },
    // //     })
    // // }, 100)

    // // await new Promise((resolve) =>
    // //     setTimeout(() => {
    // //         clearInterval(interval)
    // //         resolve(true)
    // //     }, 30000)
    // // )

    // robot.connection.send({
    //     "type": "msg",
    //     "topic": Topic.WIRELESS_CONTROLLER,
    //     "data": { "lx": 0, "ly": 0, "rx": 0, "ry": 0 },
    // })

    // // await robot.move(0, 0, 0.5, 0)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    // // await robot.move(0, 0, 0, 0)

    // console.log("REQUESTING SIT")
    // console.log(
    //     "stand down response",
    //     await robot.apiCall(Topic.SPORT_MOD, SportCmd.StandDown),
    // )
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
