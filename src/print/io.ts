import * as jsyaml from "js-yaml";
import * as fs from "fs";
import { TodoYaml } from "../types";

export function loadYaml(yamlPath: string): TodoYaml {
  const content = fs.readFileSync(yamlPath, "utf8");
  return <any>jsyaml.safeLoad(content);
}

export function fileExists(path: string): boolean {
  return fs.existsSync(path);
}

export function getLastModifiedAt(path: string): Date {
  return fs.statSync(path).mtime;
}
