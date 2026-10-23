# Assignment 3 — `vreddyn1`

**Author / attribution:** `vreddyn1`

This repository contains solutions and demos for Assignment 3:

- **Q2 — WebXR augmented reality:** `Q2/index.html` loads the included
  `Q2/Q2a_model/majestic_sword.glb` model. In an XR session, users can place
  the model on detected surfaces and manipulate it with Meta Quest controllers.
- **Q3e — Camera projection:** `Q3e.py` builds a camera intrinsic matrix and
  OpenGL projection matrix, transforms a camera-space point to clip/NDC/pixel
  coordinates, and prints an independent pinhole-projection check.
- **Q4 — Phong lighting:** `Q4/index.html` is a browser-based Babylon.js
  scene. `Q4/Q4a/4a.js` contains the one-point-light shader version, and
  `Q4/Q4c/4c.js` contains the two-point-light version.

## Requirements

- Python 3 and NumPy, for Q3e.
- A modern browser and an internet connection, for the Babylon.js demos; the
  pages load Babylon.js from its CDN.
- For Q2 immersive AR, a WebXR-compatible headset/browser and a secure context
  (HTTPS, or `localhost` when testing on the same machine). The controller
  interactions are documented in the page.

## Run Q3e

From the repository root:

```powershell
python -m pip install numpy
python Q3e.py
```

The script accepts camera intrinsics and viewport/clipping parameters as
options. For example:

```powershell
python Q3e.py --fx 800 --fy 800 --ox 400 --oy 300 --W 800 --H 600 --near 0.2 --far 20 --point 0.3 -0.15 -6
```

Run `python Q3e.py --help` to see all available options.

## Run the browser demos

From the repository root, start a local static web server:

```powershell
python -m http.server 8000
```

Then open:

- Q2: <http://localhost:8000/Q2/>
- Q4: <http://localhost:8000/Q4/>

For Q2 on a headset, serve the repository over HTTPS from a host the headset
can reach, then open the Q2 page in its WebXR-capable browser and enter an AR
session. Desktop `localhost` testing provides the page but does not provide
immersive AR hardware.
