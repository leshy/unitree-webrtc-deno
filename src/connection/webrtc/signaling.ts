import { RTCSessionDescription } from "@roamhq/wrtc"
import * as unitreeCrypto from "./unitreeCrypto.ts"

function calc_local_path_ending(data1: string): string {
    // Initialize an array of strings
    const strArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

    // Extract the last 10 characters of data1
    const last10Chars = data1.substring(data1.length - 10)

    // Split the last 10 characters into chunks of size 2
    const chunked = []
    for (let i = 0; i < last10Chars.length; i += 2) {
        chunked.push(last10Chars.substring(i, i + 2))
    }

    // Initialize an empty array to store indices
    const arrayList = []

    // Iterate over the chunks and find the index of the second character in strArr
    for (const chunk of chunked) {
        if (chunk.length > 1) {
            const secondChar = chunk[1]
            const index = strArr.indexOf(secondChar)
            if (index !== -1) {
                arrayList.push(index)
            }
        }
    }

    // Convert arrayList to a string
    const joinToString = arrayList.join("")

    return joinToString
}

export type Offer = {
    type: "offer"
    sdp: string
    token?: string
}

export async function send_sdp_to_local_peer_new_method(
    ip: string,
    sdp: Offer,
): Promise<RTCSessionDescription> {
    const url = `http://${ip}:9991/con_notify`
    console.log("Initiating handshake with", url)

    console.log("SDP IS", sdp)

    // we receive an RSA key and auth URL for the followup request
    const handshakeBeginResponse = await fetch(
        new Request(url, { method: "GET" }),
    )
    const { data1 } = JSON.parse(atob(await handshakeBeginResponse.text()))

    console.log("received data", data1)

    // extract robot RSA key
    const rsaPubKeyPem = data1.substring(10, data1.length - 10)
    const pathEnding = calc_local_path_ending(data1)

    // generate new AES key for our session
    const aesKey = unitreeCrypto.generateAesKey()

    // data2 - provide aes key to the robot, encrypted with robot's rsa
    // data1 - provide AES encrypted SDP session information
    const body = {
        "data1": unitreeCrypto.aesEncrypt(aesKey, JSON.stringify(sdp)),
        "data2": unitreeCrypto.rsaEncrypt(rsaPubKeyPem, aesKey),
    }

    const connect_url = `http://${ip}:9991/con_ing_${pathEnding}`

    console.log(`providing SDP handshake to ${connect_url}`)

    const resp = await fetch(
        new Request(connect_url, {
            body: JSON.stringify(body),
            method: "POST",
        }),
    )

    // AES decrypt (key generated in previous steps)
    // robot's SDP session reply
    return JSON.parse(
        unitreeCrypto.aesDecrypt(aesKey, await resp.text()),
    ) as RTCSessionDescription
}
