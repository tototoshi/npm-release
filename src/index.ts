import path from "path";
import shell from "shelljs";

import prompts from "prompts";
import writeFileUtf8 from "./writeFileUtf8";

const root = path.resolve(process.cwd());
const packageJson = path.resolve(root, "package.json");
const packageInfo = require(path.resolve(root, "package.json"));

async function confirm() {
  const answer = await prompts({
    type: "confirm",
    message: `Do you want to release ${packageInfo.name}?`,
    name: "start",
  });

  if (!answer.start) {
    process.exit(1);
  }
}

function checkIfWorkingDirectoryIsClean() {
  const diff = shell.exec("git status --porcelain").stdout;
  if (diff.length > 0) {
    console.error("Workspace is not clean");
    process.exit(1);
  }
}

async function updatePackgeJson(version: string) {
  await writeFileUtf8(
    packageJson,
    JSON.stringify({ ...packageInfo, version: version }, null, 2)
  );

  shell.exec("npm install");
}

async function commit(version: string) {
  const answer = await prompts({
    type: "confirm",
    message: "Do you want to commit?",
    name: "doCommit",
  });

  if (!answer.doCommit) {
    return;
  }

  shell.exec("git add package.json package-lock.json");
  shell.exec(`git commit -m v${version}`);
  shell.exec(`git tag v${version}`);
}

async function publish() {
  const answer = await prompts({
    type: "confirm",
    message: "Do you want to publish?",
    name: "doPublish",
  });

  if (!answer.doPublish) {
    return;
  }

  shell.exec("npm publish --access public");
}

async function pushCommitAndTag() {
  const answer = await prompts({
    type: "confirm",
    message: "Do you want to push commits and tags?",
    name: "doPush",
  });

  if (!answer.doPush) {
    return;
  }

  shell.exec("git push");
  shell.exec("git push --tags");
}

async function main() {
  await confirm();

  checkIfWorkingDirectoryIsClean();

  const answer = await prompts({
    type: "text",
    message: `Please input the next version (current: ${packageInfo.version})`,
    name: "version",
  });

  console.log(`Will release version ${answer.version}`);

  await updatePackgeJson(answer.version);

  await commit(answer.version);

  await publish();

  await pushCommitAndTag();

  console.log("All Done!");
}

main().catch((e) => console.error(e));
