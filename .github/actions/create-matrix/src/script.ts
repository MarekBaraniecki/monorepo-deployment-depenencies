import * as core from '@actions/core';
import { getDiff } from './getDiff';
import { getMatrix } from './getMatrix';

export const script = async (githubBaseRef: string, githubSha: string) => {
  const diff = await getDiff(githubBaseRef, githubSha);
  const result = await getMatrix(diff);
  core.setOutput('job-matrix', JSON.stringify(result));
};
