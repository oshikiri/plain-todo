plain-todo
=====

![GitHub Workflows Status](https://github.com/oshikiri/plain-todo/workflows/test/badge.svg)

A CLI todolist tool based on YAML file

```sh
$ cat test/fixtures/readme-example.todo.yml
title: Example tasks

tasks:
  - name: task1
    end: 2020-08-10
    children:
      - name: subtask1
        children:
          - name: subsubtask1
            memo: |
              some descriptions
          - name: subsubtask2
            end: 2020-08-01
            status: doing
      - name: subtask2
        end: 2020-07-25
        status: cancelled
      - name: subtask3
        end: 2020-07-20
        status: done

$ todo print test/fixtures/readme-example.todo.yml
08/10     task1
08/10         subtask1
08/10  -          subsubtask1
08/01  *          subsubtask2

$ todo print test/fixtures/readme-example.todo.yml --mode date
08/01  *  /task1/subtask1/subsubtask2
08/10     /task1/subtask1/subsubtask1
```

## Setting for VS Code

You can validate and complete at `*.todo.yml` using [redhat.vscode-yaml](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml).

```json
// .vscode/settings.json

{
  "yaml.schemas": {
    "https://oshikiri.github.io/plain-todo/schema.json": [
        "*.todo.yml",
        "*.todo.yaml"
    ]
  }
}
```

## Development
### Install dependencies
```sh
npm install
```

### Build
```sh
npm run build
```

### Install `todo` command to global environment
```sh
npm install -g .
```
