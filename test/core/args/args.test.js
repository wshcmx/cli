import { strictEqual } from 'node:assert';
import { suite, test } from 'node:test';

const argsModuleUrl = new URL('../../../dist/core/args.js', import.meta.url);
let importCounter = 0;

async function loadArgs(argv) {
  const originalArgv = process.argv;

  process.argv = argv;

  try {
    return await import(`${argsModuleUrl.href}?test=${importCounter += 1}`);
  } finally {
    process.argv = originalArgv;
  }
}

suite('args parser', () => {
  test('uses defaults when no command or flags are provided', async () => {
    const { args, command } = await loadArgs([
      'node',
      'wshcmx',
    ]);

    strictEqual(command, '');
    strictEqual(args.help, false);
    strictEqual(args.version, false);
    strictEqual(args.project, 'tsconfig.json');
    strictEqual(args['retain-imports-as-comments'], false);
    strictEqual(args['retain-non-ascii-characters'], false);
  });

  test('parses the positional command', async () => {
    const { command } = await loadArgs([
      'node',
      'wshcmx',
      'build',
    ]);

    strictEqual(command, 'build');
  });

  test('parses help from long and short flags', async () => {
    const fromLong = await loadArgs([
      'node',
      'wshcmx',
      '--help',
    ]);
    const fromShort = await loadArgs([
      'node',
      'wshcmx',
      '-h',
    ]);

    strictEqual(fromLong.args.help, true);
    strictEqual(fromShort.args.help, true);
  });

  test('parses version from long and short flags', async () => {
    const fromLong = await loadArgs([
      'node',
      'wshcmx',
      '--version',
    ]);
    const fromShort = await loadArgs([
      'node',
      'wshcmx',
      '-v',
    ]);

    strictEqual(fromLong.args.version, true);
    strictEqual(fromShort.args.version, true);
  });

  test('parses project from long and short options', async () => {
    const fromLong = await loadArgs([
      'node',
      'wshcmx',
      '--project',
      'configs\\custom.tsconfig.json',
    ]);
    const fromShort = await loadArgs([
      'node',
      'wshcmx',
      '-p',
      'configs\\short.tsconfig.json',
    ]);

    strictEqual(fromLong.args.project, 'configs\\custom.tsconfig.json');
    strictEqual(fromShort.args.project, 'configs\\short.tsconfig.json');
  });

  test('parses all supported boolean build flags', async () => {
    const { args } = await loadArgs([
      'node',
      'wshcmx',
      'build',
      '--retain-imports-as-comments',
      '--retain-non-ascii-characters',
    ]);

    strictEqual(args['retain-imports-as-comments'], true);
    strictEqual(args['retain-non-ascii-characters'], true);
  });
});
