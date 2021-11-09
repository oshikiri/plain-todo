import * as fs from "fs";

import dayjs = require("dayjs");
import * as marked from "marked";

marked.setOptions({
  renderer: new marked.Renderer(),
  pedantic: false,
  breaks: true,
  sanitize: false,
  smartypants: false,
  xhtml: false,
});

import * as io from "../io";
import { Arguments } from "../types";
import * as utils from "../utils";

export function mainHtml(argv: Arguments) {
  const yamlPath = argv.file;
  if (!io.fileExists(yamlPath)) {
    console.log(`Specified file does not exist: ${yamlPath}`);
    return;
  }
  const yml = io.loadYaml(yamlPath);

  const maxLengthTaskName = 100;
  let tasks = utils.extractSubtree(yml.tasks, argv.subtree);
  tasks = utils.fillParentsInformations(
    tasks,
    "",
    [undefined],
    [undefined],
    maxLengthTaskName,
    yamlPath
  );

  tasks = utils
    .flattenTasks(tasks)
    .filter((t) => t.children.length == 0 && t.status != "todo")
    .sort((t1, t2) => dayjs(t1.end).diff(dayjs(t2.end)));

  // TODO: use DOM library
  console.log(`
    <head>
      <meta charset="UTF-8">
    </head>
    <body>
  `);
  console.log(`
    <style>
        ${fs.readFileSync(__dirname + "/style.css", "utf8")}
    </style>
  `);
  console.log(`<div class="tasks">`);
  for (const task of tasks) {
    console.log(`<div class="task">`);
    console.log(`<div class="task-name">${task.absolutePath}</div>`);
    const start = task.start ? dayjs(task.start).format("YYYY-MM-DD") : "";
    const end = task.end ? dayjs(task.end).format("YYYY-MM-DD") : "";
    console.log(`<div class="task-dates">
      <span class="task-date">${start}</span> ― <span class="task-date">${end}</span>
      <span class="task-status">${task.status}</span>
    </div>`);
    if (task.memo) {
      console.log(marked(task.memo));
    }
    console.log("</div>");
  }
  console.log("</div>");
  console.log("</body>");
}
