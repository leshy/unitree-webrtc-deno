import { generateHeartbeat } from "./webrtc"
import test from "ava"
//@ts-ignore
import md5 from "md5"

// Convert hex string directly to base64
function hexToBase64(hexString: string): string {
  // Convert hex to binary string directly
  let binary = ""
  for (let i = 0; i < hexString.length; i += 2) {
    const byte = parseInt(hexString.substring(i, i + 2), 16)
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

test("heartbeat", async (t) => {
  const result = generateHeartbeat()
  console.log("Heartbeat result:", result)
  t.is(typeof result, "object")
  t.is(typeof result.timeInStr, "string")
  t.is(typeof result.timeInNum, "number")
  t.regex(result.timeInStr, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
  t.pass()
})

test("validation hash", async (t) => {
  const data = "some test data"
  const hexHash = md5(`UnitreeGo2_${data}`)
  console.log("MD5 hex:", hexHash)

  // Convert hex directly to base64
  const base64Hash = hexToBase64(hexHash)
  console.log("Base64 (direct):", base64Hash)

  // Compare with Node.js Buffer implementation
  if (typeof Buffer !== "undefined") {
    console.log(
      "Base64 (Node Buffer):",
    )
  }

  t.pass()
})
