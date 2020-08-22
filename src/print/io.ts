import * as jsyaml from "js-yaml";
import * as fs from "fs";

export function loadYaml(yamlPath: string): any {
  const content = fs.readFileSync(yamlPath, "utf8");
  return jsyaml.safeLoad(content);
}

export function fileExists(path: string): boolean {
  return fs.existsSync(path);
}

export function getLastModifiedAt(path: string): Date {
  return fs.statSync(path).mtime;
}
