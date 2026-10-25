# MediaPipe Tasks Vision and the face landmarker model

Fetched by `tools\fetch_mediapipe.ps1`, stored byte for byte, used only by `web/head-tracker.js` (the magic window).

| File | From | Licence |
|---|---|---|
| `vision_bundle.mjs`, `wasm/vision_wasm_internal.js`, `wasm/vision_wasm_internal.wasm`, `tasks-vision.package.json` | npm package `@mediapipe/tasks-vision` 0.10.35 (Google LLC, https://github.com/google-ai-edge/mediapipe) | Apache-2.0 |
| `face_landmarker.task` | https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task (Google's face landmarker: face detector, face mesh with irises, blendshapes) | Apache-2.0 |

The npm package carries no licence file of its own; the text of the Apache License 2.0 is the one in `../BABYLON-LICENSE.md`
(https://www.apache.org/licenses/LICENSE-2.0). Not vendored: the builds without SIMD and the `_module` builds (`head-tracker.js` names the files it
loads, so nothing probes for them).
