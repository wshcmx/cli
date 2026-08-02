import { match, ok, strictEqual } from 'node:assert';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { suite, test } from 'node:test';

const fixturePath = resolve(import.meta.dirname, 'build_args_fixture');
const cliEntryPath = resolve(import.meta.dirname, '..', '..', 'dist', 'index.js');

function createProject(t) {
  const tempRootPath = mkdtempSync(join(tmpdir(), 'wshcmx-build-args-'));
  const projectPath = join(tempRootPath, 'project');
  cpSync(fixturePath, projectPath, { recursive: true });
  t.after(() => rmSync(tempRootPath, { recursive: true, force: true }));
  return projectPath;
}

function runBuild(projectPath, cliArgs = []) {
  execFileSync(process.execPath, [cliEntryPath, 'build', ...cliArgs], {
    cwd: projectPath,
    stdio: 'pipe',
  });
}

function getBuiltIndexPath(projectPath, outputDirectoryName) {
  const candidatePaths = [
    join(projectPath, outputDirectoryName, 'index.bs'),
    join(projectPath, outputDirectoryName, 'index.js'),
    join(projectPath, outputDirectoryName, 'src', 'index.bs'),
    join(projectPath, outputDirectoryName, 'src', 'index.js'),
  ];

  return candidatePaths.find((candidatePath) => existsSync(candidatePath)) ?? candidatePaths[0];
}

function hasBuiltIndex(projectPath, outputDirectoryName) {
  return getBuiltIndexPath(projectPath, outputDirectoryName) !== join(projectPath, outputDirectoryName, 'index.bs')
    || existsSync(join(projectPath, outputDirectoryName, 'index.bs'));
}

suite('build command arguments', () => {
  test('--project and -p select the tsconfig used for the build', (t) => {
    const longOptionProjectPath = createProject(t);
    const shortOptionProjectPath = createProject(t);

    runBuild(longOptionProjectPath, ['--project', 'configs\\tsconfig.custom.json']);
    runBuild(shortOptionProjectPath, ['-p', 'configs\\tsconfig.custom.json']);

    ok(hasBuiltIndex(longOptionProjectPath, 'dist-custom'));
    ok(hasBuiltIndex(shortOptionProjectPath, 'dist-custom'));
    strictEqual(hasBuiltIndex(longOptionProjectPath, 'dist-default'), false);
    strictEqual(hasBuiltIndex(shortOptionProjectPath, 'dist-default'), false);
  });
});
