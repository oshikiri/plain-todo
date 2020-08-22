import { Task } from "./../types";
import * as utils from "./../utils";
import { statusSymbols } from "./../constants/status_symbols";
import { sizes } from "./format";

function buildLineModeTree(task: Task, dateFormat: string): string {
  const date: string = task.end
    ? utils.stringifyDate(task.end, dateFormat)
    : "";

  const status: string = task.hasActiveChildren()
    ? ""
    : statusSymbols[task.status];

  const line =
    date.padEnd(dateFormat.length + sizes.afterDate, " ") +
    status.padEnd(sizes.widthStatus + sizes.afterStatus, " ") +
    " ".repeat(sizes.depthSize * (task.depth - 1)) +
    task.name;

  return line;
}

export function printTree(
  tasks: Task[],
  dateFormat: string,
  targetStatuses: string[],
  aliases: { [name: string]: Task },
  showMemo: boolean
) {
  for (const task of tasks) {
    if (!targetStatuses.includes(task.status)) {
      continue;
    }

    const lineStr = buildLineModeTree(task, dateFormat);
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
      printTree(task.children, dateFormat, targetStatuses, aliases, showMemo);
    }
    if (task.requires) {
      const requires = task.requires.map((alias: string) => aliases[alias]);
      for (const require of requires) {
        const requireTask = new Task(require);
        requireTask.name = "@" + (require.absolutePath || requireTask.name);
        requireTask.depth = task.depth + 1;

        if (targetStatuses.includes(requireTask.status)) {
          const lineStr = buildLineModeTree(requireTask, dateFormat);
          utils.printLine(lineStr, requireTask.status);
        }
      }
    }
  }
}
