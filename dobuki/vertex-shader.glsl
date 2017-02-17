varying vec2 vUv;
attribute float tex;
attribute float light;
attribute vec3 spot;
attribute vec4 quaternion;
varying float vTex;
varying float vLight;

void main()  {
    vTex = tex;
    vUv = uv;
    vLight = light;

    vec3 newPosition = rotateVectorByQuaternion( position, quaternion ) + spot;
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}
