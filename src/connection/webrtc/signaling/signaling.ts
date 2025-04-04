import type * as types from "./types.ts"
import * as unitreeCrypto from "./unitreeCrypto.ts"
import type * as pino from "npm:pino"

function calc_local_path_ending(data1: string): string {
    // Initialize an array of strings
    const strArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

    // Extract the last 10 characters of data1
    const last10Chars = data1.substring(data1.length - 10)

    // Split the last 10 characters into chunks of size 2
    const chunked: string[] = []
    for (let i = 0; i < last10Chars.length; i += 2) {
        chunked.push(last10Chars.substring(i, i + 2))
    }

    // Initialize an empty array to store indices
    const arrayList: number[] = []

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

export const send_sdp_to_local_peer_new_method: types.SignalingFunction =
    async (
        ip: string,
        sdp: RTCSessionDescription,
        log: pino.Logger,
    ): Promise<RTCSessionDescription> => {
        const url = `http://${ip}:9991/con_notify`
        log.debug({ sdp }, `SDP Offer`)
        log.info(`Initiating auth with ${url}`)

        // we receive an RSA key and auth URL for the followup request
        const handshakeBeginResponse = await fetch(
            new Request(url, { method: "GET" }),
        )

        if (!handshakeBeginResponse.ok) {
            log.error(
                {
                    status: handshakeBeginResponse.status,
                    statusText: handshakeBeginResponse.statusText,
                },
                "First HTTP Request Error",
            )
            throw new Error("First HTTP Request Error")
        }

        const { data1 } = JSON.parse(atob(await handshakeBeginResponse.text()))

        log.debug({ data1 }, `Received data`)

        // extract robot RSA key
        const rsaPubKeyPem = data1.substring(10, data1.length - 10)

        log.debug({ rsaPubKeyPem }, `robot public RSA key decoded`)
        const pathEnding = calc_local_path_ending(data1)

        // generate new AES key for our session
        const aesKey = unitreeCrypto.generateAesKey()

        const body = {
            // data1 - provide AES encrypted SDP session information
            "data1": unitreeCrypto.aesEncrypt(aesKey, JSON.stringify(sdp)),
            // data2 - provide AES key to the robot, encrypted with robot's RSA
            "data2": unitreeCrypto.rsaEncrypt(rsaPubKeyPem, aesKey),
        }

        const connect_url = `http://${ip}:9991/con_ing_${pathEnding}`

        log.debug(`Sending Encrypted SDP Offer to ${connect_url}`)

        const response = await fetch(
            new Request(connect_url, {
                body: JSON.stringify(body),
                method: "POST",
            }),
        )

        if (!response.ok) {
            log.error(
                { status: response.status, statusText: response.statusText },
                "Second HTTP Request Error",
            )
            throw new Error("Second HTTP Request Error")
        }

        // AES decrypt (key generated in previous steps)
        // robot's SDP session reply
        const sessionDescription = JSON.parse(
            unitreeCrypto.aesDecrypt(aesKey, await response.text()),
        ) as RTCSessionDescription

        log.debug(
            { sessionDescription },
            `Auth success. Received session description`,
        )

        if (sessionDescription.sdp === "reject") {
            log.error(
                "Remote peer rejected the session, is another connection already active?",
            )
            throw new Error("Remote peer rejected the session")
        }

        return sessionDescription
    }
