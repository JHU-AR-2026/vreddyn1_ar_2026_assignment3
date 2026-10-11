import argparse
import numpy as np


def intrinsics_matrix(fx, fy, ox, oy, sh=0.0):
    return np.array([[fx, sh, ox],
                     [0.0, fy, oy],
                     [0.0, 0.0, 1.0]])


def projection_from_intrinsics(M_int, W, H, n, f):
    fx, sh, ox = M_int[0]
    fy, oy = M_int[1, 1], M_int[1, 2]
    return np.array([
        [2 * fx / W, 2 * sh / W, (W - 2 * ox) / W,   0.0],
        [0.0,        2 * fy / H, (-H + 2 * oy) / H,  0.0],
        [0.0,        0.0,        -(f + n) / (f - n), -2 * f * n / (f - n)],
        [0.0,        0.0,        -1.0,               0.0],
    ])


def frustum_bounds(M_int, W, H, n):
    fx, _, ox = M_int[0]
    fy, oy = M_int[1, 1], M_int[1, 2]
    l = -n * ox / fx
    r = n * (W - ox) / fx
    t = n * oy / fy
    b = -n * (H - oy) / fy
    return l, r, b, t


def camera_to_clip(M_proj, P_c):
    return M_proj @ np.asarray(P_c, dtype=float)


def inside_clip_volume(P_clip):
    x, y, z, w = P_clip
    return w > 0 and all(-w <= c <= w for c in (x, y, z))


def clip_to_ndc(P_clip):

    return P_clip[:3] / P_clip[3]


def ndc_to_pixel(P_ndc, W, H):
    u = 0.5 * (P_ndc[0] + 1.0) * W
    v = 0.5 * (P_ndc[1] + 1.0) * H
    return u, v


def camera_to_pixel(P_c, fx, fy, ox, oy, W, H, n, f, sh=0.0, verbose=True):
    M_int = intrinsics_matrix(fx, fy, ox, oy, sh)
    M_proj = projection_from_intrinsics(M_int, W, H, n, f)
    P_clip = camera_to_clip(M_proj, P_c)
    inside = inside_clip_volume(P_clip)
    P_ndc = clip_to_ndc(P_clip)
    u, v = ndc_to_pixel(P_ndc, W, H)

    if verbose:
        np.set_printoptions(precision=6, suppress=True)
        l, r, b, t = frustum_bounds(M_int, W, H, n)
        print("Camera intrinsics M_int:\n", M_int)
        print(f"\nOpenGL parameters: W={W}, H={H}, near n={n}, far f={f}")
        print(f"Equivalent frustum on near plane: l={l:.6g}, r={r:.6g}, b={b:.6g}, t={t:.6g}")
        print("\n(a/b) Projection matrix M_proj:\n", M_proj)
        print("\nCamera point P^C:", np.asarray(P_c, dtype=float))
        print("(c) Clip coordinates P_clip = M_proj P^C:", P_clip)
        print("    Inside clip volume (-w <= x,y,z <= w)?", inside)
        print("(c) NDC = P_clip[:3] / w:", P_ndc)
        print(f"(d) Pixel coordinates: u = {u:.4f}, v = {v:.4f}")

        # Independent check with the pinhole model (Lec 4): depth = -z_c,
        # u = fx*x/depth + ox ; v measured from the TOP with the image y axis pointing down,
        # then flipped to the viewport convention (v measured from the bottom).
        x_c, y_c, z_c = np.asarray(P_c, dtype=float)[:3]
        depth = -z_c
        u_pin = (fx * x_c + sh * y_c) / depth + ox   # shear term as in the Lec 10 matrix
        v_top = fy * (-y_c) / depth + oy
        print(f"\nPinhole check: u = {u_pin:.4f}, v_from_top = {v_top:.4f} "
              f"-> v_from_bottom = H - v_from_top = {H - v_top:.4f}")
    return (u, v), dict(M_int=M_int, M_proj=M_proj, P_clip=P_clip, P_ndc=P_ndc, inside=inside)


def main():
    p = argparse.ArgumentParser(description="Camera point -> OpenGL NDC -> pixel coordinates")
    p.add_argument("--fx", type=float, default=800.0)
    p.add_argument("--fy", type=float, default=800.0)
    p.add_argument("--ox", type=float, default=400.0)
    p.add_argument("--oy", type=float, default=400.0)
    p.add_argument("--sh", type=float, default=0.0, help="shear (often 0)")
    p.add_argument("--W", type=float, default=800.0, help="viewport width in pixels")
    p.add_argument("--H", type=float, default=600.0, help="viewport height in pixels")
    p.add_argument("--near", type=float, default=0.2)
    p.add_argument("--far", type=float, default=20.0)
    p.add_argument("--point", type=float, nargs=3, default=[0.3, -0.15, -6.0],
                   metavar=("XC", "YC", "ZC"), help="camera-frame point (camera looks along -Z)")
    a = p.parse_args()

    P_c = [*a.point, 1.0]  # homogeneous camera point
    camera_to_pixel(P_c, a.fx, a.fy, a.ox, a.oy, a.W, a.H, a.near, a.far, a.sh)


if __name__ == "__main__":
    main()
