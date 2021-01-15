plain-todo: A CLI todolist tool based on YAML file
=====

[![GitHub Workflows Status](https://github.com/oshikiri/plain-todo/workflows/test/badge.svg)](https://github.com/oshikiri/plain-todo/actions?query=workflow%3Atest) [![GitHub package](https://img.shields.io/github/package-json/v/oshikiri/plain-todo)](https://github.com/oshikiri/plain-todo/packages/575365/)


## Example
```yaml
# test/fixtures/readme-example.todo.yml

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
```
```sh
$ todo print test/fixtures/readme-example.todo.yml
0810     task1
0810         subtask1
0810  -          subsubtask1
0801  *          subsubtask2

$ todo print test/fixtures/readme-example.todo.yml --sort end
     0801  *  /task1/subtask1/subsubtask2
     0810     /task1/subtask1/subsubtask1
```

## Setting for VS Code

You can run schema validation and auto-completion using [redhat.vscode-yaml](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml).

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
