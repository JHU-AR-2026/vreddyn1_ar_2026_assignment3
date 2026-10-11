# Q2.a - 3D model

**Model:** "The Majestic Sword of Golden Blood (Game-Ready)" (`majestic_sword.glb`, binary glTF 2.0, 5.8 MB, one static mesh, no animations)

**Source:** Sketchfab, by nodgerty
https://sketchfab.com/3d-models/the-majestic-sword-of-golden-blood-game-ready-d30c32d54aca476a8e817345580c6aaa

**License (free to use with attribution):** CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)

> "The Majestic Sword of Golden Blood (Game-Ready)" by nodgerty (https://sketchfab.com/nodgerty), licensed under CC BY 4.0. Modified as described below.

**Changes from the Sketchfab download** (`the_majestic_sword_of_golden_blood_game-ready.glb`, 62 MB), made with glTF-Transform:

| Change | Why |
| --- | --- |
| Root node (`Sketchfab_model`) rotation reset to the standard Z-up to Y-up rotation (-90° about X) | The upload carried an extra ~46° display tilt, so the sword spawned leaning over. It now stands upright, tip down, with the flat of the blade facing +Z |
| Four 4096×4096 PNG textures resized to 2048×2048 and stored as WebP (`EXT_texture_webp`) | 62 MB down to 5.8 MB, so it loads quickly in the Quest browser and needs about a quarter of the GPU memory |
| Material `alphaMode` changed from BLEND to MASK (cutoff 0.5) | With BLEND, the ribbon behind the blade showed through it (no depth sorting inside one mesh). MASK keeps depth correct and still cuts out the ribbon's frayed edges |

Geometry, UVs and the rest of the material are unchanged.

Babylon.js loads `.glb` files natively through `babylonjs.loaders` (`SceneLoader.LoadAssetContainerAsync`).
The model has no animation clips, so the app's animation code (it plays the first clip if a model has one) does nothing here.
