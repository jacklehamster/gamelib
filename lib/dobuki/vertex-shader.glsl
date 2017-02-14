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

//    vec4 rotation = quaternion;// vec4( 1.0, 0.0, 0.0, 0.3 );
  //  vec4 qRotation = axisAngleToQuaternion( rotation.xyz, rotation.w );
    vec4 qRotation = quaternion;
    vec3 newPosition = rotateVectorByQuaternion( position - spot, qRotation ) + spot;

    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}

/*

				vec4 rotation = vec4( 0.0, 1.0, 0.0, amplitude * length( color ) * 0.001 );
				vec4 qRotation = axisAngleToQuaternion( rotation.xyz, rotation.w );

				vec3 newPosition = rotateVectorByQuaternion( position - color, qRotation ) + color;
				vNormal = normalMatrix * rotateVectorByQuaternion( normal, qRotation );

                vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );
				vViewPosition = -mvPosition.xyz;

				gl_Position = projectionMatrix * mvPosition;
				*/