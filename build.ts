import {BuildConfig} from 'bun';
import dts from 'bun-plugin-dts';
import {rm} from 'node:fs/promises';
import process from 'node:process';
import packageInfo from './package.json';

const defaultBuildConfig: BuildConfig = {
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  minify: process.env.NODE_ENV !== 'development',
};

type PackageJson = Partial<Omit<typeof packageInfo, 'type' | 'types'> & {
  type: 'module' | 'commonjs';
  types: string;
}>;

const distInfo: PackageJson = {
  name: packageInfo.name,
  version: packageInfo.version,
  description: packageInfo.description,
  keywords: packageInfo.keywords,
  homepage: packageInfo.homepage,
  bugs: packageInfo.bugs,
  license: packageInfo.license,
  author: packageInfo.author,
  exports: {
    'types': './index.d.ts',
    'import': './index.js',
    'require': './index.cjs',
  },
  repository: packageInfo.repository,
  type: 'module',
  types: './index.d.ts',
};

const currentYear = new Date().getFullYear();
let year: number|string = 2025;
if (year !== currentYear) {
  year = `${year}-${currentYear}`;
}

const licenseInfo = `/*
 * servelat
 *
 * Copyright ${year} nowm
 */
`;

async function buildJs() {
  await Promise.all([
    Bun.build({
      ...defaultBuildConfig,
      plugins: [dts()],
      format: 'esm',
      naming: "[dir]/[name].js",
    }),
    Bun.build({
      ...defaultBuildConfig,
      format: 'cjs',
      naming: "[dir]/[name].cjs",
    }),
  ]);

  const files = [
    './dist/index.js',
    './dist/index.d.ts',
    './dist/index.cjs',
  ];

  for (const path of files) {
    const content = await Bun.file(path).text();
    await Bun.write(path, licenseInfo + content);
  }
}

await rm('./dist', {recursive: true, force: true});

await Promise.all([
  buildJs(),
  Bun.write('./dist/README.md', Bun.file('./README.md')),
  Bun.write('./dist/LICENSE', Bun.file('./LICENSE')),
  Bun.write('./dist/package.json', JSON.stringify(distInfo, null, 2)),
]);
