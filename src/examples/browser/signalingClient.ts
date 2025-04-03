import { Webrtc } from "../../connection/webrtc/webrtcBrowser"
import { API } from "../../api/api"

async function main() {
    await new Promise((resolve) => {
        setTimeout(resolve, 3000)
    })
    const connection = new Webrtc("signal", { ip: "dog.mv" })
    const robot = new API({ connection })

    const videoElement = document.getElementById(
        "remote-video",
    ) as HTMLVideoElement

    connection.on("track", (event) => {
        console.log("track received", event.track.kind)
        if (event.track.kind === "video") {
            videoElement.srcObject = event.streams[0]
        }
    })

    await robot.ready()
    await robot.enableVideo()

    videoElement.play()
}

main().then(console.log)
