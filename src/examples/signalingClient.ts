import { Webrtc } from "../../../connection/webrtc/webrtcBrowser"

window.connect = (serverUrl: string) => {
    window.webrtc = new Webrtc(serverUrl, { ip: "dog.mv" })
}
