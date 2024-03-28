import * as exec from '@actions/exec';
import { getDiff } from '../src/getDiff';

jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}));

const githubBaseRef = 'ref';
const githubSha = 'sha';

describe('getDiff.ts test suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('gets correct diff for pull_request event', async () => {
    await getDiff(githubBaseRef, githubSha);
    expect((exec.exec as jest.Mock).mock.calls).toEqual([
      [`git fetch origin ${githubBaseRef} --depth=1`],
      expect.arrayContaining([`git diff --name-only origin/${githubBaseRef} ${githubSha}`, []]),
    ]);
  });

  it('gets correct event for push event', async () => {
    await getDiff('', githubSha);
    expect((exec.exec as jest.Mock).mock.calls).toEqual([
      expect.arrayContaining([`git diff --diff-filter=d --name-only ${githubSha}^1 ${githubSha}`, []]),
    ]);
  });

  it('returns empty array for no command output', async () => {
    const result = await getDiff('', githubSha);
    expect(result).toEqual([]);
  });
});
