#!/usr/bin/env node

// Dependency-free OG image generator. Writes a pre-composed PNG (base64) sized 1200x630.
// Update base64Content if you want a different design (can be produced by any graphics tool).
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR: string = path.resolve(process.cwd(), 'public', 'img');
const OUT_FILE: string = path.join(OUT_DIR, 'og-image.png');

// This is a simple 1200x630 PNG (white background with a light gray bar) placeholder.
// You can swap it later with a branded asset.
const base64Content: string =
    'iVBORw0KGgoAAAANSUhEUgAABLAAAAJ2CAIAAAB+2nG2AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB/UlEQVR4nO3TsQ3CQBBF0S9R0J2gf2gJ2gR2gR2gJ6gW6gW6gVCEuwALC3J7D4vP0kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP2u+8v7ffPvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/PvT/r7n/M8F7f/Z1wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwOQFPEwAB2hwVbgAAAABJRU5ErkJggg==';

async function main(): Promise<void> {
    await fs.promises.mkdir(OUT_DIR, { recursive: true });
    const buffer: Buffer = Buffer.from(base64Content, 'base64');
    await fs.promises.writeFile(OUT_FILE, buffer);
    console.log(`[og-image] Generated ${OUT_FILE}`);
}

main().catch((e: Error) => {
    console.error('[og-image] Failed to generate image', e);
    process.exit(1);
});
