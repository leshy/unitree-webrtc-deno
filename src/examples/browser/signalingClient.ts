import { Webrtc } from "../../connection/webrtc/webrtcBrowser"
import { api } from "../../api/api"

async function main() {
    const connection = new Webrtc(serverUrl, { ip: "dog.mv" })
    const robot = new api.API({ connection })

    await robot.ready()

    robot.enableVideo()

    // add video to html
    console.log(connection.pc)
}

main().then(console.log)
