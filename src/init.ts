import { resolve } from "node:path";
import { existsSync, writeFileSync } from "node:fs";
import { wshcmxConfigFileName } from "./config.js";

export default function(cwd: string) {
  const wshcmConfigFilePath = resolve(cwd, wshcmxConfigFileName);

  if (existsSync(wshcmConfigFilePath)) {
    console.error(`A '${wshcmxConfigFileName}' file is already defined at: '${cwd}'.`)
    process.exit(1);
  }

  writeFileSync(wshcmConfigFilePath, `export default {
  // Post-watch hook. Might be useful for deploying the sources to a remote server
  postwatch: function(...args) {
    console.log(args);
  }
}`);

  console.log(`Created a new '${wshcmxConfigFileName}' at: '${cwd}'`);
}