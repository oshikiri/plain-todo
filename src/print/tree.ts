import { Task } from "./../types";
import * as utils from "./../utils";
import { statusSymbols } from "./../constants/status_symbols";
import { sizes } from "./format";

function buildLineModeTree(
  task: Task,
  dateFormat: string,
  showStats: boolean
): string {
  const date: string = task.end
    ? utils.stringifyDate(task.end, dateFormat)
    : "";

  const status: string = task.hasActiveChildren()
    ? ""
    : statusSymbols[task.status];

  let line =
    date.padEnd(dateFormat.length + sizes.afterDate, " ") +
    status.padEnd(sizes.widthStatus + sizes.afterStatus, " ") +
    " ".repeat(sizes.depthSize * (task.depth - 1)) +
    task.name;

  if (showStats && task.children && task.children.length > 0) {
    const countTasks = (taskStatus: string): number => {
      return task.children.filter((task) => task.status === taskStatus).length;
    };
    const counts: any = {};
    Object.keys(statusSymbols).forEach((task) => {
      counts[task] = countTasks(task);
    });
    const statuses = ["todo", "doing", "waiting", "done", "cancelled"];
    line += ` (${statuses
      .map((status) => `${statusSymbols[status]}${counts[status]}`)
      .join("/")})`;
  }

  return line;
}

export function printTree(
  tasks: Task[],
  dateFormat: string,
  targetStatuses: string[],
  aliases: { [name: string]: Task },
  showMemo: boolean,
  configs: any
) {
  for (const task of tasks) {
    if (!targetStatuses.includes(task.status)) {
      continue;
    }

    const lineStr = buildLineModeTree(task, dateFormat, configs["showStats"]);
    utils.printLine(lineStr, task.status);

    if (showMemo && task.memo) {
      const indent = " ".repeat(
        dateFormat.length +
          sizes.afterDate +
          sizes.widthStatus +
          sizes.afterStatus +
          sizes.depthSize * (task.depth - 1) +
          sizes.beforeMemo
      );
      utils.printGrey(task.memo.replace(/\n$/, "").replace(/^/gm, indent));
    }

    if (task.hasChildren()) {
      printTree(
        task.children,
        dateFormat,
        targetStatuses,
        aliases,
        showMemo,
        configs
      );
    }
    if (task.requires) {
      const requires = task.requires.map((alias: string) => aliases[alias]);
      for (const require of requires) {
        const requireTask = new Task(require);
        requireTask.name = "@" + (require.absolutePath || requireTask.name);
        requireTask.depth = task.depth + 1;

        if (targetStatuses.includes(requireTask.status)) {
          const lineStr = buildLineModeTree(requireTask, dateFormat, false);
          utils.printLine(lineStr, requireTask.status);
        }
      }
    }
  }
}
