import {
  AdditiveBlending,
  CanvasTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Material,
  type Texture,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import { createPieceGeometries, type PieceType } from "@/scenes/chess/pieces";
import { OPENING, STARTING_POSITION, squareToXZ, type Side } from "@/scenes/chess/opening";

/**
 * Where the camera sits at a point in the scroll story.
 *
 * `frame` is the share of the viewport's height, measured up from the
 * bottom, that the board is fitted into — the rest is left for copy — less a
 * strip along the foot (`FOOT`) that the board's nearest corner never
 * crosses. `zoom` scales the distance from that fit: 1 shows the whole board,
 * less crops in. Both are relative, so a pose frames the same way on a phone
 * and a monitor.
 *
 * `title` is how far the shot keeps clear of the stage's title: 1 shrinks the
 * frame to the room left under it (see `setHeadroom`), 0 ignores it. The
 * title is measured rather than guessed, because how much of the viewport it
 * takes differs from a phone to a short laptop to a tall monitor.
 */
export type CameraPose = {
  at: number;
  azimuth: number;
  elevation: number;
  zoom: number;
  frame: number;
  title: number;
  target: [x: number, y: number, z: number];
};

/**
 * The story, in four shots: the product under its title, the moves from
 * above, the castled king up close, then round to the other side of the
 * board. The title leaves as the story starts, so only the first shot makes
 * room for it; the rest give the board most of the frame.
 */
export const STORY_POSES: CameraPose[] = [
  { at: 0, azimuth: -30, elevation: 26, zoom: 1, frame: 0.78, title: 1, target: [0, 0, 0] },
  { at: 0.31, azimuth: 0, elevation: 70, zoom: 1, frame: 0.84, title: 0, target: [0, 0, 0] },
  { at: 0.6, azimuth: 50, elevation: 14, zoom: 0.5, frame: 0.9, title: 0, target: [1.7, 0.45, 2.6] },
  { at: 0.9, azimuth: 150, elevation: 32, zoom: 1, frame: 0.82, title: 0, target: [0, 0, 0] },
];

const FOV = 30;
const DEG = Math.PI / 180;

/** Board footprint, and the half-diagonal that bounds it from any angle. */
const BOARD = 9.4;
const BOARD_RADIUS = (BOARD * Math.SQRT2) / 2;
/** The tallest piece, which the framing has to clear on the far rank. */
const PIECE_HEIGHT = 1.45;
/** Height of the playing surface; pieces stand on it. */
const SURFACE = 0.02;
/** Depth of the frame the squares sit in. */
const FRAME_DEPTH = 0.46;

/**
 * The points the framing keeps on screen: each corner of the frame, top and
 * underside, and the tallest piece standing on each corner square.
 */
const BOUNDS: Vector3[] = [-1, 1].flatMap((x) =>
  [-1, 1].flatMap((z) => [
    new Vector3((x * BOARD) / 2, 0, (z * BOARD) / 2),
    new Vector3((x * BOARD) / 2, -FRAME_DEPTH, (z * BOARD) / 2),
    new Vector3(x * 3.9, PIECE_HEIGHT, z * 3.9),
  ]),
);

const BRAND_ORANGE = 0xf06b28;
const BRAND_BLUE = 0x2c8fe3;

/** The least of the viewport the board is ever fitted into, however tall the title runs. */
const MIN_FRAME = 0.4;
/**
 * The strip along the foot of the viewport the board stays above, as a share
 * of its height. It keeps the nearest corner whole, and leaves a margin
 * between the board and the page that follows once the stage scrolls away.
 */
const FOOT = 0.04;
/**
 * How far a shot under the title draws a board that doesn't fill its frame up
 * towards the title: 0 centres it in the room left, 0.5 would butt it against
 * the title.
 */
const TITLE_PULL = 0.3;

/** Seconds between plies, and how long the board holds the finished position. */
const PLY_INTERVAL = 1.35;
const FINAL_HOLD = 3.4;

type Tween = {
  from: Vector3;
  to: Vector3;
  start: number;
  duration: number;
  lift: number;
  ease: (t: number) => number;
  /** Hidden until the tween starts — for the pieces dropping in on load. */
  appear?: boolean;
};

type Piece = {
  mesh: Mesh;
  type: PieceType;
  home: string;
  tween: Tween | null;
};

type ScenePose = Omit<CameraPose, "at" | "target"> & { tx: number; ty: number; tz: number };

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);

function poseAt(progress: number): ScenePose {
  const poses = STORY_POSES;
  let i = 0;
  while (i < poses.length - 2 && progress > poses[i + 1].at) i++;
  const a = poses[i];
  const b = poses[i + 1];
  const t = smoothstep(clamp01((progress - a.at) / (b.at - a.at)));
  const mix = (x: number, y: number) => x + (y - x) * t;
  return {
    azimuth: mix(a.azimuth, b.azimuth),
    elevation: mix(a.elevation, b.elevation),
    zoom: mix(a.zoom, b.zoom),
    frame: mix(a.frame, b.frame),
    title: mix(a.title, b.title),
    tx: mix(a.target[0], b.target[0]),
    ty: mix(a.target[1], b.target[1]),
    tz: mix(a.target[2], b.target[2]),
  };
}

function squarePosition(square: string, y = SURFACE) {
  const [x, z] = squareToXZ(square);
  return new Vector3(x, y, z);
}

/**
 * The Chess ID board.
 *
 * A studio shot rather than a game: one board under a soft key light and the
 * brand's orange and blue as rim lights, playing a quiet opening on a loop.
 * The page drives the camera with scroll progress; everything else — the
 * moves, the drift, the pointer parallax — runs on the scene's own clock,
 * which only advances while the canvas is on screen.
 */
export class ChessBoardScene {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV, 1, 0.1, 200);
  /** Stands in for the camera while a shot is fitted, so the real one is only ever moved once a frame. */
  private fitCamera = new PerspectiveCamera(FOV, 1, 0.1, 400);
  private point = new Vector3();
  /** Key and rim lights, turned with the camera so every shot is lit the same way. */
  private rig = new Group();
  private environment: Texture;

  private pieces: Piece[] = [];
  private occupancy = new Map<string, Piece>();
  private fromMarker: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private toMarker: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private markerOpacity = 0;

  private width = 1;
  private height = 1;
  /** Pixels at the top of the viewport taken by the title, gap included. */
  private headroom = 0;
  private goal: ScenePose = poseAt(0);
  private pose: ScenePose = poseAt(0);
  private pointer = { x: 0, y: 0 };
  private pointerGoal = { x: 0, y: 0 };

  private time = 0;
  private phase: "intro" | "play" | "hold" = "intro";
  private ply = 0;
  private nextAt = 0;

  private frame = 0;
  private last = 0;
  private ready = false;
  private disposables: { dispose: () => void }[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    private options: {
      reducedMotion: boolean;
      onReady?: () => void;
    },
  ) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = SRGBColorSpace;
    // Khronos PBR Neutral: the tone mapper made for product shots — it keeps
    // the brand colours honest where ACES would push them towards yellow.
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;

    const pmrem = new PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.environment = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    pmrem.dispose();
    this.scene.environment = this.environment;
    this.scene.environmentIntensity = 0.55;

    this.addLights();
    this.addBoard();
    this.addPieces();

    const markerGeometry = new PlaneGeometry(0.94, 0.94);
    markerGeometry.rotateX(-Math.PI / 2);
    this.disposables.push(markerGeometry);
    this.fromMarker = this.addMarker(markerGeometry, BRAND_BLUE);
    this.toMarker = this.addMarker(markerGeometry, BRAND_ORANGE);

    if (options.reducedMotion) this.settleFinalPosition();
    else this.startIntro();
  }

  /** Scroll progress through the story, 0–1. `immediate` skips the easing. */
  setProgress(progress: number, immediate = false) {
    this.goal = poseAt(clamp01(progress));
    if (immediate) this.pose = { ...this.goal };
  }

  /** Pointer position across the viewport, -1 to 1 on each axis. */
  setPointer(x: number, y: number) {
    this.pointerGoal = { x, y };
  }

  setRunning(running: boolean) {
    if (running && !this.frame) {
      this.last = performance.now();
      this.frame = requestAnimationFrame(this.loop);
    } else if (!running && this.frame) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  }

  resize(width: number, height: number) {
    if (width === 0 || height === 0) return;
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    if (!this.frame) this.render();
  }

  /** Pixels at the top of the viewport the title takes, for shots that keep clear of it. */
  setHeadroom(pixels: number) {
    this.headroom = Math.max(0, pixels);
    if (!this.frame) this.render();
  }

  dispose() {
    this.setRunning(false);
    // Pieces share geometries and materials, so some are released more than
    // once here; three.js ignores every dispose after the first.
    this.scene.traverse((object) => {
      if (object instanceof Mesh || object instanceof InstancedMesh) {
        object.geometry.dispose();
        const materials: Material[] = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    this.disposables.forEach((item) => item.dispose());
    this.environment.dispose();
    this.renderer.dispose();
  }

  // -- Construction -----------------------------------------------------

  private addLights() {
    const key = new DirectionalLight(0xfff4ea, 2.3);
    key.position.set(-4.5, 11, 6);
    key.castShadow = true;
    const small = window.innerWidth < 768;
    key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
    key.shadow.camera.left = -6.5;
    key.shadow.camera.right = 6.5;
    key.shadow.camera.top = 6.5;
    key.shadow.camera.bottom = -6.5;
    key.shadow.camera.near = 2;
    key.shadow.camera.far = 26;
    key.shadow.radius = 5;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;

    // The logo's two colours, as rim lights from behind: orange from the
    // right, blue from the left, so every silhouette carries the brand.
    // Positions are for a camera behind white; the rig turns with the camera,
    // so they stay behind the board whichever side it is seen from.
    const rimOrange = new DirectionalLight(BRAND_ORANGE, 2.0);
    rimOrange.position.set(7, 3, -6);
    const rimBlue = new DirectionalLight(BRAND_BLUE, 2.4);
    rimBlue.position.set(-7, 3.5, -5);

    const fill = new HemisphereLight(0xbfd8ff, 0x08131c, 0.35);

    this.rig.add(key, rimOrange, rimBlue);
    this.scene.add(this.rig, fill);
  }

  private addBoard() {
    const frame = new Mesh(
      new RoundedBoxGeometry(BOARD, FRAME_DEPTH, BOARD, 5, 0.16),
      new MeshPhysicalMaterial({
        color: 0x0a1822,
        metalness: 0.75,
        roughness: 0.36,
        clearcoat: 0.6,
        clearcoatRoughness: 0.3,
      }),
    );
    frame.position.y = -FRAME_DEPTH / 2;
    frame.receiveShadow = true;
    this.scene.add(frame);

    // Squares are separate tiles with a hairline groove between them, which
    // is what makes the board read as machined rather than printed.
    const tile = new RoundedBoxGeometry(0.975, 0.05, 0.975, 2, 0.012);
    const light = new InstancedMesh(
      tile,
      new MeshPhysicalMaterial({
        // Brushed silver, a step darker than the white pieces so they stand
        // out against it.
        color: 0x94a2af,
        metalness: 0.25,
        roughness: 0.5,
        clearcoat: 0.3,
        clearcoatRoughness: 0.35,
      }),
      32,
    );
    const dark = new InstancedMesh(
      tile.clone(),
      new MeshPhysicalMaterial({
        color: 0x14314a,
        metalness: 0.35,
        roughness: 0.3,
        clearcoat: 0.9,
        clearcoatRoughness: 0.18,
      }),
      32,
    );

    const matrix = new Matrix4();
    let lightIndex = 0;
    let darkIndex = 0;
    for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
        matrix.makeTranslation(file - 3.5, SURFACE - 0.025, 3.5 - rank);
        // a1 is dark.
        if ((file + rank) % 2 === 0) dark.setMatrixAt(darkIndex++, matrix);
        else light.setMatrixAt(lightIndex++, matrix);
      }
    }
    light.receiveShadow = true;
    dark.receiveShadow = true;
    this.scene.add(light, dark);

    this.addInlay();
  }

  /** A hairline in the logo's orange and blue, inlaid round the play area. */
  private addInlay() {
    const size = 2048;
    const plate = 9;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const ctx = canvas.getContext("2d");
    if (ctx) {
      const inner = (8 * size) / plate;
      const edge = (size - inner) / 2;
      const rule = ctx.createLinearGradient(edge, size - edge, size - edge, edge);
      rule.addColorStop(0, "rgba(240, 107, 40, 0.9)");
      rule.addColorStop(0.5, "rgba(170, 205, 235, 0.18)");
      rule.addColorStop(1, "rgba(44, 143, 227, 0.9)");
      ctx.strokeStyle = rule;
      ctx.lineWidth = 3;
      ctx.strokeRect(edge - 14, edge - 14, inner + 28, inner + 28);
    }

    const inlay = new Mesh(
      new PlaneGeometry(plate, plate),
      new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }),
    );
    inlay.rotation.x = -Math.PI / 2;
    inlay.position.y = 0.002;
    this.scene.add(inlay);
    this.disposables.push(texture);
  }

  private addPieces() {
    const geometries = createPieceGeometries();
    const materials: Record<Side, MeshPhysicalMaterial> = {
      // Porcelain: a soft white body under a hard clear coat.
      white: new MeshPhysicalMaterial({
        color: 0xe6e9ee,
        metalness: 0,
        roughness: 0.34,
        clearcoat: 1,
        clearcoatRoughness: 0.16,
        sheen: 0.3,
        sheenColor: 0xffffff,
        sheenRoughness: 0.6,
      }),
      // Polished midnight: dark enough to read as black, metallic enough that
      // the rim lights draw every edge.
      black: new MeshPhysicalMaterial({
        color: 0x0c1620,
        metalness: 0.55,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      }),
    };

    for (const spec of STARTING_POSITION) {
      const mesh = new Mesh(geometries[spec.type], materials[spec.side]);
      mesh.position.copy(squarePosition(spec.square));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (spec.type === "knight") {
        // Knights face outwards along the rank, turned 15° towards the
        // opponent, so the camera sees them in profile rather than edge-on.
        const queenside = spec.square[0] < "e";
        const yaw = queenside ? 165 : 15;
        mesh.rotation.y = (spec.side === "white" ? yaw : -yaw) * DEG;
      }
      const piece: Piece = { mesh, type: spec.type, home: spec.square, tween: null };
      this.pieces.push(piece);
      this.occupancy.set(spec.square, piece);
      this.scene.add(mesh);
    }
  }

  private addMarker(geometry: PlaneGeometry, color: number) {
    const marker = new Mesh(
      geometry,
      new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    marker.position.y = SURFACE + 0.003;
    marker.visible = false;
    this.scene.add(marker);
    return marker;
  }

  // -- The game ---------------------------------------------------------

  private startIntro() {
    // Back ranks land first, file by file, then the pawns.
    for (const piece of this.pieces) {
      const file = piece.home.charCodeAt(0) - 97;
      const isPawn = piece.home[1] === "2" || piece.home[1] === "7";
      const to = squarePosition(piece.home);
      piece.tween = {
        from: to.clone().setY(to.y + 1.6),
        to,
        start: 0.35 + file * 0.045 + (isPawn ? 0.3 : 0),
        duration: 0.7,
        lift: 0,
        ease: easeOutCubic,
        appear: true,
      };
      piece.mesh.visible = false;
    }
    this.phase = "intro";
    this.nextAt = 2.4;
  }

  /** Reduced motion: no loop, just the position the opening arrives at. */
  private settleFinalPosition() {
    for (const ply of OPENING) {
      for (const step of ply.steps) {
        const piece = this.occupancy.get(step.from);
        if (!piece) continue;
        this.occupancy.delete(step.from);
        this.occupancy.set(step.to, piece);
        piece.mesh.position.copy(squarePosition(step.to));
      }
    }
    this.phase = "hold";
    this.nextAt = Infinity;
  }

  private playNextPly() {
    const ply = OPENING[this.ply];
    ply.steps.forEach((step, i) => {
      const piece = this.occupancy.get(step.from);
      if (!piece) return;
      this.occupancy.delete(step.from);
      this.occupancy.set(step.to, piece);
      piece.tween = {
        from: piece.mesh.position.clone(),
        to: squarePosition(step.to),
        start: this.time + i * 0.18,
        duration: 0.8,
        // Knights jump; everything else glides.
        lift: piece.type === "knight" ? 0.6 : 0.24,
        ease: easeInOutCubic,
      };
    });

    const [first] = ply.steps;
    this.fromMarker.position.copy(squarePosition(first.from, SURFACE + 0.003));
    this.toMarker.position.copy(squarePosition(first.to, SURFACE + 0.003));
    this.fromMarker.visible = true;
    this.toMarker.visible = true;
    this.markerOpacity = 1;

    this.ply++;

    if (this.ply === OPENING.length) {
      this.phase = "hold";
      this.nextAt = this.time + FINAL_HOLD;
    } else {
      this.nextAt = this.time + PLY_INTERVAL;
    }
  }

  /** Every piece home at once, in a single sweep, then the opening again. */
  private rewind() {
    this.occupancy.clear();
    this.pieces.forEach((piece, i) => {
      this.occupancy.set(piece.home, piece);
      const to = squarePosition(piece.home);
      if (piece.mesh.position.distanceToSquared(to) < 1e-6) return;
      piece.tween = {
        from: piece.mesh.position.clone(),
        to,
        start: this.time + (i % 8) * 0.03,
        duration: 1.1,
        lift: 0.4,
        ease: easeInOutCubic,
      };
    });
    this.markerOpacity = 0;
    this.ply = 0;
    this.phase = "play";
    this.nextAt = this.time + 2.2;
  }

  private advanceGame() {
    if (this.time < this.nextAt) return;
    if (this.phase === "intro") this.phase = "play";
    if (this.phase === "play") this.playNextPly();
    else if (this.phase === "hold") this.rewind();
  }

  // -- Frame ------------------------------------------------------------

  private loop = (now: number) => {
    this.frame = requestAnimationFrame(this.loop);
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    this.time += dt;
    this.update(dt);
    this.render();
    if (!this.ready) {
      this.ready = true;
      this.options.onReady?.();
    }
  };

  private update(dt: number) {
    this.advanceGame();

    for (const piece of this.pieces) {
      const tween = piece.tween;
      if (!tween) continue;
      const t = clamp01((this.time - tween.start) / tween.duration);
      if (tween.appear) piece.mesh.visible = this.time >= tween.start;
      const e = tween.ease(t);
      piece.mesh.position.lerpVectors(tween.from, tween.to, e);
      piece.mesh.position.y += Math.sin(Math.PI * e) * tween.lift;
      if (t >= 1) piece.tween = null;
    }

    const markerK = 1 - Math.exp(-dt * 6);
    for (const marker of [this.fromMarker, this.toMarker]) {
      const target = this.markerOpacity * (marker === this.toMarker ? 0.5 : 0.32);
      marker.material.opacity += (target - marker.material.opacity) * markerK;
      if (this.markerOpacity === 0 && marker.material.opacity < 0.01) marker.visible = false;
    }

    // The camera eases towards the scroll pose rather than snapping to it,
    // which turns a trackpad's stepped scroll into one continuous move.
    const k = 1 - Math.exp(-dt * 3.2);
    for (const key of Object.keys(this.goal) as (keyof ScenePose)[]) {
      this.pose[key] += (this.goal[key] - this.pose[key]) * k;
    }
    const pk = 1 - Math.exp(-dt * 2.4);
    this.pointer.x += (this.pointerGoal.x - this.pointer.x) * pk;
    this.pointer.y += (this.pointerGoal.y - this.pointer.y) * pk;
  }

  private render() {
    const { pose, pointer } = this;
    const drift = this.options.reducedMotion ? 0 : Math.sin(this.time * 0.23) * 2.2;
    const azimuth = (pose.azimuth + pointer.x * 5 + drift) * DEG;
    const elevation = Math.min(Math.max(pose.elevation - pointer.y * 3, 6), 84) * DEG;

    // Fit the board into the pose's frame: its width across 90% of the
    // viewport, its height into the bottom `frame` of it, clear of the foot.
    // Framed on the pose rather than the drift, so the board doesn't breathe
    // as it sways.
    const aspect = this.width / this.height;
    // Portrait copy wraps onto more lines, so the board gets a little less room.
    const base = pose.frame - (aspect < 0.75 ? 0.08 : 0);
    // A shot that keeps clear of the title gives up only the part of its frame
    // the title actually overlaps, so the board shrinks no more than it must.
    const clear = 1 - this.headroom / this.height;
    const frame = Math.max(base - pose.title * Math.max(0, base - clear), MIN_FRAME);
    const bandTop = 1 - frame;
    const bandBottom = 1 - FOOT;
    const fitted = this.fitBoard(pose.azimuth * DEG, pose.elevation * DEG, bandBottom - bandTop);
    const distance = fitted.distance * pose.zoom;
    // On a portrait screen the board is fitted by its width and leaves part
    // of its frame empty. Under the title, some of that space goes below the
    // board rather than all being split around it, so title and board read
    // as one group instead of two things a gap apart.
    const spare = bandBottom - bandTop - (fitted.bottom - fitted.top);
    const lift = (bandTop + bandBottom) / 2 - (fitted.top + fitted.bottom) / 2 - pose.title * spare * TITLE_PULL;

    this.rig.rotation.y = azimuth;

    this.camera.position.set(
      pose.tx + distance * Math.cos(elevation) * Math.sin(azimuth),
      pose.ty + distance * Math.sin(elevation),
      pose.tz + distance * Math.cos(elevation) * Math.cos(azimuth),
    );
    this.camera.lookAt(pose.tx, pose.ty, pose.tz);
    this.camera.near = Math.max(0.1, distance - BOARD_RADIUS * 2.5);
    this.camera.far = distance + BOARD_RADIUS * 3;
    // Shift the image rather than the camera, so pushing the board down the
    // frame doesn't change the angle it is seen from.
    this.camera.setViewOffset(this.width, this.height, 0, -lift * this.height, this.width, this.height);

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * How far away the camera has to be, looking at the board's centre from
   * these angles, for the whole board to fill a band `band` tall (a share of
   * the viewport's height) and at most 90% of its width — and where in the
   * viewport the board then sits, top and bottom, as shares of its height.
   *
   * Found by projecting the board's corners rather than estimating its size,
   * because perspective swells whichever corner is nearest the camera — by a
   * tenth of the screen on the diagonal shots — and an estimate either crops
   * that corner off or leaves the board small. Apparent size goes roughly as
   * one over distance, so scaling the distance by the overshoot converges in
   * a few steps.
   */
  private fitBoard(azimuth: number, elevation: number, band: number) {
    const camera = this.fitCamera;
    camera.aspect = this.width / this.height;
    camera.updateProjectionMatrix();

    const direction = { x: Math.cos(elevation) * Math.sin(azimuth), y: Math.sin(elevation), z: Math.cos(elevation) * Math.cos(azimuth) };
    let distance = BOARD * 3;
    let top = 0;
    let bottom = 1;

    for (let step = 0; step < 5; step++) {
      camera.position.set(direction.x * distance, direction.y * distance, direction.z * distance);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const corner of BOUNDS) {
        const { x, y } = this.point.copy(corner).project(camera);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
      top = (1 - maxY) / 2;
      bottom = (1 - minY) / 2;

      // The last pass only measures, so `top` and `bottom` describe the
      // distance that is returned.
      if (step === 4) break;
      distance *= Math.max((bottom - top) / band, (maxX - minX) / 2 / 0.9);
    }

    return { distance, top, bottom };
  }
}
