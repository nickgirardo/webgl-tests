#version 300 es
precision highp float;
precision highp int;

uniform samplerCube cubemap;

in vec3 texcoords;

out vec4 color;

void main()
{
    color = texture(cubemap, texcoords);
}

