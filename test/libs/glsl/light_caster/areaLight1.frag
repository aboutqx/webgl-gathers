#define NVERTS 4

uniform vec3 color;

uniform vec3 lightColor;
uniform float lightIntensity;
uniform vec3 lightverts[ NVERTS ];	// in local space
uniform mat4 lightMatrixWorld;

varying vec3 vNormal;				// in camera space
varying vec3 vViewPosition;			// in camera space

void main() {

	vec3 normal = normalize( vNormal );

	vec4 lPosition[ NVERTS ];

	vec3 lVector[ NVERTS ];

	// stub in some ambient reflectance

	vec3 ambient = color * vec3( 0.2 );

	// direction vectors from point to area light corners

	for( int i = 0; i < NVERTS; i ++ ) {

		lPosition[ i ] = viewMatrix * lightMatrixWorld * vec4( lightverts[ i ], 1.0 ); // in camera space

		lVector[ i ] = normalize( lPosition[ i ].xyz - vViewPosition.xyz ); // dir from vertex to areaLight

	}

	// bail if the point is on the wrong side of the light... there must be a better way...

	float tmp = dot( lVector[ 0 ], cross( ( lPosition[ 2 ] - lPosition[ 0 ] ).xyz, ( lPosition[ 1 ] - lPosition[ 0 ] ).xyz ) );

	if ( tmp > 0.0 ) {

		gl_FragColor = vec4( ambient, 1.0 );
		return;

	}

	// vector irradiance at point

	vec3 lightVec = vec3( 0.0 );

	for( int i = 0; i < NVERTS; i ++ ) {

		vec3 v0 = lVector[ i ];
		vec3 v1 = lVector[ int( mod( float( i + 1 ), float( NVERTS ) ) ) ]; // ugh...

		lightVec += acos( dot( v0, v1 ) ) * normalize( cross( v0, v1 ) );

	}

	// irradiance factor at point

	float factor = max( dot( lightVec, normal ), 0.0 ) / ( 2.0 * 3.14159265 );

	// frag color

	vec3 diffuse = color * lightColor * lightIntensity * factor;

	gl_FragColor = vec4( ambient + diffuse, 1.0 );

}