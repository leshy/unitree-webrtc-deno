export async function initializeWasmModule() {
    const wasmBinary = await Deno.readFile("./libvoxel.wasm")

    // Create a holder for the module
    let wasmModuleRef: any = null

    // Create memory handlers
    const importObj = {
        a: {
            b: (t: number, n: number, a: number) => {
                // copyWithin function (HEAPU8.copyWithin)
                if (wasmModuleRef?.HEAPU8) {
                    wasmModuleRef.HEAPU8.copyWithin(t, n, n + a)
                }
            },
            a: () => {
                // OOM error function
                throw new Error("Out of memory")
            },
        },
    }

    // Instantiate the module
    const { instance } = await WebAssembly.instantiate(wasmBinary, importObj)

    // Create heap views
    const memory = instance.exports.c as WebAssembly.Memory
    const buffer = memory.buffer

    // Create a module object
    wasmModuleRef = {
        asm: instance.exports,
        HEAP8: new Int8Array(buffer),
        HEAP16: new Int16Array(buffer),
        HEAP32: new Int32Array(buffer),
        HEAPU8: new Uint8Array(buffer),
        HEAPU16: new Uint16Array(buffer),
        HEAPU32: new Uint32Array(buffer),
        HEAPF32: new Float32Array(buffer),
        HEAPF64: new Float64Array(buffer),

        _generate: instance.exports.e,
        _malloc: instance.exports.f,
        _free: instance.exports.g,

        getValue: function (ptr: number, type = "i8"): number {
            // Similar to getValue function in voxel-worker.js
            switch (type) {
                case "i1":
                case "i8":
                    return wasmModuleRef.HEAP8[ptr >> 0]
                case "i16":
                    return wasmModuleRef.HEAP16[ptr >> 1]
                case "i32":
                    return wasmModuleRef.HEAP32[ptr >> 2]
                case "i64":
                    return wasmModuleRef.HEAP32[ptr >> 2] // Same as i32 in original
                case "float":
                    return wasmModuleRef.HEAPF32[ptr >> 2]
                case "double":
                    return wasmModuleRef.HEAPF64[ptr >> 3]
                case "*":
                    return wasmModuleRef.HEAPU32[ptr >> 2]
                default:
                    throw new Error(`Invalid type for getValue: ${type}`)
            }
        },
    }

    return wasmModuleRef
}
