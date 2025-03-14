import * as esbuild from "esbuild"

// Common build options
const commonOptions: esbuild.BuildOptions = {
  entryPoints: ["src/core.ts"],
  bundle: true,
  minify: true,
  sourcemap: true,
  tsconfig: "tsconfig.json",
  loader: {
    ".ts": "ts",
  },
}

// Build for Node.js
async function buildNode() {
  try {
    await esbuild.build({
      ...commonOptions,
      outfile: "dist/node.js",
      platform: "node",
      format: "cjs",
      define: {
        "runningInBrowser": "false",
      },
    })
    console.log("[SUCCESS] Node build complete")
  } catch (error) {
    console.error("[ERROR] Node build failed:", error)
  }
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
  const args = process.argv.slice(2)
  console.log("[INFO] Starting build process...")

  if (args.length === 0 || args.includes("all")) {
    // Run both builds in parallel
    await Promise.all([buildNode(), buildBrowser()])
    console.log("[SUCCESS] All builds completed successfully")
  } else if (args.includes("node")) {
    // Only build for Node
    await buildNode()
    console.log("[SUCCESS] Node build completed successfully")
  } else if (args.includes("browser")) {
    // Only build for browser
    await buildBrowser()
    console.log("[SUCCESS] Browser build completed successfully")
  } else {
    console.error(
      '[ERROR] Unknown build target. Use "node", "browser", or no argument for all builds.',
    )
  }
}

build()
