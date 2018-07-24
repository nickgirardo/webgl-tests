#version 300 es
in vec3 vertex;
in vec2 vertex_uv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 transform;

out vec2 uv;

void main()
{
    gl_Position = projection * view * model * transform * vec4(vertex, 1.0);

    uv = vertex_uv;
}


