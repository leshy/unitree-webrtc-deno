import { Webrtc } from "../connection/webrtc/webrtcBrowser"

// @ts-ignore
window.connect = (serverUrl: string) => {
    //@ts-ignore
    window.webrtc = new Webrtc(serverUrl, { ip: "dog.mv" })
}
