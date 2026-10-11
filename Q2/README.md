# Q2 - WebXR with Babylon.js: spawn and manipulate a 3D model

`index.html` is the complete app and implements all of Q2.b-f. The model from Q2.a, with its source and license,
is in `Q2a_model/`.

| Subpart | Control | What it does |
| --- | --- | --- |
| b | Right controller ray, right trigger | Hit test from the controller ray (a green ring marks the hit); the trigger spawns the model there |
| c | Right thumbstick | Moves the most recently spawned model on the horizontal plane |
| d | Left thumbstick (left/right) | Rotates the most recent model about the vertical y-axis |
| e | Right **A** / **B** | Scales the most recent model up / down, uniformly on all 3 axes (factor 1.1 per press) |
| f | Left **X** | Restores the most recent model's spawn position, rotation and scale |

## How it works

- **Hit test (b).** The session asks for the `hit-test` feature. When the right controller connects, the app calls
  `session.requestHitTestSource({ space: controller.inputSource.targetRaySpace })`, so the hit test follows the
  controller ray rather than the head (same approach as the class example `#C35KZV#1`, Lec 9).
  On every XR frame, `frame.getHitTestResults()` gives the pose where the ray meets a real surface. The app converts
  that pose from WebXR's right-handed frame to Babylon's left-handed frame, and a green ring (the reticle) shows the spot.
- **Spawning (b).** The model is loaded once into an `AssetContainer`. Each right-trigger press (one spawn per press,
  using `changes.pressed`) calls `instantiateModelsToScene()` to make an independent copy. Each copy hangs under its own
  `root` node, which is the node that gets moved, rotated and scaled. A fixed child node resizes the model to 0.3 m and
  sets its base on the surface. New models stand upright and turn to face the user.
- **"Most recent" model.** A `current` variable always points at the newest `root`. Every control checks for
  `current === null` first, so pressing buttons or moving sticks before anything has spawned does nothing and raises no error.
- **Move and rotate (c, d).** The thumbsticks are read every frame in `scene.onBeforeRenderObservable`, with a 0.15
  deadzone. Speed is scaled by frame time, so it does not depend on frame rate. Movement follows the direction you are
  looking, flattened onto the XZ plane: pushing the stick forward moves the model away from you, and its height
  (y) never changes. Rotation changes only `rotation.y`.
- **Scale (e).** `A` and `B` multiply `scaling` by 1.1 or 1/1.1 on all three axes, clamped to [0.05, 20].
- **Reset (f).** At spawn time, each model saves its own position, rotation and scaling in `root.metadata`.
  `X` copies those values back onto `current` only, so older models stay where they are.

## Running it

WebXR needs HTTPS. Serve the **`Q2/` folder**, because `index.html` loads the model from `Q2a_model/`:

- **Servez** (Lec 8): choose the `Q2` folder, turn on HTTPS, start it, then open `https://<your-ip>:<port>/` in the
  Quest browser and press the AR button.
- **Babylon Playground**: the same code is saved at https://playground.babylonjs.com/#A0H76G. It loads the model from
  a public copy (https://github.com/VivekRnx/ar-models), since the Playground cannot read this private repo.

On the Quest, hit testing only works after the room has been scanned (Settings > Physical space > Space setup).
In the desktop WebXR emulator, which may not support hit testing, the app falls back to intersecting the controller ray
with the virtual floor (y = 0) so the controls can still be tried.
