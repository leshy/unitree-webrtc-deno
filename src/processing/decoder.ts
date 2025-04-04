export interface GeometryData {
    point_count: number
    face_count: number
    positions: Uint8Array
    uvs: Uint8Array
    indices: Uint32Array
}

export interface VoxelResult {
    geometry: GeometryData
    resolution: number
    origin: number[]
    width: number
}

/**
 * Type definition for the WASM module interface
 */
export interface WasmModule {
    HEAPU8: Uint8Array
    _malloc: (size: number) => number
    _free: (ptr: number) => void
    _generate: (
        input: number,
        inputLength: number,
        decompressBufferSize: number,
        decompressBuffer: number,
        decompressedSize: number,
        positions: number,
        uvs: number,
        indices: number,
        faceCount: number,
        pointCount: number,
        zLevel: number,
    ) => void
    getValue: (ptr: number, type: string) => number
}

export class VoxelDecoder {
    private wasmModule: WasmModule
    private input: number
    private decompressBuffer: number
    private positions: number
    private uvs: number
    private indices: number
    private decompressedSize: number
    private faceCount: number
    private pointCount: number
    private decompressBufferSize: number

    constructor(wasmModule: WasmModule, decompressBufferSize = 8e4) {
        this.wasmModule = wasmModule
        this.decompressBufferSize = decompressBufferSize

        // Allocate memory just like in the original VoxelDecoder class
        this.input = this.wasmModule._malloc(61440)
        this.decompressBuffer = this.wasmModule._malloc(8e4)
        this.positions = this.wasmModule._malloc(288e4)
        this.uvs = this.wasmModule._malloc(192e4)
        this.indices = this.wasmModule._malloc(576e4)
        this.decompressedSize = this.wasmModule._malloc(4)
        this.faceCount = this.wasmModule._malloc(4)
        this.pointCount = this.wasmModule._malloc(4)
    }

    release() {
        // Free memory like in the original class
        this.wasmModule._free(this.input)
        this.wasmModule._free(this.positions)
        this.wasmModule._free(this.uvs)
        this.wasmModule._free(this.indices)
        this.wasmModule._free(this.pointCount)
        this.wasmModule._free(this.decompressBuffer)
        this.wasmModule._free(this.decompressedSize)
    }

    generate(data: Uint8Array, zLevel: number): GeometryData {
        // Copy data to WASM memory
        this.wasmModule.HEAPU8.set(data, this.input)

        // Call the WASM generate function
        this.wasmModule._generate(
            this.input,
            data.length,
            this.decompressBufferSize,
            this.decompressBuffer,
            this.decompressedSize,
            this.positions,
            this.uvs,
            this.indices,
            this.faceCount,
            this.pointCount,
            zLevel,
        )

        // Get values from heap
        const _decompressedSize = this.wasmModule.getValue(
            this.decompressedSize,
            "i32",
        )
        const pointCount = this.wasmModule.getValue(this.pointCount, "i32")
        const faceCount = this.wasmModule.getValue(this.faceCount, "i32")

        // Extract data from WASM memory
        const positions = new Uint8Array(
            this.wasmModule.HEAPU8.subarray(
                this.positions,
                this.positions + faceCount * 12,
            ).slice(),
        )

        const uvs = new Uint8Array(
            this.wasmModule.HEAPU8.subarray(this.uvs, this.uvs + faceCount * 8)
                .slice(),
        )

        const indices = new Uint32Array(
            this.wasmModule.HEAPU8.subarray(
                this.indices,
                this.indices + faceCount * 24,
            ).slice().buffer,
        )

        return {
            point_count: pointCount,
            face_count: faceCount,
            positions,
            uvs,
            indices,
        }
    }
}

/**
 * Parse voxel input data from an ArrayBuffer
 * @param buffer The raw input buffer to parse
 * @returns Parsed voxel data components
 */
export function parseInput(
    buffer: ArrayBuffer,
): { data: Uint8Array; resolution: number; origin: number[]; width: number } {
    // Default values
    let resolution = 0.1
    let origin = [0, 0, 0]
    let width = 128
    let binaryData = new Uint8Array(buffer)

    // First, let's examine the buffer with hexdump
    const rawBytes = new Uint8Array(buffer)
    console.log("First 50 bytes of input:")
    console.log(
        Array.from(rawBytes.slice(0, 50)).map((b) =>
            b.toString(16).padStart(2, "0")
        ).join(" "),
    )

    // Look at the full buffer as text for debugging
    const textDecoder = new TextDecoder()
    const headerText = textDecoder.decode(rawBytes.slice(0, 200))
    console.log("Header text (first 200 bytes):", headerText)

    // We have a JSON header, then binary data
    // Find the JSON boundaries
    let jsonStart = -1
    let jsonEnd = -1
    let braceCount = 0

    for (let i = 0; i < rawBytes.length; i++) {
        const char = String.fromCharCode(rawBytes[i])

        if (char === "{") {
            if (braceCount === 0) {
                jsonStart = i
            }
            braceCount++
        } else if (char === "}") {
            braceCount--
            if (braceCount === 0) {
                jsonEnd = i
                break
            }
        }
    }

    if (jsonStart >= 0 && jsonEnd > jsonStart) {
        // Extract and parse the JSON
        const jsonPart = textDecoder.decode(
            rawBytes.slice(jsonStart, jsonEnd + 1),
        )
        console.log("Found JSON from", jsonStart, "to", jsonEnd)

        console.log("Attempting to parse JSON part")
        const msgObj = JSON.parse(jsonPart)

        // Extract metadata from parsed JSON
        if (msgObj.data) {
            if (msgObj.data.resolution) {
                resolution = Number(msgObj.data.resolution)
            }
            if (msgObj.data.origin) origin = msgObj.data.origin
            if (msgObj.data.width) {
                width = Array.isArray(msgObj.data.width)
                    ? msgObj.data.width[0]
                    : msgObj.data.width
            }

            console.log("Successfully extracted metadata:", {
                resolution,
                origin,
                width: Array.isArray(msgObj.data.width)
                    ? msgObj.data.width
                    : width,
            })
            console.log(msgObj)
        }

        // Get the binary part after the JSON
        if (jsonEnd + 1 < rawBytes.length) {
            binaryData = rawBytes.slice(jsonEnd + 1)
            console.log(
                `Extracted binary data starting at byte ${
                    jsonEnd + 1
                }, length: ${binaryData.length} bytes`,
            )

            // Show first few bytes of binary data
            console.log(
                "First bytes of binary data:",
                Array.from(binaryData.slice(0, 20)).map((b) =>
                    b.toString(16).padStart(2, "0")
                ).join(" "),
            )
        }
    } else {
        console.log(
            "Couldn't find valid JSON structure, using entire buffer as binary data",
        )
    }

    return {
        data: binaryData,
        resolution,
        origin,
        width,
    }
}

/**
 * Decode voxel data using direct implementation of the voxel-worker.js approach
 * @param wasmModule The initialized WebAssembly module
 * @param buffer The raw voxel data buffer to decode
 * @returns Decoded voxel data result or null if an error occurs
 */
export async function decodeVoxelData(
    wasmModule: WasmModule,
    buffer: ArrayBuffer,
): Promise<VoxelResult | null> {
    try {
        console.log(`Received binary data, size: ${buffer.byteLength} bytes`)

        // Parse the input to get metadata and binary data
        const parsedInput = parseInput(buffer)

        // Initialize WASM module
        console.log("Initializing WASM module...")

        // Create decoder instance
        const decoder = new VoxelDecoder(wasmModule)

        // Calculate Z level just like in the worker
        const zLevel = Math.floor(
            parsedInput.origin[2] / parsedInput.resolution,
        )
        console.log(
            `Using Z-level: ${zLevel} (origin[2]: ${
                parsedInput.origin[2]
            }, resolution: ${parsedInput.resolution})`,
        )

        // Generate the voxel geometry
        const geometry = decoder.generate(parsedInput.data, zLevel)
        console.log(
            `Generated geometry: ${geometry.face_count} faces, ${geometry.point_count} points`,
        )

        // Create the result
        const result: VoxelResult = {
            geometry,
            ...parsedInput,
        }

        // Release memory
        decoder.release()

        return result
    } catch (error) {
        console.error("Error in decodeVoxelData:", error)
        return null
    }
}
