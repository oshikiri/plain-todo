import * as dayjs from "dayjs";

import { Task } from "./types";

export function stringifyDate(dateStr: string, dateFormat: string) {
  return dayjs(dateStr).format(dateFormat);
}

export function compareDateStartStr(x: Task, y: Task) {
  const dateX = dayjs(x.start || "9999-12-31");
  const dateY = dayjs(y.start || "9999-12-31");
  return dateX.diff(dateY);
}

export function compareDateEndStr(x: Task, y: Task) {
  const dateX = dayjs(x.end || "9999-12-31");
  const dateY = dayjs(y.end || "9999-12-31");
  return dateX.diff(dateY);
}

export function flattenTasks(tasks: Task[]) {
  let flattened: Task[] = [];
  for (const task of tasks) {
    flattened.push(task);
    if (task.children) {
      flattened = flattened.concat(flattenTasks(task.children));
    }
  }
  return flattened;
}

export function extractAliases(tasks: Task[]): { [name: string]: Task } {
  let aliases: { [name: string]: Task } = {};

  for (const task of tasks) {
    if (task.alias) {
      aliases[task.alias] = task;
    }
    if (task.children) {
      const aliasesSubtask = extractAliases(task.children);
      aliases = Object.assign({}, aliases, aliasesSubtask);
    }
  }
  return aliases;
}

export function fillParentsInformations(
  tasks: Task[],
  parentAbsolutePath: string,
  parentDates: any,
  maxLengthTaskName: number
) {
  for (const i in tasks) {
    tasks[i] = new Task(tasks[i]);

    const task = tasks[i];
    let taskName = task.name;
    if (taskName.length > maxLengthTaskName) {
      taskName = taskName.slice(0, maxLengthTaskName - 2) + "…";
    }
    const dates = parentDates.concat([task.end]);
    const absolutePath = parentAbsolutePath + "/" + taskName;

    tasks[i].absolutePath = absolutePath;
    tasks[i].isDefaultStatus = task.status === undefined;
    tasks[i].status = task.status || "todo";
    tasks[i].depth = dates.length - 1;
    const date = dates
      .reverse()
      .find((item: string | undefined) => item != undefined);
    if (date) {
      tasks[i].end = date;
    }
    if (task.hasChildren()) {
      tasks[i].children = fillParentsInformations(
        task.children,
        absolutePath,
        dates,
        maxLengthTaskName
      );
    }
  }
  return tasks;
}

export function extractSubtree(tasks: Task[], subtreePath: string): Task[] {
  let parsedPath = subtreePath.split("/");
  if (subtreePath == "/" || parsedPath.length <= 1) {
    return tasks;
  }
  parsedPath = parsedPath.slice(1);
  let selectedTasks = tasks;
  for (const name of parsedPath) {
    selectedTasks = selectedTasks.find((t) => t.name == name)?.children;
    if (!selectedTasks) {
      throw Error(`Invalid --subtree: ${subtreePath}`);
    }
  }
  return selectedTasks;
}
