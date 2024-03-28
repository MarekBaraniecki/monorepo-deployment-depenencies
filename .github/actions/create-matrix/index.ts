import * as core from '@actions/core';
import { script } from './src/script';

const githubBaseRef = core.getInput('github-base-ref');
const githubSha = core.getInput('github-sha');

script(githubBaseRef, githubSha);
