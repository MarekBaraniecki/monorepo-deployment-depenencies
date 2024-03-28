import * as exec from '@actions/exec';

export const getDiff = async (githubBaseRef: string, githubSha: string): Promise<string[]> => {
  let output = '';

  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
  };

  if (githubBaseRef) {
    // Pull request

    await exec.exec(`git fetch origin ${githubBaseRef} --depth=1`);
    await exec.exec(`git diff --name-only origin/${githubBaseRef} ${githubSha}`, [], options);
  } else {
    // Push to branch
    await exec.exec(`git diff --diff-filter=d --name-only ${githubSha}^1 ${githubSha}`, [], options);
  }

  if (!output) {
    return [];
  }
  return output.split('\n');
};
