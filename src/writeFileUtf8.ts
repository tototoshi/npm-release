import fs from "fs";

export default async function writeFileUtf8(
  path: string,
  data: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, { encoding: "utf8" }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
