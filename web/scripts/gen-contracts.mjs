/**
 * Generate `lib/contracts/types.ts` from the committed JSON Schema bundle.
 *
 * Do not edit the output. Change the Pydantic models in `ai/app/contracts/`,
 * re-export the schemas, then run `npm run gen:contracts`. CI fails on drift.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { compile } from "json-schema-to-typescript";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

const SCHEMA_PATH = join(repoRoot, "contracts", "orange.schema.json");
const OUTPUT_PATH = join(repoRoot, "web", "lib", "contracts", "types.ts");

const BANNER = `/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Source of truth: ai/app/contracts/models.py
 * Regenerate:      npm run gen:contracts
 */`;

async function main() {
  const schema = JSON.parse(await readFile(SCHEMA_PATH, "utf8"));

  const output = await compile(schema, "OrangeContracts", {
    bannerComment: BANNER,
    additionalProperties: false,
    // The bundle's own wrapper type is an artifact of deduping $defs; the
    // types worth importing are the contracts it references.
    declareExternallyReferenced: true,
    enableConstEnums: false,
    format: false,
    unknownAny: true,
  });

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, output, "utf8");
  console.log(`wrote ${OUTPUT_PATH.replace(`${repoRoot}/`, "")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
