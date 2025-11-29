# Corrected Universal MFE Architecture Diagram

```text
 UNIVERSAL MFE PLATFORM
 ├── Shared Utils (Nx lib)
 │     - Pure JS/TS logic
 │     - Platform-agnostic
 │
 ├── Web Shell (Rspack Host)
 │     - Uses ModuleFederationPlugin
 │     - Loads: hello_remote (web)
 │     - RN code rendered via RNW
 │
 ├── Web Remote (Rspack Remote)
 │     - Exposes: ./HelloRemote
 │     - Served at http://localhost:9003/remoteEntry.js
 │
 ├── Mobile Shell (Re.Pack Host)
 │     - Uses ModuleFederationPluginV2
 │     - Requires ScriptManager TurboModule
 │     - Loads: hello_remote (native)
 │
 └── Mobile Remote (Re.Pack Remote)
       - Exposes: ./HelloRemote
       - Built for RN (Hermes/JSC)
       - Served at http://10.0.2.2:9004/remoteEntry.js (Android)

 KEY FLOWS:
 - Web Shell <--> Web Remote via Rspack MF
 - Mobile Shell <--> Mobile Remote via Re.Pack MFv2 + ScriptManager
 - Shared Utils imported by all MFEs
```
