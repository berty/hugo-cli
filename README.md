# `berty-cli` NPM package



[![CI](https://github.com/berty/berty-cli/actions/workflows/CI.yml/badge.svg)](https://github.com/berty/berty-cli/actions/workflows/CI.yml)

A simple Node wrapper around [berty](https://berty.tech). It fetches the right berty executable before piping all provided command line arguments to it.


## Usage

```console
$ node_modules/.bin/berty -h
INFO berty not found. Attempting to fetch it...
INFO fetched berty v2.364.5
INFO extracting archive...
INFO berty available, let's go!

USAGE
  berty [global flags] <subcommand> [flags] [args...]

SUBCOMMANDS
  daemon        start a full Berty instance (Berty Protocol + Berty Messenger)
...
```

### Download specific berty version

If you want to download a specific berty version, you can set `BERTY_VERSION` env before you run the command.

```bash
$ BERTY_VERSION=2.364.5 npx berty-cli version
```


## Integrations

Add to your build scripts in `package.json` to build you site from NodeJS:

```json
  ...
  "scripts": {
    "daemon": "berty daemon"
  },
  "dependencies": {
    "berty-cli": "*"
  },
  ...
```

Execute directly via [`npx`](https://www.npmjs.com/package/npx):

```bash
npx berty-cli daemon
```


## License

_based on https://github.com/nikku/hugo-cli by Nico Rehwaldt_

MIT
