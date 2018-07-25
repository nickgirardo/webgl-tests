#version 300 es
in vec4 position;

uniform mat4 model;
uniform mat4 viewProj;

void main()
{
    gl_Position = viewProj * model * position;
}

