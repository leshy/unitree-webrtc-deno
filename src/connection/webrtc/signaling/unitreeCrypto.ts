import forge from "npm:node-forge@1.3.1"
// pulled out of https://www.npmjs.com/package/aes-cross
// needed some changes like dereferencing window object
import { AES } from "./AES.ts"

console.log("FORGE", forge.pki.publ)

// SubtleCrypto that we can reach in js env doesn't support ECB aes
export function aesEncrypt(key: string, text: string): string {
    return AES.create(key, { mode: "ecb", iv: null, output: "base64" })
        .encString(text)
}

export function aesDecrypt(key: string, text: string): string {
    return AES.create(key, { mode: "ecb", iv: null, output: "base64" })
        .decString(text)
}

// SubtleCrypto that we can reach in js env doesn't support PKCS1-V1_5 RSA
export function rsaEncrypt(
    key: string,
    data: string,
): string {
    const publicKey = forge.pki.publicKeyFromPem(
        `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`,
    )
    const encrypted = publicKey.encrypt(data, "RSAES-PKCS1-V1_5")
    return forge.util.encode64(encrypted)
}

export function generateAesKey(): string {
    // Generate a UUID (16 bytes)
    // This is what Python does with uuid.uuid4().bytes
    const randomValues = new Uint8Array(16)
    crypto.getRandomValues(randomValues)

    // 32 characters long hex
    return Array.from(randomValues)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
}
