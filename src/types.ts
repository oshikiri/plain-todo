import { activeStatuses } from "./constants/statuses";

export class Task {
  name: string;
  alias: string;
  start: string;
  end: string;
  status: string;
  memo: string;
  import: string;
  children: Task[];
  requires: string[];

  absolutePath: string;
  depth: number;
  isDefaultStatus: boolean;

  constructor(task: Task) {
    this.name = task.name;
    this.alias = task.alias;
    this.start = task.start;
    this.end = task.end;
    this.status = task.status;
    this.memo = task.memo;
    this.import = task.import;
    this.children = task.children || [];
    this.requires = task.requires;
  }

  hasChildren(): boolean {
    return this.children !== void 0 && this.children.length > 0;
  }

  hasActiveChildren(): boolean {
    if (this.children === void 0) {
      return false;
    }

    return this.children
      .map((child) => activeStatuses.includes(child.status))
      .reduce((acc, cur) => acc || cur, false);
  }
}

export class Arguments {
  file: string;
  include: string[];
  memo: boolean;
  watch: boolean;
  stats: boolean;
  subtree: string;
  sort: string;
}

export class TodoYaml {
  title: string;
  tasks: Task[];
  configs: {
    "date-format": string;
    "max-length-task-name": number;
  };
}

export class Configs {
  watch: boolean;
  showStats: boolean;
}
