import { script } from '../src/script';
import { getDiff } from '../src/getDiff';
import * as core from '@actions/core';
import fs from 'fs/promises';

jest.mock('../src/getDiff', () => ({
  getDiff: jest.fn(),
}));

jest.mock('@actions/core', () => ({
  setOutput: jest.fn(),
}));

jest.mock('fs/promises', () => ({
  readFile: jest.fn()
}));

const servicesDirectory = 'apps';
const mockDiff = [
  '.github/actions/create-matrix/dist/index.js',
  'packages',
  'package.json', // that's a bit tricky
  `${servicesDirectory}/boilerplate/src/file.ts`,
  `${servicesDirectory}/backend-for-frontend/src/file.ts`,
  `${servicesDirectory}/storefront/src/file.ts`,
];

describe('Job matrix script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty nested array for no diffs', async () => {
    (getDiff as jest.Mock).mockReturnValueOnce([]);
    await script('ref', 'sha');

    expect(getDiff as jest.Mock).toHaveBeenCalledTimes(1);
    expect(core.setOutput).toHaveBeenCalledWith('job-matrix', '[[]]');
  });

  it('returns multiple package directories in the first step, for no deployment dependencies', async () => {
    (getDiff as jest.Mock).mockReturnValueOnce(mockDiff);
    (fs.readFile as jest.Mock).mockResolvedValue('{}');
    await script('ref', 'sha');

    expect(fs.readFile as jest.Mock).toHaveBeenCalledTimes(3);
    expect(getDiff as jest.Mock).toHaveBeenCalledTimes(1);
    expect(core.setOutput).toHaveBeenCalledWith('job-matrix', '[["apps/boilerplate","apps/backend-for-frontend","apps/storefront"]]');
  });

  it('does not return excluded packages', async () => {
    (getDiff as jest.Mock).mockReturnValueOnce(mockDiff);
    (fs.readFile as jest.Mock).mockImplementation((arg) => {
      if (arg === `./${servicesDirectory}/storefront/package.json`) {
        return Promise.resolve('{"excludeFromDeployment": true}')
      }
      return Promise.resolve('{}');
    })
    await script('ref', 'sha');
    expect(fs.readFile as jest.Mock).toHaveBeenCalledTimes(3);
    expect(getDiff as jest.Mock).toHaveBeenCalledTimes(1);
    expect(core.setOutput).toHaveBeenCalledWith('job-matrix', '[["apps/boilerplate","apps/backend-for-frontend"]]');
  });

  it('returns two arrays when a deploymentDependency is present', async () => {
    (getDiff as jest.Mock).mockReturnValueOnce(mockDiff);
    (fs.readFile as jest.Mock).mockImplementation((arg) => {
      if (arg === `./${servicesDirectory}/storefront/package.json`) {
        return Promise.resolve('{"deploymentDependencies": ["apps/boilerplate"]}')
      }
      return Promise.resolve('{}');
    })
    await script('ref', 'sha');
    expect(fs.readFile as jest.Mock).toHaveBeenCalledTimes(3);
    expect(getDiff as jest.Mock).toHaveBeenCalledTimes(1);
    expect(core.setOutput).toHaveBeenCalledWith('job-matrix', '[["apps/boilerplate","apps/backend-for-frontend"],["apps/storefront"]]');
  });

  it('returns thre arrays when a two-level deploymentDependency chain is present', async () => {
    (getDiff as jest.Mock).mockReturnValueOnce(mockDiff);
    (fs.readFile as jest.Mock).mockImplementation((arg) => {
      if (arg === `./${servicesDirectory}/storefront/package.json`) {
        return Promise.resolve('{"deploymentDependencies": ["apps/boilerplate"]}')
      } else if (arg === `./${servicesDirectory}/boilerplate/package.json`) {
        return Promise.resolve('{"deploymentDependencies": ["apps/backend-for-frontend"]}')
      }
      return Promise.resolve('{}');
    })
    await script('ref', 'sha');
    expect(fs.readFile as jest.Mock).toHaveBeenCalledTimes(3);
    expect(getDiff as jest.Mock).toHaveBeenCalledTimes(1);
    expect(core.setOutput).toHaveBeenCalledWith('job-matrix', '[["apps/backend-for-frontend"],["apps/boilerplate"],["apps/storefront"]]');
  });
});
