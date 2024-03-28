const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['index.ts'],
    outfile: 'dist/index.js',
    bundle: true,
    minify: true,
    platform: 'node',
    target: 'node16',
    plugins: [],
  })
  .catch(() => process.exit(1));
