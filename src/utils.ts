import * as moment from "moment";
import * as term from "terminal-kit";

import { Task } from "./types";
import { activeStatuses } from "./constants/statuses";

export function stringifyDate(dateStr: string, dateFormat: string) {
  return moment(dateStr).utc().format(dateFormat);
}

export function compareDateStr(x: Task, y: Task) {
  const dateX = moment(x.end || "9999-12-31");
  const dateY = moment(y.end || "9999-12-31");
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
    const dates = parentDates.concat([task.end]);
    const absolutePath = parentAbsolutePath + "/" + task.name;

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
