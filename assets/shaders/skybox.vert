#version 300 es
in vec3 position;

out vec3 texcoords;

uniform mat4 view;
uniform mat4 projection;

void main()
{
    texcoords = position;
    vec4 temp_pos = projection * view * vec4(position, 1.0);
    gl_Position = temp_pos.xyww;
}

