import * as dayjs from "dayjs";
import * as term from "terminal-kit";

import { Task } from "./types";
import { activeStatuses } from "./constants/statuses";

const MAX_TASK_NAME_LENGTH = 30; // TODO: add to config

export function stringifyDate(dateStr: string, dateFormat: string) {
  return dayjs(dateStr).format(dateFormat);
}

export function compareDateStr(x: Task, y: Task) {
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

export function printLine(line: string, status: string) {
  let terminal = term.terminal;
  if (!activeStatuses.includes(status)) {
    terminal = terminal.grey;
  }
  terminal(line)("\n");
}

export function printGrey(line: string) {
  term.terminal.grey(line)("\n");
}

export function fillParentsInformations(
  tasks: Task[],
  parentAbsolutePath: string,
  parentDates: any
) {
  for (const i in tasks) {
    tasks[i] = new Task(tasks[i]);

    const task = tasks[i];
    let taskName = task.name;
    if (taskName.length > MAX_TASK_NAME_LENGTH) {
      taskName = taskName.slice(0, MAX_TASK_NAME_LENGTH - 2) + "…";
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
        dates
      );
    }
  }
  return tasks;
}
