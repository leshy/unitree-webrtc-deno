import { generateHeartbeat } from "./webrtc.ts"
import test from "ava"

test("heartbeat", async (t) => {
  const result = generateHeartbeat()
  console.log("Heartbeat result:", result)
  t.is(typeof result, "object")
  t.is(typeof result.timeInStr, "string")
  t.is(typeof result.timeInNum, "number")
  t.regex(result.timeInStr, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
  t.pass()
})
