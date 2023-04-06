# sma-service

Service to provide a fare calculation system for Singa metro authority

## Tooling

```bash
# vscode extensions
- ESLint
- GitLens - Git supercharged
- Prettier - Code formatter
- vscode-icons
```

```bash
# vscode settings.json
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": true
},
"editor.formatOnSave": true,
```

## Development Build Setup

```bash
# dependencies
- npm
- node
- yarn
```

```bash
# install dependencies
$ yarn install

# to configure the dataset
$ vi dataset.csv

# to run the application
$ yarn dev --normal --daily

# to run the application with debug messages
$ yarn dev --debug --daily
```

## Running Unit Tests

```bash
# running the test
$ yarn test
```
