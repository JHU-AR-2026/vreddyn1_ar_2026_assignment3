var createScene = function () {
    // Base scene (as given)
    var scene = new BABYLON.Scene(engine);

    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
    ground.isVisible = false;

    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
    sphere.position.y = 1;
    sphere.position.x = 1;

    var cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {height: 2, diameter: 1}, scene);
    cylinder.position.y = 1;
    cylinder.position.x = -1;
    

    // Vertex Shader
    BABYLON.Effect.ShadersStore["customVertexShader"] = `
    precision highp float;

    /*
    Vertex shader for Phong-style lighting
    - Takes OBJECT-space attributes
    - Produces WORLD-space position/normal for lighting
    - Produces CLIP-space position for rasterization
    */

    // INPUTS (attributes: OBJECT space)
    attribute vec3 position;  // vertex position
    attribute vec3 normal;    // vertex normal

    // INPUTS (uniforms)
    uniform mat4 world;                // object -> world
    uniform mat4 worldViewProjection;  // object -> clip (projection * view * world)

    // OUTPUTS (varyings: WORLD space)
    varying vec3 vPosW;     // world-space position
    varying vec3 vNormalW;  // world-space normal

    void main() {
        // World-space position
        vec4 pw = world * vec4(position, 1.0);
        vPosW = pw.xyz;

        // World-space normal
        vNormalW = normalize(mat3(world) * normal);

        // Clip-space position
        gl_Position = worldViewProjection * vec4(position, 1.0);
    }`;


    // FRAGMENT SHADER
    BABYLON.Effect.ShadersStore["customFragmentShader"] = `
    precision highp float;

    // INPUTS:
    // Interpolated per-fragment data coming from the vertex shader
    varying vec3 vPosW;        // World-space position of the current fragment
    varying vec3 vNormalW;     // World-space geometric normal

    // Material parameters
    uniform float uMatAmbient;   // Scalar ambient factor in [0, 1]
    uniform vec3  uMatDiffuse;   // Diffuse color (RGB)
    uniform vec3  uMatSpecular;  // Specular color (RGB)
    uniform float uMatShininess; // Phong exponent. higher = tighter specular highlight (e.g., 16, 32, 64)

    // Camera
    uniform vec3 uCameraPos;     // Camera position in world space used to form view vector V

    // Point light 1 (emits from a position, with distance falloff)
    uniform vec3 uPointLightColor; // Linear RGB intensity/color of the point light
    uniform vec3 uPointLightPos;   // World-space position of the point light

    // Point light 2
    uniform vec3 uPointLight2Color; // Linear RGB intensity/color of the second point light
    uniform vec3 uPointLight2Pos;   // World-space position of the second point light

    
    vec3 shadePointLight(
        vec3 lColor, vec3 lPos, vec3 N, vec3 V, vec3 kd, vec3 ks, float shin)
    {
        /*
        Inputs:
            lColor : light color/intensity (RGB)
            lPos   : light position in world space
            N, V   : unit normal and view vectors (world space)
            kd, ks : material colors
            shin   : Phong exponent
        Returns:
            RGB contribution from this point light, with distance attenuation
        */

        // Light vector: from the surface point toward the light (world space)
        vec3  toLight = lPos - vPosW;
        float d       = length(toLight);
        vec3  L       = toLight / d;

        // Distance attenuation: 1 / (kc + kl*d + kq*d^2)
        const float kc = 1.0;
        const float kl = 0.09;
        const float kq = 0.032;
        float atten = 1.0 / (kc + kl * d + kq * d * d);

        // Diffuse (Lambert)
        float NdotL   = max(dot(N, L), 0.0);
        vec3  diffuse = kd * NdotL;

        // Specular (Phong), only on lit faces
        vec3 specular = vec3(0.0);
        if (NdotL > 0.0) {
            vec3  R     = reflect(-L, N);
            float RdotV = max(dot(R, V), 0.0);
            specular    = ks * pow(RdotV, shin);
        }

        return atten * lColor * (diffuse + specular);
    }

    void main()
    {
        // Ensure unit-length vectors
        // vNormalW was linearly interpolated across the triangle, so renormalizing is required.
        vec3 N = normalize(vNormalW);

        // View vector points from the surface toward the camera in world space
        vec3 V = normalize(uCameraPos - vPosW);

        // Start with a simple constant ambient term (not physically based, but easy to understand)
        // Using material diffuse color for the ambient tint is a common convention in basic Phong
        vec3 color = uMatAmbient * uMatDiffuse;

        // Add point light 1 contribution
        color += shadePointLight(
            uPointLightColor,
            uPointLightPos,
            N, V,
            uMatDiffuse, uMatSpecular, uMatShininess
        );

        // Add point light 2 contribution (lights are additive)
        color += shadePointLight(
            uPointLight2Color,
            uPointLight2Pos,
            N, V,
            uMatDiffuse, uMatSpecular, uMatShininess
        );

        // Final fragment color
        gl_FragColor = vec4(color, 1.0);
    }`;


    var shaderMat = new BABYLON.ShaderMaterial("custom", scene, "custom", {
        attributes: ["position", "normal"],
        uniforms: [
            "world", "worldViewProjection",
            "uCameraPos",
            "uMatAmbient", "uMatDiffuse", "uMatSpecular", "uMatShininess",
            "uPointLightColor", "uPointLightPos",
            "uPointLight2Color", "uPointLight2Pos"
        ]
    });

    // ADJUST LIGHT AND MATERIAL PROPERTIES HERE
    // Material
    shaderMat.setFloat("uMatAmbient", 0.25)
    shaderMat.setColor3("uMatDiffuse",  new BABYLON.Color3(0.8, 0.2, 0.2));
    shaderMat.setColor3("uMatSpecular", new BABYLON.Color3(1, 1, 1));
    shaderMat.setFloat("uMatShininess", 32.0);

    // Point Light 1 (warm, low on the left)
    shaderMat.setColor3("uPointLightColor", new BABYLON.Color3(1, 0, 0));
    shaderMat.setVector3("uPointLightPos", new BABYLON.Vector3(-4.0, 1.5, -2.0));

    // Point Light 2 (cool blue, high on the right)
    shaderMat.setColor3("uPointLight2Color", new BABYLON.Color3(0.11, 0.33, 0.9, 0.92));
    shaderMat.setVector3("uPointLight2Pos", new BABYLON.Vector3(3.0, 3.5, -3.0));

    // Update camera position every frame
    scene.onBeforeRenderObservable.add(function () {
        shaderMat.setVector3("uCameraPos", camera.position);
    });

    sphere.material = shaderMat;
    cylinder.material = shaderMat;

    return scene;
};

export default createScene