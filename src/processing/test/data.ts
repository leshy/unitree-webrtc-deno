/**
 * Converts an object with numeric string keys to an ArrayBuffer via Int8Array
 */
export function objectToArrayBuffer(obj: Record<string, number>): ArrayBuffer {
    const maxIndex = Math.max(...Object.keys(obj).map((k) => parseInt(k, 10)))
    const int8Array = new Int8Array(maxIndex + 1)

    for (const [key, value] of Object.entries(obj)) {
        int8Array[parseInt(key, 10)] = value
    }

    return int8Array.buffer
}

/**
 * Converts an ArrayBuffer to an object with string keys
 */
export function arrayBufferToObject(
    buffer: ArrayBuffer,
): Record<string, number> {
    const int8Array = new Int8Array(buffer)
    const result: Record<string, number> = {}

    for (let i = 0; i < int8Array.length; i++) {
        result[i.toString()] = int8Array[i]
    }

    return result
}

/**
 * Saves an ArrayBuffer to a binary file
 */
export async function saveArrayBufferToFile(
    buffer: ArrayBuffer,
    filePath: string,
): Promise<void> {
    const uint8Array = new Uint8Array(buffer)
    await Deno.writeFile(filePath, uint8Array)
    console.log(`Saved binary file to ${filePath}`)
}

/**
 * Loads a binary file into an ArrayBuffer
 */
export async function loadArrayBufferFromFile(
    filePath: string,
): Promise<ArrayBuffer> {
    const data = await Deno.readFile(filePath)
    console.log(`Loaded binary file from ${filePath}`)
    return data.buffer
}

export const loadData = async (file) => await loadArrayBufferFromFile(file)
