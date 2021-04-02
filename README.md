# Cubed Agent

This repository contains the source code for the Cubed Agent. A small app that is used to collect server metrics. Please note that to use this you'll need to first sign up for an account at https://cubedserver.com

## Install

*macOS 10.10+, Linux, and Windows 7+ are supported (64-bit only).*

**macOS**

[**Download**](https://github.com/cubedserver/agent/releases/latest) the `.dmg` file.

**Linux**

[**Download**](https://github.com/cubedserver/agent/releases/latest) the `.AppImage` or `.deb` file.

*The AppImage needs to be [made executable](http://discourse.appimage.org/t/how-to-make-an-appimage-executable/80) after download.*

**Windows**

[**Download**](https://github.com/cubedserver/agent/releases/latest) the `.exe` file.

---

## Dev

Built with [Electron](https://electronjs.org).

### Run

```
$ npm install
$ npm start
```

### Build

```
$ npm run dist
```

### Publish

```
$ npm run release
```

After Travis finishes building your app, open the release draft it created and click "Publish".
