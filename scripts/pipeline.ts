// Top-level pipeline runner
// Usage: tsx scripts/pipeline.ts [country]
// If no country specified, runs all country pipelines

const country = process.argv[2];

async function run() {
  if (!country || country === "nl") {
    console.log("Running Netherlands pipeline...\n");
    await import("./pipelines/nl/index");
  }

  if (country && country !== "nl") {
    console.error(`Unknown country: ${country}`);
    console.error("Available: nl");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
