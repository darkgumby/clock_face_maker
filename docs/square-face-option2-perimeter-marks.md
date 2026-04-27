# Square Face: Option 2 — Perimeter-Aligned Marks

## What it is

Instead of keeping marks at a fixed radial distance from center (option 1), option 2 places mark **endpoints on the square's border**. Each mark starts at the border and extends inward toward the center.

## How it works

For a mark at angle `a` (radians from 12 o'clock):

1. Cast a ray from center at angle `a`
2. Find where the ray intersects the square's edge
3. Start the mark at the intersection point
4. End the mark `markLength` units inward along the ray

### Ray/square intersection

For a square centered at `(cx, cy)` with half-side `h = diameter/2 - borderWidth`:

```ts
function squareIntersect(cx: number, cy: number, h: number, angle: number): [number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  // distance to each edge along the ray
  const tx = cos !== 0 ? h / Math.abs(cos) : Infinity;
  const ty = sin !== 0 ? h / Math.abs(sin) : Infinity;
  const t = Math.min(tx, ty);
  return [cx + t * cos, cy + t * sin];
}
```

## Key differences from option 1

| | Option 1 (current) | Option 2 |
|---|---|---|
| Mark start | Fixed radius (inscribed circle) | Square perimeter |
| Cardinal marks (12/3/6/9) | Touch border | Touch border |
| Diagonal marks (1/2/4/5...) | Float inside square | Touch border |
| Mark length | Uniform | Uniform (inward from edge) |
| Complexity | None | Ray/edge intersection per mark |

## Considerations for rounded_square

For rounded corners, the intersection is on the arc not the flat edge when the ray angle points toward a corner. Requires checking whether the ray hits the flat portion or the arc:

- Flat edges: same formula as square
- Corner arcs: ray/circle intersection with the corner arc center

## Why option 1 was chosen first

Real square watches use radial placement — it looks natural and requires no extra math. Option 2 gives a more "grid-like" appearance where all marks align to the border, which may suit certain design aesthetics but requires the intersection math above.

## New param needed

`mark_placement: "radial" | "perimeter"` — default `"radial"` (option 1).
