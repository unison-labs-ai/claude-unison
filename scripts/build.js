#!/usr/bin/env node
const esbuild = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'plugin', 'scripts');

const scripts = [
  'context-hook',
  'summary-hook',
  'search-memory',
  'write-memory',
  'write-project-memory',
  'status',
  'auth-provision',
  'auth-verify',
];

async function build() {
  console.log('Building Unison brain scripts...\n');

  fs.mkdirSync(OUT, { recursive: true });

  for (const script of scripts) {
    const entry = path.join(SRC, `${script}.js`);
    const out = path.join(OUT, `${script}.cjs`);

    try {
      await esbuild.build({
        entryPoints: [entry],
        bundle: true,
        platform: 'node',
        target: 'node18',
        format: 'cjs',
        outfile: out,
        minify: true,
        banner: { js: '#!/usr/bin/env node' },
      });

      fs.chmodSync(out, 0o755);
      const stats = fs.statSync(out);
      console.log(`  ${script}.cjs (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`Failed to build ${script}:`, err.message);
      process.exit(1);
    }
  }

  console.log('\nBuild complete!');
}

build();
