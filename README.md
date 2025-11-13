
<p align="center">
  <img src="https://raw.githubusercontent.com/kucherenko/jscpd/master/assets/logo.svg?sanitize=true">
</p>

## js-cp-d_ai

> AI-enhanced copy/paste detector for programming source code, supports 150+ formats including enhanced Flutter/Dart support.

### About This Fork

This is an AI-enhanced fork of [jscpd](https://github.com/kucherenko/jscpd) by Andrey Kucherenko.

**Original Repository:** [kucherenko/jscpd](https://github.com/kucherenko/jscpd)

### Why This Fork?

We created **js-cp-d_ai** to modernize jscpd with:

- **Flutter.art Integration**: Enhanced support for Flutter and Dart codebases, making it ideal for Flutter.art projects
- **AI-Ready Architecture**: Integration with onama for AI-powered reasoning and intelligent code analysis
- **Modern Tooling**: Updated dependencies and improved compatibility with modern development workflows
- **Enhanced Detection**: Improved duplicate detection capabilities specifically optimized for Dart/Flutter patterns

### Key Changes from Original jscpd

- Enhanced Dart/Flutter language support and pattern recognition
- AI reasoning capabilities via onama integration
- Optimized for Flutter.art development workflows
- Modernized dependency management
- Improved performance for large Flutter codebases

### Original jscpd Badges

![stand with Ukraine](https://badgen.net/badge/support/UKRAINE/?color=0057B8&labelColor=FFD700)

[![npm](https://img.shields.io/npm/v/jscpd.svg?style=flat-square)](https://www.npmjs.com/package/jscpd)
![jscpd](https://raw.githubusercontent.com/kucherenko/jscpd/master/assets/jscpd-badge.svg?sanitize=true)
[![license](https://img.shields.io/github/license/kucherenko/jscpd.svg?style=flat-square)](https://github.com/kucherenko/jscpd/blob/master/LICENSE)

---

Copy/paste is a common technical debt on a lot of projects. The jscpd gives the ability to find duplicated blocks implemented on more than 150 programming languages and digital formats of documents.
The jscpd tool implements [Rabin-Karp](https://en.wikipedia.org/wiki/Rabin%E2%80%93Karp_algorithm) algorithm for searching duplications.

## Packages of jscpd

| name                 | version  |  description  |
|----------------------|----------|---------------|
| [jscpd](apps/jscpd) | [![npm](https://img.shields.io/npm/v/jscpd.svg?style=flat-square)](https://www.npmjs.com/package/jscpd) | main package for jscpd (cli and API for detections included) |
| [@jscpd/core](packages/core) | [![npm](https://img.shields.io/npm/v/@jscpd/core.svg?style=flat-square)](https://www.npmjs.com/package/@jscpd/core) |core detection algorithm, can be used for detect duplication in different environments, one dependency to eventemitter3 |
| [@jscpd/finder](packages/finder) | [![npm](https://img.shields.io/npm/v/@jscpd/finder.svg?style=flat-square)](https://www.npmjs.com/package/@jscpd/finder) | detector of duplication in files  |
| [@jscpd/tokenizer](packages/tokenizer) | [![npm](https://img.shields.io/npm/v/@jscpd/tokenizer.svg?style=flat-square)](https://www.npmjs.com/package/@jscpd/tokenizer) | tool for tokenize programming source code |
| [@jscpd/leveldb-store](packages/leveldb-store) | [![npm](https://img.shields.io/npm/v/@jscpd/leveldb-store.svg?style=flat-square)](https://www.npmjs.com/package/@jscpd/leveldb-store) | LevelDB store, used for big repositories, slower than default store |
| [@jscpd/html-reporter](packages/html-reporter) | [![npm](https://img.shields.io/npm/v/@jscpd/html-reporter.svg?style=flat-square)](https://www.npmjs.com/package/@jscpd/html-reporter) | Html reporter for jscpd |
| [@jscpd/badge-reporter](packages/badge-reporter) | [![npm](https://img.shields.io/npm/v/@jscpd/badge-reporter.svg?style=flat-square)](https://www.npmjs.com/package/@jscpd/badge-reporter) | Badge reporter for jscpd |

## Installation
```bash
$ npm install -g jscpd
```
## Usage
```bash
$ npx jscpd /path/to/source
```
or

```bash
$ jscpd /path/to/code
```
or

```bash
$ jscpd --pattern "src/**/*.js"
```
More information about cli [here](apps/jscpd).

## Programming API

For integration copy/paste detection to your application you can use programming API:

`jscpd` Promise API
```typescript
import {IClone} from '@jscpd/core';
import {jscpd} from 'jscpd';

const clones: Promise<IClone[]> = jscpd(process.argv);
```

`jscpd` async/await API
```typescript
import {IClone} from '@jscpd/core';
import {jscpd} from 'jscpd';
(async () => {
  const clones: IClone[] = await jscpd(['', '', __dirname + '/../fixtures', '-m', 'weak', '--silent']);
  console.log(clones);
})();

```

`detectClones` API
```typescript
import {detectClones} from "jscpd";

(async () => {
  const clones = await detectClones({
    path: [
      __dirname + '/../fixtures'
    ],
    silent: true
  });
  console.log(clones);
})()
```

`detectClones` with persist store
```typescript
import {detectClones} from "jscpd";
import {IMapFrame, MemoryStore} from "@jscpd/core";

(async () => {
  const store = new MemoryStore<IMapFrame>();

  await detectClones({
    path: [
      __dirname + '/../fixtures'
    ],
  }, store);

  await detectClones({
    path: [
      __dirname + '/../fixtures'
    ],
    silent: true
  }, store);
})()
```

In case of deep customisation of detection process you can build your own tool with `@jscpd/core`, `@jscpd/finder` and `@jscpd/tokenizer`.

## Start contribution

 - Fork the repo [moinsen-dev/jscpd2025](https://github.com/moinsen-dev/jscpd2025)
 - Clone forked version (`git clone https://github.com/{your-id}/jscpd2025`)
 - Install dependencies (`pnpm install`)
 - Run the project in dev mode: `pnpm dev` (watch changes and rebuild the packages)
 - Add your changes
 - Add tests and check it with `pnpm test`
 - Build your project `pnpm build`
 - Create PR

For contributions to the original jscpd project, please visit [kucherenko/jscpd](https://github.com/kucherenko/jscpd/).

## Who uses jscpd
 - [GitHub Super Linter](https://github.com/github/super-linter) is combination of multiple linters to install as a GitHub Action
 - [Code-Inspector](https://www.code-inspector.com/) is a code analysis and technical debt management service.
 - [Mega-Linter](https://nvuillam.github.io/mega-linter/) is a 100% open-source linters aggregator for CI (GitHub Action & other CI tools) or to run locally
 - [Codacy](http://docs.codacy.com/getting-started/supported-languages-and-tools/) automatically analyzes your source code and identifies issues as you go, helping you develop software more efficiently with fewer issues down the line.
 - [Natural](https://github.com/NaturalNode/natural) is a general natural language facility for nodejs. It offers a broad range of functionalities for natural language processing.


## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/jscpd#backer)]

<a href="https://opencollective.com/jscpd#backers" target="_blank"><img src="https://opencollective.com/jscpd/backers.svg?width=890"></a>
## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/jscpd#sponsor)]

<a href="https://opencollective.com/jscpd/sponsor/0/website" target="_blank"><img src="https://opencollective.com/jscpd/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/jscpd/sponsor/1/website" target="_blank"><img src="https://opencollective.com/jscpd/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/jscpd/sponsor/2/website" target="_blank"><img src="https://opencollective.com/jscpd/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/jscpd/sponsor/3/website" target="_blank"><img src="https://opencollective.com/jscpd/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/jscpd/sponsor/4/website" target="_blank"><img src="https://opencollective.com/jscpd/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/jscpd/sponsor/5/website" target="_blank"><img src="https://opencollective.com/jscpd/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/jscpd/sponsor/6/website" target="_blank"><img src="https://opencollective.com/jscpd/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/jscpd/sponsor/7/website" target="_blank"><img src="https://opencollective.com/jscpd/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/jscpd/sponsor/8/website" target="_blank"><img src="https://opencollective.com/jscpd/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/jscpd/sponsor/9/website" target="_blank"><img src="https://opencollective.com/jscpd/sponsor/9/avatar.svg"></a>

![ga tracker](https://www.google-analytics.com/collect?v=1&a=257770996&t=pageview&dl=https%3A%2F%2Fgithub.com%2Fkucherenko%2Fjscpd&ul=en-us&de=UTF-8&cid=978224512.1377738459&tid=UA-730549-17&z=887657232 "ga tracker")

## License

[MIT](LICENSE) © Andrey Kucherenko
