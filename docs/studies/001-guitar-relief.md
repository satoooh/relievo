# Study 001: Guitar Relief

This first study frames Relievo as a browser-side 2.5D relief instrument in a 3D scene rather than a generic WebGL demo.

## Source

- Capture: `docs/assets/relievo-realtime-browser-demo.gif`
- High-quality playback reference: `docs/assets/relievo-realtime-browser-demo.mp4`
- Subject: hands and guitar, recorded as a browser screen capture.

## Intent

The guitar study is useful because it has recognizable macro structure and many small forms: strings, frets, fingers, fabric, and the body of the instrument. That makes it a good test for whether point relief can stay legible while still feeling granular.

## Current Look

- Preset: LiDAR Scan
- Backend: Depth Anything V2 Base
- Export: GIF for README autoplay, MP4 for cleaner playback
- Visual priority: dark field, small points, readable depth motion

## Next Iterations

- Test the same material in performance mode with all controls hidden.
- Save a URL-hash state for the exact look.
- Compare point mode with emoji mosaic mode at a fine dot-like scale, with glyphs attached to the same 3D relief plane so symbolic micro-texture appears only when looking closely and does not weaken the surface.
- Re-record with a cleaner exhibition composition once the default material and source framing are settled.
