#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the vectorStore.ts file
const vectorStorePath = path.join(process.cwd(), 'sdk', 'nodejs', 'vectorStore.ts');

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