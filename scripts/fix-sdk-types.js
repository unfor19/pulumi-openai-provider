#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the repository root directory
const repoRoot = process.env.WORKING_DIR || path.resolve(__dirname, '..');

// Path to the vectorStore.ts file using absolute path
const vectorStorePath = path.join(repoRoot, 'sdk', 'nodejs', 'vectorStore.ts');

console.log(`Looking for vectorStore.ts at: ${vectorStorePath}`);

// Check if the file exists
if (!fs.existsSync(vectorStorePath)) {
    console.error(`Error: File not found at ${vectorStorePath}`);
    process.exit(1);
}

// Read the file
let content = fs.readFileSync(vectorStorePath, 'utf8');

// Replace the expiresAfter type with the correct one
content = content.replace(
    /expiresAfter\?: pulumi\.Input<{\[key: string\]: pulumi\.Input<string>}>;/g,
    'expiresAfter?: pulumi.Input<{ anchor: pulumi.Input<string>; days: pulumi.Input<number> }>;'
);

// Replace the expiresAfter output type with the correct one
content = content.replace(
    /public readonly expiresAfter!: pulumi\.Output<{\[key: string\]: string} \| undefined>;/g,
    'public readonly expiresAfter!: pulumi.Output<{ anchor: string; days: number } | undefined>;'
);

// Write the file back
fs.writeFileSync(vectorStorePath, content);

console.log('Fixed SDK types for VectorStore.expiresAfter'); 