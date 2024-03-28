import { readFile } from 'fs/promises';

const appsWorkspaceDirectory = 'apps';

interface Package {
  directory: string;
  excludeFromDeployment?: boolean;
  deploymentDependencies?: string[];
}

type Matrix = Array<Array<string>>;

export const getMatrix = async (diff: string[]): Promise<Matrix> => {
  const result = [];
  const packages = (await getPackages(diff)).filter((pkg) => !pkg.excludeFromDeployment);
  const [packagesWithDependencies, packagesWithoutDependencies] = splitArray(
    packages,
    (pkg) => pkg.deploymentDependencies !== undefined && pkg.deploymentDependencies.length > 0,
  );
  //all packages without dependencies can be immidiately deployed
  result.push(packagesWithoutDependencies.map((pkg) => pkg.directory));
  return populateMatrix(result, packagesWithDependencies);
};

/*
  split remaining packages based on if all of their deployment dependencies are already schedule to be deployed
  if yes deploy them in this step
  if not move them to the next
  continue recurseively until no more packages are left
*/
const populateMatrix = (result: Matrix, remainingPackages: Package[]): Matrix => {
  if (remainingPackages.length === 0) {
    return result;
  }
  const filter = (pkg: Package) =>
    (pkg.deploymentDependencies as string[]).some((dependency) =>
      remainingPackages.some((pkg) => pkg.directory === dependency),
    );

  const [remaining, dependenciesResolved] = splitArray(remainingPackages, filter);
  result.push(dependenciesResolved.map((pkg) => pkg.directory));

  return populateMatrix(result, remaining);
};

const splitArray = <T>(array: T[], filter: (element: T, array: T[]) => boolean) => {
  const pass: T[] = [],
    fail: T[] = [];
  array.forEach((element) => (filter(element, array) ? pass : fail).push(element));
  return [pass, fail];
};

const getPackages = async (diffFiles: string[]) => {
  const result: Package[] = [];

  const directories = Array.from(
    new Set(
      diffFiles
        .filter((filePath) => filePath.startsWith(appsWorkspaceDirectory))
        .map((filePath) => {
          const splitPath = filePath.split('/');
          return `${splitPath[0]}/${splitPath[1]}`;
        }),
    ),
  );

  for (const directory of directories) {
    const { excludeFromDeployment, deploymentDependencies } = await readJsonFile(`./${directory}/package.json`);
    result.push({
      directory,
      excludeFromDeployment,
      deploymentDependencies,
    });
  }

  return result;
};

async function readJsonFile(path: string) {
  console.log(readFile);
  const file = await readFile(path, 'utf8');
  return JSON.parse(file);
}
