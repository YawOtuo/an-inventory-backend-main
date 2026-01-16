#!/usr/bin/env node

/**
 * Script to merge separate Prisma model files into a single schema.prisma file
 * This allows us to organize models in separate files while Prisma requires a single schema file
 */

const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, '..', 'prisma');
const modelsDir = path.join(prismaDir, 'models');
const baseFile = path.join(prismaDir, 'base.prisma');
const outputFile = path.join(prismaDir, 'schema.prisma');

// Read base configuration
const baseContent = fs.readFileSync(baseFile, 'utf-8');

// Get all model files in alphabetical order
const modelFiles = fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.prisma'))
    .sort();

// Read and combine all model files
let modelsContent = '\n';
modelFiles.forEach(file => {
    const filePath = path.join(modelsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    modelsContent += content + '\n\n';
});

// Combine base and models
const fullSchema = baseContent + '\n' + modelsContent;

// Write to schema.prisma
fs.writeFileSync(outputFile, fullSchema, 'utf-8');

console.log('✅ Prisma schema merged successfully!');
console.log(`   Merged ${modelFiles.length} model files into schema.prisma`);