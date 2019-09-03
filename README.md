# Spryker Frontend Sniffer

This software has been specifically design for Spryker projects and it performs architecture checks on either core and project level code.

## Implementation details
The application is heavily based Typescript (especially generics) and RxJs. Please get familiar with this
technologies to better understand how the sniffer works.

- [Typescript generics](https://www.typescriptlang.org/docs/handbook/generics.html)
- [RxJs](https://rxjs.dev/)

## Setup
**Note**: prefer `yarn` over `npm` when working on this project.

```bash
1. yarn install
2. yarn build
# Turn on with watcher
3. yarn watch
4. yarn sniff - to run sniffer inside your project (Need to set up current path inside bin/frontend-sniffer or use "-p [absolute project path]" option)
```

## Configuration
Collector and sniffer use 2 different configurations:

- [collector](https://github.com/spryker-sdk/frontend-sniffer/blob/master/config/collector.js)
- [sniffer](https://github.com/spryker-sdk/frontend-sniffer/blob/master/config/sniffer.js)

Each option will be evaluated by the tool, and if no configuration is found, the default one will be used.

## Terminal usage
With the sniffer installed as global tool, you can type:

```bash
frontend-sniffer # will execute the sniffer on the current folder

# running the help
frontend-sniffer -h
Usage: frontend-sniffer [options]

Options:
  -v, --version                     output the version number
  -p, --path [path]                 set the path for the collector to run (default: "/your/current/folder")
  -c, --config [config]             load a specific configuration file (default: "")
  -x, --exclude-sniffer             run only the collector, excluding the sniffer
  -o, --only [n]                    collect only the first [n] elements for each stream (default: null)
  -d, --debug-mode                  run in debug mode (verbose)
  -h, --help                        output usage information
  -l, --level-restriction [level]   collect core or project level only (default: null)

Example:
Run sniffer for 3 components core level only for the next path '/Users/userName/Projects/suite-nonsplit/project' in debug mode
yarn sniff -p /Users/userName/Projects/suite-nonsplit/project -o 3 -l core -d
```

## Programmatic usage (API)
With the sniffer installed a local dependency in your project, you can use
the public API to inteact with the sniffer. You can access them:

```ts
// commonjs
const { environment, collect, sniff, Rule } = require('@spryker/frontend-sniffer/api');

// es6
import { environment, collect, sniff, Rule }  from '@spryker/frontend-sniffer/api';
```

**Note**: configuration files are cheked and used even in programmatic mode.

#### API: `environment`
Use `environment` to set the evironmental variables for the tool.
Remember to set the variables before running the commands `collect` and `sniff`.

The environemnt is defined by the following interface:

```ts
interface IEnvironment {
    // defines the target path where the collector will look for
    path: string
    // defines the path where the tool will look for a configuration file
    configPath: string,
    // excludes the sniffer from the execution (only if you use `sniff` command)
    excludeSniffer: boolean
    // collects only [n] element
    only: number
    // enable debug mode (verbose)
    debugMode: boolean
}
```

You can set the environment using the `update` method.
The method will return a `true` if the environemnt is setup correctly and the speficied paths exist on the syste. It will return `false` otherwise.

```js
import { environment }  from '@spryker/frontend-sniffer/api';

// you can update part or the whole environemnt
const isValid = environment.update({
    path: options.projectPath,
    only: options.only
});

if (!isValid) {
    // your code (error and early return?)
}
```

#### API: `collect`
Use function `collect` to run the collector. The function is `async` and will return a promis of the following object:

```ts
export interface ICollectorOutput {
    applicationFiles: IApplicationFile[]
    styleFiles: IStyleFile[]
    components: IParsedComponent[]
}
```

Usage:

```js
import { collect }  from '@spryker/frontend-sniffer/api';

// set the environment first!
const isValid = environment.update({
    path: options.projectPath,
});

if (!isValid) {
    // your code
}

collect()
    .then(output => {
        //your code
    })
    .catch(err => {
        //your code
    })
```

#### API: `sniff`
Use function `sniff` to run the sniffer on the collected information. The function is `async` and will return a promis of the following object:

```ts
export interface IEvaluation {
    totalTestsCount: number
    validTestsCount: number
    failedTestsCount: number
    isPassed: boolean
}
```

Usage:

```js
import { sniff }  from '@spryker/frontend-sniffer/api';

// set the environment first!
const isValid = environment.update({
    path: options.projectPath,
});

if (!isValid) {
    // your code
}

sniff()
    .then(evaluation => {
        //your code
    })
    .catch(err => {
        //your code
    })
```

#### API: `Rule`
Use class `Rule` to define a sniffer rule.
The rule name is used to enable/disable the rule in the sniffer configuration.
The **rule test fails if there is at least one error message in the outcome**.

```js
const { Rule } = require('@spryker/frontend-sniffer/api');

module.exports = class extends Rule {
    getName() {
        return 'rule-name';
    }

    test(data) {
        // perform your checks

        // add a log message (the test will not be affected)
        this.outcome.addLog(`message`);

        // add a warning message (the test will pass with warnings)
        this.outcome.addWarning(`message`);

        // add a error message (the test will fail)
        this.outcome.addLog(`message`);
    }
}
```

## Disable sniffer
To disabling sniffer use comment field inside appropriate component file:
```bash
/* fe-sniffer:disabled all */ - disable all rules
/* fe-sniffer:disabled name-of-the-rule */ - disable appropriate rule (ex. /* fe-sniffer:disabled mandatory-z-index-variable correct-scss-component-structure */)
```

## Development roadmap
This is the current roadmap of feature that will be progressively enabled before v1 goes
live. Some of them are in current development.

- [x] Core components collector
- [x] Core global application files collector
- [x] Core global styles collector
- [x] Sniffer engine
- [x] Sniffer rules implementation
- [ ] Sniffer full ruleset
- [x] Travis integration
- [ ] Components previews
- [ ] Styles previews
- [x] Project components collector
- [x] Project global application files collector
- [x] Project global styles collector
