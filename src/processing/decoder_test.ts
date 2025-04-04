import * as decoder from "./decoder.ts"
import { initializeWasmModule } from "./denoDecoder.ts"
import { loadData } from "./test/data.ts"
import { assertEquals } from "jsr:@std/assert"

Deno.test("lidar decode", async () => {
    console.log("Starting voxel decoding...")

    try {
        const wasmModule = await initializeWasmModule()
        const data = await loadData("./test/msg.bin")
        console.log("WASM module initialized")

        const result = await decoder.decodeVoxelData(wasmModule, data)

        if (result && result.geometry) {
            assertEquals(result.width, 128)
            assertEquals(result.origin, [-3.225, -3.225, -0.825])
            assertEquals(result.resolution, 0.05)

            assertEquals(result.geometry.face_count, 31740)
            assertEquals(result.geometry.point_count, 12724)
            assertEquals(result.geometry.positions.length, 31740 * 12)
            assertEquals(result.geometry.uvs.length, 31740 * 8)
            assertEquals(result.geometry.indices.length, 31740 * 6)

            assertEquals(Array.from(result.geometry.positions.slice(0, 12)), [
                56,
                13,
                13,
                56,
                12,
                13,
                56,
                13,
                14,
                56,
                12,
                14,
            ])

            assertEquals(Array.from(result.geometry.uvs.slice(0, 8)), [
                42,
                0,
                42,
                255,
                36,
                0,
                36,
                255,
            ])

            assertEquals(Array.from(result.geometry.indices.slice(0, 6)), [
                0,
                1,
                2,
                2,
                1,
                3,
            ])

            console.log(result)
        } else {
            console.log("Failed to decode voxel data or no data returned.")
        }
    } catch (error) {
        console.error("Error running decoder:", error)
    }
})
