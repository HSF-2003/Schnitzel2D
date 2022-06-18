#version 420 core

/*
Marching Squares in a pixel shader!

At least I didn't have to mess with all 256 cases of
the marching cubes algorithm ;)

Mouse drag to edit.
Left arrow key to clear.
*/

uniform vec2 iResolution;
uniform sampler2D field;
uniform int time;


out vec4 fragColor;

#define CELL_SIZE 0.2
#define ADAPTIVE

#ifdef ADAPTIVE
// Solving for the zero isoline of the linear interpolation is much smoother
#define zero(p1, p2, v1, v2) mix(p1, p2, v1 / (v1 - v2))

#else
// Naive averaging looks very blocky (you might find it cool though)
#define zero(p1, p2, v1, v2) mix(p1, p2, 0.5)
#endif


float sdLine(in vec2 p, in vec2 a, in vec2 b) {
    vec2 pa = p - a, ba = b - a;
    return length(pa - ba * dot(pa, ba) / dot(ba, ba)); // No clamp needed here, the cells do it
}

// Distance field
float map(in vec2 p) {
    vec2 uv = p / 4.0 * vec2(480.0 / 640.0, 1.0) + 0.5;
    uv.xy *= vec2(640, 480);
    return texture(field, uv).r;
}

float msquares(in vec2 p) {
    float ms = 10000;

    vec2 bl_p = floor(p / CELL_SIZE) * CELL_SIZE;
    vec2 br_p = bl_p + vec2(CELL_SIZE, 0.0);
    vec2 tl_p = bl_p + vec2(0.0, CELL_SIZE);
    vec2 tr_p = bl_p + CELL_SIZE;

    float bl_v = map(bl_p);
    float br_v = map(br_p);
    float tl_v = map(tl_p);
    float tr_v = map(tr_p);


    // Distance field cuts through top left corner
    if ((tl_v <= 0.0 && tr_v >= 0.0 && bl_v >= 0.0 && br_v >= 0.0) || (tl_v >= 0.0 && tr_v <= 0.0 && bl_v <= 0.0 && br_v <= 0.0)) {
        ms = min(ms, sdLine(p, zero(bl_p, tl_p, bl_v, tl_v), zero(tl_p, tr_p, tl_v, tr_v)));
    }

    // Distance field cuts through top right corner
    if ((tr_v <= 0.0 && tl_v >= 0.0 && bl_v >= 0.0 && br_v >= 0.0) || (tr_v >= 0.0 && tl_v <= 0.0 && bl_v <= 0.0 && br_v <= 0.0)) {
        ms = min(ms, sdLine(p, zero(tl_p, tr_p, tl_v, tr_v), zero(tr_p, br_p, tr_v, br_v)));
    }

    // Distance field cuts through bottom right corner
    if ((br_v <= 0.0 && bl_v >= 0.0 && tl_v >= 0.0 && tr_v >= 0.0) || (br_v >= 0.0 && bl_v <= 0.0 && tl_v <= 0.0 && tr_v <= 0.0)) {
        ms = min(ms, sdLine(p, zero(tr_p, br_p, tr_v, br_v), zero(br_p, bl_p, br_v, bl_v)));
    }

    // Distance field cuts through bottom left corner
    if ((bl_v <= 0.0 && tl_v >= 0.0 && tr_v >= 0.0 && br_v >= 0.0) || (bl_v >= 0.0 && tl_v <= 0.0 && tr_v <= 0.0 && br_v <= 0.0)) {
        ms = min(ms, sdLine(p, zero(br_p, bl_p, br_v, bl_v), zero(bl_p, tl_p, bl_v, tl_v)));
    }

    // Distance field cuts through top left and bottom right corner
    if ((tl_v <= 0.0 && tr_v >= 0.0 && bl_v >= 0.0 && br_v <= 0.0)) {// || (tl_v >= 0.0 && tr_v <= 0.0 && bl_v <= 0.0 && br_v >= 0.0)) {
        ms = min(ms, sdLine(p, zero(tl_p, bl_p, tl_v, bl_v), zero(tl_p, tr_p, tl_v, tr_v)));
        ms = min(ms, sdLine(p, zero(bl_p, br_p, bl_v, br_v), zero(br_p, tr_p, br_v, tr_v)));
    }

    // Distance field cuts through top right and bottom left corner
    if ((tl_v >= 0.0 && tr_v <= 0.0 && bl_v <= 0.0 && br_v >= 0.0)) {// || (tl_v <= 0.0 && tr_v >= 0.0 && bl_v >= 0.0 && br_v <= 0.0)) {
        ms = min(ms, sdLine(p, zero(tl_p, tr_p, tl_v, tr_v), zero(tr_p, br_p, tr_v, br_v)));
        ms = min(ms, sdLine(p, zero(tl_p, bl_p, tl_v, bl_v), zero(bl_p, br_p, bl_v, br_v)));
    }

    // Distance field cuts through the cell vertically
    if ((bl_v <= 0.0 && br_v >= 0.0 && tl_v <= 0.0 && tr_v >= 0.0) || (bl_v >= 0.0 && br_v <= 0.0 && tl_v >= 0.0 && tr_v <= 0.0)) {
        ms = min(ms, sdLine(p, zero(tl_p, tr_p, tl_v, tr_v), zero(bl_p, br_p, bl_v, br_v)));
    }

    // Distance field cuts through the cell horizontally
    if ((tl_v <= 0.0 && tr_v <= 0.0 && bl_v >= 0.0 && br_v >= 0.0) || (tl_v >= 0.0 && tr_v >= 0.0 && bl_v <= 0.0 && br_v <= 0.0)) {
        ms = min(ms, sdLine(p, zero(tl_p, bl_p, tl_v, bl_v), zero(tr_p, br_p, tr_v, br_v)));
    }

    return ms;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y * 4.0; // -2 - 2

    float unit = 8.0 / iResolution.y;
    fragColor = texture(field, gl_FragCoord.xy);
    //fragColor = vec4(vec3(smoothstep(unit, 0.0, msquares(uv))), 1);
}

