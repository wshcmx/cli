import { strictEqual } from 'node:assert';
import { resolve } from 'node:path';
import { test, suite } from 'node:test';

import { ArgsParser } from '#dist/core/args.js';

suite('ArgsParser.getArg', () => {
  test('returns undefined when project argument is omitted', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'cli', 'build'];

    try {
      strictEqual(new ArgsParser().getArg('project'), undefined);
    } finally {
      process.argv = originalArgv;
    }
  });

  test('reads a relative project argument from a separate value', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'cli', 'build', '--project', 'configs/custom.tsconfig.json'];

    try {
      strictEqual(new ArgsParser().getArg('project'), 'configs/custom.tsconfig.json');
    } finally {
      process.argv = originalArgv;
    }
  });

  test('reads an absolute project argument from a separate value', () => {
    const originalArgv = process.argv;
    const absolutePath = resolve('test', 'core', 'config', 'fixture', 'configs', 'custom.tsconfig.json');
    process.argv = ['node', 'cli', 'build', '--project', absolutePath];

    try {
      strictEqual(new ArgsParser().getArg('project'), absolutePath);
    } finally {
      process.argv = originalArgv;
    }
  });

  test('reads a relative project argument from equals syntax', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'cli', 'build', '--project=configs/custom.tsconfig.json'];

    try {
      strictEqual(new ArgsParser().getArg('project'), 'configs/custom.tsconfig.json');
    } finally {
      process.argv = originalArgv;
    }
  });

  test('reads an absolute project argument from equals syntax', () => {
    const originalArgv = process.argv;
    const absolutePath = resolve('test', 'core', 'config', 'fixture', 'configs', 'custom.tsconfig.json');
    process.argv = ['node', 'cli', 'build', `--project=${absolutePath}`];

    try {
      strictEqual(new ArgsParser().getArg('project'), absolutePath);
    } finally {
      process.argv = originalArgv;
    }
  });
});
