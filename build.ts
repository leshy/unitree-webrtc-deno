import * as esbuild from "esbuild"

// Common build options
const commonOptions: esbuild.BuildOptions = {
  entryPoints: ["src/mod.ts"],
  bundle: true,
  minify: true,
  sourcemap: true,
  tsconfig: "tsconfig.json",
  loader: {
    ".ts": "ts",
  },
}

// Build for Browser
async function buildBrowser() {
  try {
    await esbuild.build({
      ...commonOptions,
      outfile: "dist/browser.js",
      platform: "browser",
      format: "esm",
      define: {
        "runningInBrowser": "true",
        "global": "window", // Handle cases where code might reference global
      },
      // Mark Node-specific packages as external
      external: [
        "@roamhq/wrtc",
        "pino/file",
        "node-forge",
      ],
      // No need for aliases since browsers have native WebRTC support
    })
    console.log("[SUCCESS] Browser build complete")
  } catch (error) {
    console.error("[ERROR] Browser build failed:", error)
  }
}

// Process command line arguments to determine which builds to run
async function build() {
  console.log("[INFO] Starting build process...")
  await buildBrowser()
}

build()
