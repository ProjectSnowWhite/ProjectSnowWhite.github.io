# Project Snow White

4D Gaussian Splatting video in your browser: real-time volumetric video, streamed as a single video file and drawn live, so the viewpoint is yours to choose.

**Live: https://projectsnowwhite.github.io/**

This repository is the project page: one static page with a live player, the stream's overall numbers and how it stands against the published state of the art (a graph, with the table of the papers' numbers below it).

The page opens with a tour: shots that were never filmed (wide, a dolly, a crane, a pan, a sweep around the flame with time standing still, a push-in in slow motion),
drawn live. The tour is a small file inside the stream (`tour/flame-salmon.tour.json` is its source) and moves the camera only: the video plays on by itself and has its own button; a drag hands the camera to whoever is watching.

## Look at it

Any static web server on this folder, for example

    python -m http.server 8080 --bind 127.0.0.1

then http://127.0.0.1:8080/ in a current Chrome or Edge on Windows or macOS (WebGPU or WebGL 2, hardware HEVC decoding). Where the live scene cannot
start, the page shows a still and says why.

## Credits

* The scene is "flame salmon" from the [Neural 3D Video dataset](https://github.com/facebookresearch/Neural_3D_Video) (Li et al., "Neural 3D Video Synthesis from
  Multi-view Video", CVPR 2022), licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/); it is reconstructed here as a 4D Gaussian splatting
  stream and shown non-commercially, as a research demonstration (`NOTICE.md`).
* The player draws with Babylon.js, Apache License 2.0 (`licenses/BABYLON-LICENSE.md`, `licenses/BABYLON-NOTICE.md`).
