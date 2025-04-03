import { Webrtc } from "../connection/webrtc/webrtcBrowser"

// @ts-ignore
globalThis.connect = (serverUrl: string) => {
    //@ts-ignore
    globalThis.webrtc = new Webrtc(serverUrl, { ip: "dog.mv" })
}
