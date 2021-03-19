# EchoVR Session Panel
This tool is for PC edition EchoVR. By launching this tool, you can view the score of the current match and the stats of the players of the team. It is a green background because it is intended to be synthesized with OBS chroma key.

![sample.png](./sample.png)

# Usage
Enable API in PC edition EchoVR.
Get `echovr-session-panel-win32-x64.zip` from [Releases tab](https://github.com/sifue/echovr-session-panel/releases) and Unzip.
Execute `echovr-session-panel.exe`.

# API Document
Enable API in EchoVR.
See [https://github.com/Ajedi32/echovr_api_docs](https://github.com/Ajedi32/echovr_api_docs).

### Dev
Install Node.js (Upper v14.16.0). As follows.

```
npm i
npm start
```

### Build (Windows only)

```
npm install --save-dev @electron-forge/cli
npx electron-forge import
npm run make
```

Use `out\echovr-session-panel-win32-x64\echovr-session-panel.exe`

# LICENSE
MIT LICENSE
