import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mkdtemp,
  mkdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { loadFile } from '../../src/sources/file.ts';
import { UserError } from '../../src/errors.ts';

/**
 * Tests for the local-file source loader.
 *
 * A fresh temp directory is allocated per test under os.tmpdir(); cleanup
 * happens in afterEach so leftover artifacts never bleed across tests.
 */
describe('loadFile', () => {
  let workDir: string;

  beforeEach(async () => {
    workDir = await mkdtemp(join(tmpdir(), 'dte-file-test-'));
  });

  afterEach(async () => {
    await rm(workDir, { recursive: true, force: true });
  });

  it('resolves with absolute path + html for a valid .html file', async () => {
    const target = join(workDir, 'page.html');
    const content = '<html><body>hello</body></html>';
    await writeFile(target, content, 'utf8');

    const result = await loadFile(target);

    expect(isAbsolute(result.absPath)).toBe(true);
    expect(result.absPath).toBe(target);
    expect(result.html).toBe(content);
  });

  it('resolves a relative path to an absolute path', async () => {
    const target = join(workDir, 'relative.html');
    const content = '<p>relative</p>';
    await writeFile(target, content, 'utf8');

    const relPath = relative(process.cwd(), target);
    expect(isAbsolute(relPath)).toBe(false);

    const result = await loadFile(relPath);

    expect(result.absPath).toBe(resolve(relPath));
    expect(isAbsolute(result.absPath)).toBe(true);
    expect(result.html).toBe(content);
  });

  it('throws UserError with "File not found" and the path when missing', async () => {
    const missing = join(workDir, 'does-not-exist.html');

    await expect(loadFile(missing)).rejects.toSatisfy((error) => {
      expect(error).toBeInstanceOf(UserError);
      const asUserError = error as UserError;
      expect(asUserError.message).toContain('File not found');
      expect(asUserError.message).toContain(missing);
      expect(asUserError.exitCode).toBe(1);
      return true;
    });
  });

  it('throws UserError "Not a file: <path>" when the path is a directory', async () => {
    const dir = join(workDir, 'as-a-dir');
    await mkdir(dir);

    await expect(loadFile(dir)).rejects.toSatisfy((error) => {
      expect(error).toBeInstanceOf(UserError);
      const asUserError = error as UserError;
      expect(asUserError.message).toBe(`Not a file: ${dir}`);
      expect(asUserError.exitCode).toBe(1);
      return true;
    });
  });

  it('refuses to follow symlinks with a UserError', async () => {
    const real = join(workDir, 'real.html');
    const link = join(workDir, 'link.html');
    await writeFile(real, '<main>symlinked</main>', 'utf8');
    await symlink(real, link);

    await expect(loadFile(link)).rejects.toSatisfy((err) => {
      return (
        err instanceof UserError &&
        err.exitCode === 1 &&
        /Symlinks are not supported/.test(err.message) &&
        err.message.includes(link)
      );
    });
  });

  it('emits a stderr warning for non-.html extensions but still loads', async () => {
    const casesWithWarning = ['page.txt', 'page.htm'];
    for (const name of casesWithWarning) {
      const target = join(workDir, name);
      const content = `<!-- ${name} -->`;
      await writeFile(target, content, 'utf8');

      const spy = vi
        .spyOn(process.stderr, 'write')
        .mockImplementation(() => true);

      try {
        const result = await loadFile(target);
        expect(result.html).toBe(content);
        expect(result.absPath).toBe(target);

        const warnedAboutExtension = spy.mock.calls.some((call) => {
          const [chunk] = call;
          return (
            typeof chunk === 'string' &&
            chunk.includes('does not have a .html extension')
          );
        });
        expect(warnedAboutExtension).toBe(true);
      } finally {
        spy.mockRestore();
      }
    }
  });

  it('does not warn on a .html extension', async () => {
    const target = join(workDir, 'ok.html');
    await writeFile(target, '<b>ok</b>', 'utf8');

    const spy = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);

    try {
      await loadFile(target);

      const warnedAboutExtension = spy.mock.calls.some((call) => {
        const [chunk] = call;
        return (
          typeof chunk === 'string' &&
          chunk.includes('does not have a .html extension')
        );
      });
      expect(warnedAboutExtension).toBe(false);
    } finally {
      spy.mockRestore();
    }
  });

  it('returns empty string html for an empty file (no error)', async () => {
    const target = join(workDir, 'empty.html');
    await writeFile(target, '', 'utf8');

    const result = await loadFile(target);
    expect(result.html).toBe('');
    expect(result.absPath).toBe(target);
  });
});
