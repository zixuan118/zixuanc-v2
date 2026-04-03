"use client"

import { useId } from "react"
import { useMarginObject } from "@/components/site/margin-object-shell"
import { OT } from "@/components/objects/object-tokens"
import styles from "./archive-camera-aperture.module.css"

const CAMERA_SRC = "/images/camera.png" as const
const DIMS = { w: 1536, h: 1024 } as const

const BLADE_COUNT = 7
const STEP = 360 / BLADE_COUNT

export const IRIS_LAYOUT_DEBUG = false

const LENS_CX = 712.19
const LENS_CY = 503.68

/** 与 .stage 中 --lens-rx / --lens-ry 同步（小数），衬环与 clip 对齐 */
const LENS_RX_RATIO = 0.0722
const LENS_RY_RATIO = 0.1055
const LENS_RX_PX = DIMS.w * LENS_RX_RATIO
const LENS_RY_PX = DIMS.h * LENS_RY_RATIO

const SICKLE_BLADE_D = [
  "M 8 0",
  "C 62 54 122 96 166 86",
  "C 190 82 206 42 206 7",
  "C 206 -16 176 -46 148 -56",
  "C 96 -102 26 -90 14 -34",
  "C 10 -19 8 -5 8 0",
  "Z",
].join(" ")

/**
 * 铰点：约在叶片中部（距光心更近），勿贴外钝端；外缘离枢轴远，同样角度下弧长更大、更易看出整片在转。
 */
const BLADE_PIVOT_X = 92
const BLADE_PIVOT_Y = 0

/** 随开孔变大，叶片沿径向略外移（user 单位），强化外缘位移感 */
const BLADE_RADIAL_SLIDE_MAX = 7

/**
 * 页顶：孔尽量小；页底：滑到底时的最大孔径。
 * progress↑ → drive↑ → twist↑ → 孔越大（与当前几何一致）。
 */
const TWIST_AT_PAGE_TOP_DEG = 0
const TWIST_AT_PAGE_BOTTOM_DEG = 33

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function irisDrive(t: number) {
  const u = clamp(t, 0, 1)
  return u * u * (3 - 2 * u)
}

/**
 * Archive：7 片光圈。多层渐变模拟哑光金属、内缘受光、叠片阴影与拉丝高光。
 */
export function ArchiveCameraAperture() {
  const { progress } = useMarginObject()
  const rawId = useId().replace(/:/g, "")
  const dbg = IRIS_LAYOUT_DEBUG

  const p = clamp(progress, 0, 1)
  const drive = irisDrive(p)
  const twistDeg =
    TWIST_AT_PAGE_TOP_DEG +
    (TWIST_AT_PAGE_BOTTOM_DEG - TWIST_AT_PAGE_TOP_DEG) * drive
  const radialSlide = drive * BLADE_RADIAL_SLIDE_MAX

  const radId = `archive-iris-scene-${rawId}`
  const linId = `archive-iris-brush-${rawId}`
  const innerId = `archive-iris-inner-${rawId}`

  const strokeW = dbg ? 1.05 : 0.38
  const strokeOp = dbg ? 0.45 : 0.2
  const gradR = dbg ? 198 : 176

  return (
    <div className={`${styles.root} ${dbg ? styles.irisDebug : ""}`.trim()}>
      <div className={styles.stage}>
        <div className={styles.irisClip} aria-hidden>
          <div className={styles.iris}>
            <svg
              className={styles.irisSvg}
              viewBox={`0 0 ${DIMS.w} ${DIMS.h}`}
              aria-hidden
            >
              <defs>
                {/* 自光心径向：靠孔更暗（遮挡）、中段哑光、外缘略收光 */}
                <radialGradient
                  id={radId}
                  cx={LENS_CX}
                  cy={LENS_CY}
                  r={gradR}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#1a1917" stopOpacity={0.94} />
                  <stop offset="12%" stopColor="#252320" stopOpacity={0.88} />
                  <stop offset="28%" stopColor="#3d3a36" stopOpacity={0.78} />
                  <stop offset="48%" stopColor="#6a6560" stopOpacity={0.62} />
                  <stop offset="62%" stopColor="#8e8983" stopOpacity={0.48} />
                  <stop offset="78%" stopColor="#a8a39c" stopOpacity={0.38} />
                  <stop offset="90%" stopColor="#6d6964" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#2e2c29" stopOpacity={0.82} />
                </radialGradient>
                {/* 沿叶片长向：模拟左上方向光下的拉丝与卷边 */}
                <linearGradient
                  id={linId}
                  x1="0.08"
                  y1="0.55"
                  x2="0.95"
                  y2="0.38"
                  gradientUnits="objectBoundingBox"
                >
                  <stop offset="0%" stopColor="#0c0b0a" stopOpacity={0.75} />
                  <stop offset="22%" stopColor="#4a4642" stopOpacity={0.5} />
                  <stop offset="44%" stopColor="#d8d3ca" stopOpacity={0.28} />
                  <stop offset="58%" stopColor="#9a958e" stopOpacity={0.42} />
                  <stop offset="76%" stopColor="#5a5652" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#1c1b19" stopOpacity={0.72} />
                </linearGradient>
                {/* 内缘（靠孔一侧）细窄高光带 */}
                <linearGradient
                  id={innerId}
                  x1="0"
                  y1="0.5"
                  x2="0.42"
                  y2="0.48"
                  gradientUnits="objectBoundingBox"
                >
                  <stop offset="0%" stopColor="#f0ebe3" stopOpacity={0.62} />
                  <stop offset="7%" stopColor="#c4bfb6" stopOpacity={0.4} />
                  <stop offset="16%" stopColor="#3a3835" stopOpacity={0.55} />
                  <stop offset="45%" stopColor="#5c5854" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#2a2826" stopOpacity={0} />
                </linearGradient>
              </defs>
              {/* 沿椭圆孔缘的深色环：遮住叶片与抠空之间的微缝，避免透出页面白底 */}
              <ellipse
                className={styles.irisLensWellRing}
                cx={LENS_CX}
                cy={LENS_CY}
                rx={LENS_RX_PX * 0.997}
                ry={LENS_RY_PX * 0.997}
                fill="none"
                stroke="#0e0e0d"
                strokeOpacity={0.94}
                strokeWidth={26}
                strokeLinejoin="round"
              />
              <g transform={`translate(${LENS_CX} ${LENS_CY})`}>
                {Array.from({ length: BLADE_COUNT }, (_, i) => (
                  <g key={i} transform={`rotate(${-90 + i * STEP})`}>
                    <g transform={`translate(${radialSlide.toFixed(2)} 0)`}>
                      <g
                        transform={`rotate(${twistDeg.toFixed(3)} ${BLADE_PIVOT_X} ${BLADE_PIVOT_Y})`}
                      >
                      <g className={styles.irisBladeStack}>
                        <path
                          d={SICKLE_BLADE_D}
                          fill={`url(#${radId})`}
                          stroke="#1e1d1b"
                          strokeOpacity={dbg ? 0.35 : 0.22}
                          strokeWidth={strokeW}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className={styles.irisBladeBase}
                        />
                        <path
                          d={SICKLE_BLADE_D}
                          fill={`url(#${linId})`}
                          stroke="none"
                          className={styles.irisBladeDirectional}
                        />
                        <path
                          d={SICKLE_BLADE_D}
                          fill={`url(#${innerId})`}
                          stroke="none"
                          className={styles.irisBladeInnerRim}
                        />
                      </g>
                      <path
                        d={SICKLE_BLADE_D}
                        fill="none"
                        stroke={OT.highlight}
                        strokeOpacity={strokeOp}
                        strokeWidth={dbg ? 0.55 : 0.22}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className={styles.irisBladeHairline}
                      />
                      </g>
                    </g>
                  </g>
                ))}
              </g>
            </svg>
          </div>
        </div>
        <img
          className={styles.camera}
          src={CAMERA_SRC}
          alt=""
          draggable={false}
          decoding="async"
          width={DIMS.w}
          height={DIMS.h}
        />
      </div>
    </div>
  )
}
