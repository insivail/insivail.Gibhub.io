/* =========================================================================
   CANON EOS 6D — INTERACTIVE TEARDOWN LAB
   Scene, interaction, explosion state machine, light path and diagnostics.
   ========================================================================= */
(function () {
  'use strict';

  const DATA = window.CAM6D_DATA;
  const CAM = window.CAM;
  const TAU = Math.PI * 2;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  };
  const damp = (v, target, lambda, dt) => v + (target - v) * (1 - Math.exp(-lambda * dt));
  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  const state = {
    progress: 0,
    playing: false,
    direction: 1,
    reassembling: false,
    speed: 0.16,
    speedScale: 1,
    selectedId: null,
    hoveredId: null,
    hidden: new Set(),
    isolatedId: null,
    labels: true,
    autoRotate: false,
    section: { enabled: false, axis: 'z', offset: 2.6, flip: false },
    light: { enabled: false, showView: true, showTake: false },
    flash: { up: false, firing: false, t: 0, intensity: 0 },
    dock: null,
    fire: { active: false, t: 0, mirror: 0, shutter: 0, flash: 0, hold: false, holdT: 0 },
    view: 'hero',
    filter: 'all',
    time: 0,
    testing: false,
    diagOpen: false,
    lastPercent: -1,
    lastSlider: -1
  };

  const dom = {};
  let scene;
  let camera;
  let renderer;
  let pmrem;
  let envRT;
  let model;
  let rig;
  let lightPath;
  let sectionPlane;
  let sectionHelper;
  let sectionHelperMat;
  let sensorLight;
  let sectionLight;
  let sectionFill;
  let flashLight;
  let raycaster;
  let clock;
  let allMaterials = [];
  let stageRect = { width: 1, height: 1 };
  let pointerMap = new Map();
  let drag = {
    active: false,
    mode: 'rotate',
    moved: 0,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    pinch: 0,
    midX: 0,
    midY: 0
  };

  const orbit = {
    theta: 0.95,
    phi: 1.18,
    zoom: 1,
    tTheta: 0.95,
    tPhi: 1.18,
    tZoom: 1,
    panX: 0,
    panY: 0,
    panZ: 0,
    tPanX: 0,
    tPanY: 0,
    tPanZ: 0,
    target: new THREE.Vector3(0.4, 1.2, 0),
    currentTarget: new THREE.Vector3(0.4, 1.2, 0)
  };

  const tempV = new THREE.Vector3();
  const tempV2 = new THREE.Vector3();
  const tempQ = new THREE.Quaternion();
  const upAxis = new THREE.Vector3(0, 1, 0);

  /* -----------------------------------------------------------------------
     BOOT + SCENE
     ----------------------------------------------------------------------- */

  function cacheDom() {
    dom.stage = $('#stage');
    dom.stageWrap = $('#stageWrap');
    dom.boot = $('#boot');
    dom.bootBar = $('#bootBar');
    dom.bootStatus = $('#bootStatus');
    dom.leftPanel = $('#leftPanel');
    dom.rightPanel = $('#rightPanel');
    dom.partList = $('#partList');
    dom.partCount = $('#partCount');
    dom.filterRow = $('#filterRow');
    dom.detailContent = $('#detailContent');
    dom.detailIndex = $('#detailIndex');
    dom.detailScroll = $('#detailScroll');
    dom.labelLayer = $('#labelLayer');
    dom.leaderLayer = $('#leaderLayer');
    dom.reticle = $('#reticle');
    dom.progressRange = $('#progressRange');
    dom.progressValue = $('#progressValue');
    dom.progressFill = $('#progressFill');
    dom.meterFill = $('#meterFill');
    dom.stageName = $('#stageName');
    dom.playState = $('#playState');
    dom.hudProgress = $('#hudProgress');
    dom.selectedStrip = $('#selectedStrip');
    dom.toast = $('#toast');
    dom.sectionPanel = $('#sectionPanel');
    dom.lightPanel = $('#lightPanel');
    dom.diagPanel = $('#diagPanel');
    dom.diagResults = $('#diagResults');
    dom.diagSummary = $('#diagSummary');
    dom.sectionOffset = $('#sectionOffset');
    dom.sectionValue = $('#sectionValue');
    dom.btnSection = $('#btnSection');
    dom.btnLight = $('#btnLight');
    dom.btnFlash = $('#btnFlash');
    dom.flashPanel = $('#flashPanel');
    dom.btnFlashToggle = $('#btnFlashToggle');
    dom.btnFlashFire = $('#btnFlashFire');
    dom.btnFlashClose = $('#flashClose');
    dom.flashState = $('#flashState');
    dom.flashBurst = $('#flashBurst');
    dom.btnLabels = $('#btnLabels');
    dom.btnRotate = $('#btnRotate');
    dom.btnDiag = $('#btnDiagnose');
    dom.btnGuide = $('#btnGuide');
    dom.btnPartsMobile = $('#btnPartsMobile');
    dom.btnDetailsMobile = $('#btnDetailsMobile');
    dom.drawerScrim = $('#drawerScrim');
    dom.guideModal = $('#guideModal');
    dom.viewButtons = $$('#viewButtons [data-view]');
    dom.speedButtons = $$('#speedButtons [data-speed]');
    dom.presetButtons = $$('#presetButtons [data-preset]');
    dom.filterButtons = $$('#filterRow [data-filter]');
    dom.btnStart = $('#btnStart');
    dom.btnPause = $('#btnPause');
    dom.btnReverse = $('#btnReverse');
    dom.btnReassemble = $('#btnReassemble');
    dom.zoomIn = $('#zoomIn');
    dom.zoomOut = $('#zoomOut');
    dom.btnAllVisible = $('#btnAllVisible');
    dom.btnRunTest = $('#btnRunTest');
    dom.btnFire = $('#btnFire');
    dom.lightView = $('#lightViewToggle');
    dom.lightTake = $('#lightTakeToggle');
  }

  function initRenderer() {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile() ? 1.8 : 2));
    renderer.setSize(dom.stage.clientWidth || 1, dom.stage.clientHeight || 1, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.03;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    dom.stage.appendChild(renderer.domElement);
  }

  function initScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03070f, 0.0065);
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 260);

    pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = CAM.textures.environment;
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    envRT = pmrem.fromEquirectangular(envTex);
    scene.environment = envRT.texture;

    const hemi = new THREE.HemisphereLight(0xffe7b0, 0x1a1208, 0.5);
    scene.add(hemi);

    const key = new THREE.SpotLight(0xfff8ee, 4.0, 120, 0.55, 0.85, 2);
    key.position.set(16, 22, 20);
    key.target.position.set(0, 1.5, 0);
    key.castShadow = true;
    key.shadow.mapSize.set(isMobile() ? 1024 : 2048, isMobile() ? 1024 : 2048);
    key.shadow.bias = -0.0006;
    key.shadow.camera.near = 2;
    key.shadow.camera.far = 90;
    scene.add(key, key.target);

    const fill = new THREE.SpotLight(0xffc46b, 1.4, 100, 0.62, 0.9, 2);
    fill.position.set(-18, 9, 16);
    fill.target.position.set(0, 1, 0);
    scene.add(fill, fill.target);

    const rim = new THREE.SpotLight(0xffd98a, 2.6, 100, 0.58, 0.9, 2);
    rim.position.set(-10, 16, -22);
    rim.target.position.set(0, 2, 0);
    scene.add(rim, rim.target);

    const edge = new THREE.SpotLight(0xffe6b0, 2.8, 90, 0.3, 0.78, 2);
    edge.position.set(13, 7, -12);
    edge.target.position.set(0, 2, 0);
    scene.add(edge, edge.target);

    const cool = new THREE.PointLight(0xffd89b, 1.2, 80, 2);
    cool.position.set(0, 20, 2);
    scene.add(cool);

    const front = new THREE.PointLight(0xffb85c, 0.7, 60, 2);
    front.position.set(0, 6, 22);
    scene.add(front);

    scene.add(new THREE.AmbientLight(0x2a1c0d, 0.48));
  }

  function buildWorld() {
    model = CAM.buildModel();
    scene.add(model.modelGroup);

    rig = CAM.buildDisplayRig();
    rig.group.position.y = -6.0;
    scene.add(rig.group);
    scene.add(rig.scanGroup);
    scene.add(rig.particles);
    scene.add(rig.violetParticles);

    createLightPath();
    createSectionHelper();

    sensorLight = new THREE.PointLight(0xffd37a, 0, 22, 2);
    scene.add(sensorLight);
    sectionLight = new THREE.PointLight(0xffe0a0, 0, 30, 1.6);
    sectionLight.position.set(0.9, 2.2, 1.0);
    scene.add(sectionLight);
    sectionFill = new THREE.PointLight(0xd4a23a, 0, 26, 1.8);
    sectionFill.position.set(-2.4, -0.5, 0.6);
    scene.add(sectionFill);
    flashLight = new THREE.PointLight(0xffc46b, 0, 26, 2);
    flashLight.position.set(0.9, 7.4, -1.3);
    scene.add(flashLight);

    allMaterials = [];
    const seen = new Set();
    model.parts.forEach((part) => {
      part.materials.forEach((mat) => {
        if (mat && !seen.has(mat)) {
          seen.add(mat);
          allMaterials.push(mat);
        }
      });
      part.edges.forEach((edge) => {
        if (edge.mat && !seen.has(edge.mat)) {
          seen.add(edge.mat);
          allMaterials.push(edge.mat);
        }
      });
    });
  }

  /* -----------------------------------------------------------------------
     SECTION / CLIPPING
     ----------------------------------------------------------------------- */

  function makeSectionTexture() {
    return CAM.modelUtils.canvasTexture(512, 512, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      ctx.fillStyle = 'rgba(154,116,34,0.055)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(240,206,110,0.56)';
      ctx.lineWidth = 1;
      for (let r = 24; r < w * 0.64; r += 28) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, TAU);
        ctx.stroke();
      }
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * TAU;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16);
        ctx.lineTo(cx + Math.cos(a) * w * 0.62, cy + Math.sin(a) * w * 0.62);
        ctx.stroke();
      }
    });
  }

  function createSectionHelper() {
    const tex = makeSectionTexture();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    sectionHelperMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false
    });
    sectionHelper = new THREE.Group();
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(30, 23), sectionHelperMat);
    sectionHelper.add(plane);
    sectionHelper.visible = false;
    scene.add(sectionHelper);
    sectionPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  }

  function initClipping() {
    allMaterials.forEach((mat) => {
      mat.clippingPlanes = [sectionPlane];
      mat.needsUpdate = true;
    });
  }

  function applySection(force = false) {
    const sec = state.section;
    sectionHelper.visible = sec.enabled;
    if (!sec.enabled) {
      sectionPlane.normal.set(0, 0, -1);
      sectionPlane.constant = 1000;
    } else {
      let nx = 0;
      let ny = 0;
      let nz = 0;
      if (sec.axis === 'x') nx = -1;
      else if (sec.axis === 'y') ny = -1;
      else nz = -1;
      if (sec.flip) {
        nx *= -1;
        ny *= -1;
        nz *= -1;
      }
      sectionPlane.normal.set(nx, ny, nz);
      sectionPlane.constant = sec.flip ? -sec.offset : sec.offset;

      if (sec.axis === 'x') {
        sectionHelper.position.set(sec.offset, 5.0, 0);
        sectionHelper.rotation.set(0, Math.PI / 2, 0);
      } else if (sec.axis === 'y') {
        sectionHelper.position.set(0.5, sec.offset, 0);
        sectionHelper.rotation.set(-Math.PI / 2, 0, 0);
      } else {
        sectionHelper.position.set(0.5, 5.0, sec.offset);
        sectionHelper.rotation.set(0, 0, 0);
      }
    }

    document.body.classList.toggle('section-on', sec.enabled);
    if (dom.btnSection) dom.btnSection.classList.toggle('is-on', sec.enabled);
    if (sectionLight) sectionLight.intensity = sec.enabled ? 3.8 : 0;
    if (sectionFill) sectionFill.intensity = sec.enabled ? 1.8 : 0;
    if (dom.sectionOffset) dom.sectionOffset.value = String(sec.offset);
    if (dom.sectionValue) dom.sectionValue.textContent = `${sec.offset.toFixed(1)} cm`;
    $$('#sectionAxis [data-axis]').forEach((b) => b.classList.toggle('is-active', b.dataset.axis === sec.axis));
    const presets = [
      ['box', 'z', 2.6],
      ['shutter', 'z', 0.6],
      ['cmos', 'z', 0.2],
      ['frame', 'x', 0]
    ];
    let activeCross = '';
    presets.forEach(([name, axis, offset]) => {
      if (sec.axis === axis && Math.abs(sec.offset - offset) < 0.03) activeCross = name;
    });
    $$('#sectionPresets [data-cross]').forEach((b) => b.classList.toggle('is-active', b.dataset.cross === activeCross));
    const flip = $('#sectionFlip');
    if (flip) flip.classList.toggle('is-on', sec.flip);
    updateDock();
  }

  function setSectionEnabled(enabled, options = {}) {
    if (enabled && isMobile() && state.light.enabled) setLightEnabled(false);
    state.section.enabled = !!enabled;
    if (enabled) state.dock = 'section';
    else if (state.dock === 'section') state.dock = null;
    if (options.axis) state.section.axis = options.axis;
    if (options.offset != null) state.section.offset = clamp(options.offset, -7, 7);
    if (options.flip != null) state.section.flip = !!options.flip;
    applySection(true);
    if (!state.testing) {
      showToast(state.section.enabled ? '剖切已开启 · 拖动偏移量观察内部结构' : '剖切已关闭');
    }
  }

  /* -----------------------------------------------------------------------
     LIGHT PATH
     ----------------------------------------------------------------------- */

  function makePath(color, glowColor, segments, pulses, radius = 0.024) {
    const group = new THREE.Group();
    group.renderOrder = 30;
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    });
    const glowMat = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    });
    const coreGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true);
    const glowGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true);
    const segs = [];
    for (let i = 0; i < segments; i += 1) {
      const core = new THREE.Mesh(coreGeo, mat);
      core.scale.set(radius, 1, radius);
      core.renderOrder = 31;
      group.add(core);
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.scale.set(radius * 4.2, 1, radius * 4.2);
      glow.renderOrder = 30;
      group.add(glow);
      segs.push({ core, glow });
    }
    const nodeMat = new THREE.MeshBasicMaterial({
      color: 0xfff6dd,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    });
    const nodeGlowMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    });
    const nodes = [];
    for (let i = 0; i < segments; i += 1) {
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), nodeMat);
      node.renderOrder = 32;
      group.add(node);
      const g = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), nodeGlowMat);
      g.renderOrder = 31;
      group.add(g);
      nodes.push({ node, glow: g });
    }
    const lastNode = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), nodeMat);
    lastNode.renderOrder = 32;
    group.add(lastNode);

    const arrowMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    });
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 12), arrowMat);
    arrow.renderOrder = 33;
    group.add(arrow);

    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xfff2cc,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    });
    const pulseList = [];
    for (let i = 0; i < pulses; i += 1) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), pulseMat);
      p.renderOrder = 34;
      group.add(p);
      pulseList.push({ mesh: p, offset: i / pulses, speed: 0.22 + i * 0.035 });
    }

    group.visible = false;
    scene.add(group);
    return {
      group,
      segments: segs,
      nodes,
      lastNode,
      arrow,
      pulses: pulseList,
      mats: [mat, glowMat, nodeMat, nodeGlowMat, arrowMat, pulseMat],
      baseOpacity: [1.0, 0.22, 0.95, 0.3, 0.9, 0.95],
      radius
    };
  }

  function createLightPath() {
    lightPath = {
      view: makePath(0xffe3a4, 0xd4a23a, 4, 4, 0.046),
      take: makePath(0xffb347, 0xff7a1a, 1, 3, 0.055)
    };
  }

  function setSegment(seg, a, b, radius) {
    const dir = tempV.copy(b).sub(a);
    const len = dir.length();
    if (!Number.isFinite(len) || len < 0.0005) {
      seg.core.visible = false;
      seg.glow.visible = false;
      return;
    }
    const mid = tempV2.copy(a).add(b).multiplyScalar(0.5);
    tempQ.setFromUnitVectors(upAxis, dir.normalize());
    seg.core.position.copy(mid);
    seg.core.quaternion.copy(tempQ);
    seg.core.scale.set(radius, len, radius);
    seg.core.visible = true;
    seg.glow.position.copy(mid);
    seg.glow.quaternion.copy(tempQ);
    seg.glow.scale.set(radius * 4.3, len, radius * 4.3);
    seg.glow.visible = true;
  }

  function samplePolyline(points, t) {
    let total = 0;
    const lengths = [];
    for (let i = 0; i < points.length - 1; i += 1) {
      const l = points[i].distanceTo(points[i + 1]);
      lengths.push(l);
      total += l;
    }
    let d = clamp(t, 0, 0.99999) * total;
    for (let i = 0; i < lengths.length; i += 1) {
      if (d <= lengths[i] || i === lengths.length - 1) {
        const local = lengths[i] > 0.0001 ? d / lengths[i] : 0;
        return tempV.copy(points[i]).lerp(points[i + 1], local);
      }
      d -= lengths[i];
    }
    return tempV.copy(points[points.length - 1]);
  }

  function updatePath(path, points, intensity) {
    const visible = intensity > 0.015;
    path.group.visible = visible;
    if (!visible) return;
    path.group.updateMatrixWorld();
    for (let i = 0; i < path.segments.length; i += 1) {
      setSegment(path.segments[i], points[i], points[i + 1], path.radius);
    }
    for (let i = 0; i < path.nodes.length; i += 1) {
      const p = points[i];
      path.nodes[i].node.position.copy(p);
      path.nodes[i].glow.position.copy(p);
      const pulse = 0.9 + Math.sin(state.time * 4 + i) * 0.12;
      path.nodes[i].glow.scale.setScalar(pulse);
    }
    path.lastNode.position.copy(points[points.length - 1]);
    const dir = tempV.copy(points[points.length - 1]).sub(points[points.length - 2]);
    const len = dir.length();
    if (len > 0.001) {
      dir.normalize();
      path.arrow.position.copy(points[points.length - 1]).addScaledVector(dir, -0.16);
      path.arrow.quaternion.setFromUnitVectors(upAxis, dir);
      path.arrow.visible = true;
    } else {
      path.arrow.visible = false;
    }
    path.pulses.forEach((p, i) => {
      const t = (state.time * p.speed + p.offset) % 1;
      const pos = samplePolyline(points, t);
      p.mesh.position.copy(pos);
      p.mesh.scale.setScalar(0.75 + Math.sin(state.time * 8 + i) * 0.25);
    });
    const fade = path === lightPath.take ? 1 : (1 - state.fire.mirror * 0.96);
    path.mats.forEach((mat, i) => {
      mat.opacity = path.baseOpacity[i] * intensity * (i < 2 ? fade : 1);
    });
  }

  function updateLightPath() {
    if (!lightPath) return;
    model.modelGroup.updateMatrixWorld(true);
    const entry = model.anchors.entry.getWorldPosition(new THREE.Vector3());
    const mirror = model.anchors.mirror.getWorldPosition(new THREE.Vector3());
    const screen = model.anchors.screen.getWorldPosition(new THREE.Vector3());
    const prism = model.anchors.prism.getWorldPosition(new THREE.Vector3());
    const eyepiece = model.anchors.eyepiece.getWorldPosition(new THREE.Vector3());
    const sensor = model.anchors.sensor.getWorldPosition(new THREE.Vector3());

    const viewIntensity = state.light.enabled && state.light.showView ? 0.88 : 0;
    const takingIntensity = state.light.enabled
      ? Math.max(state.light.showTake ? 0.42 : 0, state.fire.active ? 0.95 : 0)
      : 0;

    updatePath(lightPath.view, [entry, mirror, screen, prism, eyepiece], viewIntensity);
    updatePath(lightPath.take, [entry, sensor], takingIntensity);

    if (sensorLight) {
      sensorLight.position.copy(sensor);
      sensorLight.intensity = state.light.enabled ? 2.8 * state.fire.flash : 0;
    }
  }

  function setLightEnabled(enabled) {
    if (enabled && isMobile() && state.section.enabled) setSectionEnabled(false);
    state.light.enabled = !!enabled;
    if (enabled) state.dock = 'light';
    else if (state.dock === 'light') state.dock = null;
    if (!state.light.enabled) {
      state.light.showTake = false;
      cancelFire(false);
    }
    if (dom.btnLight) dom.btnLight.classList.toggle('is-on', state.light.enabled);
    if (dom.lightView) dom.lightView.classList.toggle('is-on', state.light.showView);
    if (dom.lightTake) dom.lightTake.classList.toggle('is-on', state.light.showTake);
    document.body.classList.toggle('light-on', state.light.enabled);
    if (!state.light.enabled) {
      lightPath.view.group.visible = false;
      lightPath.take.group.visible = false;
    }
    updateDock();
    if (!state.testing) {
      showToast(state.light.enabled ? '光路显示已开启 · 香槟金为取景光路' : '光路显示已关闭');
    }
  }

  function setLightTake(show) {
    state.light.showTake = !!show;
    if (dom.lightTake) dom.lightTake.classList.toggle('is-on', state.light.showTake);
  }

  function updateDock() {
    const dock = state.dock;
    if (dom.sectionPanel) dom.sectionPanel.hidden = !(state.section.enabled && dock === 'section');
    if (dom.lightPanel) dom.lightPanel.hidden = !(state.light.enabled && dock === 'light');
    if (dom.flashPanel) dom.flashPanel.hidden = dock !== 'flash';
    if (dom.btnSection) {
      dom.btnSection.classList.toggle('is-active', dock === 'section');
      dom.btnSection.classList.toggle('is-on', state.section.enabled);
    }
    if (dom.btnLight) {
      dom.btnLight.classList.toggle('is-active', dock === 'light');
      dom.btnLight.classList.toggle('is-on', state.light.enabled);
    }
    if (dom.btnFlash) {
      dom.btnFlash.classList.toggle('is-active', dock === 'flash');
      dom.btnFlash.classList.toggle('is-on', state.flash.up);
    }
    document.body.classList.toggle('dock-open', !!dock);
  }

  function activateDock(name) {
    if (name === 'section') {
      if (!state.section.enabled) setSectionEnabled(true);
      state.dock = 'section';
      applySection(false);
    } else if (name === 'light') {
      if (!state.light.enabled) setLightEnabled(true);
      state.dock = 'light';
      updateDock();
    } else {
      state.dock = 'flash';
      updateDock();
    }
    updateFlashUI();
  }

  function flashModule() {
    return model && model.byId.topShell ? model.byId.topShell.flash : null;
  }

  function updateFlashUI() {
    if (dom.btnFlashToggle) dom.btnFlashToggle.textContent = state.flash.up ? '收回闪光灯' : '升起闪光灯';
    if (dom.flashState) {
      dom.flashState.textContent = state.flash.firing ? '闪光中' : state.flash.up ? '已升起' : '已收起';
      dom.flashState.classList.toggle('is-up', state.flash.up);
      dom.flashState.classList.toggle('is-firing', state.flash.firing);
    }
    if (dom.btnFlash) dom.btnFlash.classList.toggle('is-on', state.flash.up || state.dock === 'flash');
    if (dom.btnFlashFire) dom.btnFlashFire.disabled = false;
  }

  function setFlashUp(up, silent = false) {
    const fp = flashModule();
    if (!fp) return;
    state.flash.up = !!up;
    if (state.flash.up) {
      fp.group.visible = true;
      state.dock = 'flash';
      updateDock();
    } else {
      state.flash.firing = false;
    }
    updateFlashUI();
    if (!silent) showToast(state.flash.up ? '内置闪光灯已升起' : '内置闪光灯已收回');
  }

  function fireFlash() {
    const fp = flashModule();
    if (!fp) return;
    if (!state.flash.up) setFlashUp(true, true);
    state.flash.firing = true;
    state.flash.t = 0;
    updateFlashUI();
    showToast('内置闪光灯 · 单次闪光');
  }

  function updateFlash(dt) {
    const fp = flashModule();
    if (!fp) return;
    const f = state.flash;
    const targetY = f.up ? fp.upY : fp.baseY;
    fp.group.position.y = damp(fp.group.position.y, targetY, 11, dt);
    fp.group.rotation.x = damp(fp.group.rotation.x, f.up ? -0.18 : 0, 10, dt);
    if (f.up) fp.group.visible = true;
    else if (Math.abs(fp.group.position.y - fp.baseY) < 0.01) fp.group.visible = false;

    if (f.firing) {
      f.t += dt;
      const env = clamp(1 - f.t / 0.5, 0, 1);
      f.intensity = env * env;
      if (f.t > 0.6) {
        f.firing = false;
        updateFlashUI();
      }
    } else {
      f.intensity = damp(f.intensity, 0, 10, dt);
    }

    if (flashLight) {
      fp.group.getWorldPosition(tempV);
      flashLight.position.copy(tempV);
      flashLight.intensity = f.intensity * 24 + (f.up ? 0.18 : 0);
    }
    if (fp.glassMat) fp.glassMat.emissiveIntensity = 0.22 + f.intensity * 4.8;
    if (dom.flashBurst) dom.flashBurst.style.opacity = String(f.intensity * 0.42);
  }

  function triggerFire() {
    if (!state.light.enabled) setLightEnabled(true);
    state.fire.active = true;
    state.fire.hold = false;
    state.fire.holdT = 0;
    state.fire.t = 0;
    state.fire.mirror = 0;
    state.fire.shutter = 0;
    state.fire.flash = 0;
    if (!state.testing) showToast('快门释放 · 反光镜抬起 / 帘幕开启');
  }

  function resetFireDemo() {
    const mirror = model.byId.mirror;
    const shutter = model.byId.shutterCurtains;
    if (mirror && mirror.holder) mirror.holder.rotation.x = 0;
    if (shutter && shutter.curtains) {
      shutter.curtains.upper.group.position.y = shutter.curtains.upper.base;
      shutter.curtains.lower.group.position.y = shutter.curtains.lower.base;
    }
    if (model.byId.sensor && model.byId.sensor.cmosMat) {
      model.byId.sensor.cmosMat.emissiveIntensity = model.byId.sensor.cmosMat.userData.baseEmissiveIntensity || 0;
    }
    model.parts.forEach((part) => {
      part.gears.forEach((gear) => {
        gear.group.rotation.x = gear.base.x;
      });
    });
    state.fire.mirror = 0;
    state.fire.shutter = 0;
    state.fire.flash = 0;
  }

  function cancelFire(show = true) {
    if (!state.fire.active) return;
    state.fire.active = false;
    state.fire.hold = false;
    state.fire.t = 0;
    resetFireDemo();
    if (show && !state.testing) showToast('快门演示已停止');
  }

  function updateFire(dt) {
    if (!state.fire.active) return;
    const f = state.fire;
    const hold = f.hold && Number.isFinite(f.holdT);
    if (!hold) f.t += dt;
    const t = hold ? f.holdT : f.t;
    const up = smooth(clamp((t - 0.02) / 0.34, 0, 1));
    const down = smooth(clamp((t - 1.58) / 0.38, 0, 1));
    const mirrorMix = up * (1 - down);
    const open = smooth(clamp((t - 0.44) / 0.22, 0, 1));
    const close = smooth(clamp((t - 1.38) / 0.26, 0, 1));
    const shutterMix = open * (1 - close);
    const flash = Math.exp(-Math.pow((t - 0.74) / 0.18, 2));
    f.mirror = mirrorMix;
    f.shutter = shutterMix;
    f.flash = flash;

    const mirror = model.byId.mirror;
    if (mirror && mirror.holder) mirror.holder.rotation.x = -Math.PI / 4 * mirrorMix;

    const shutter = model.byId.shutterCurtains;
    if (shutter && shutter.curtains) {
      shutter.curtains.upper.group.position.y = shutter.curtains.upper.base + 1.34 * shutterMix;
      shutter.curtains.lower.group.position.y = shutter.curtains.lower.base - 1.34 * shutterMix;
    }

    const sensor = model.byId.sensor;
    if (sensor && sensor.cmosMat) {
      sensor.cmosMat.emissiveIntensity = (sensor.cmosMat.userData.baseEmissiveIntensity || 0) + flash * 2.4;
    }

    const drive = model.byId.shutterDrive;
    if (drive) {
      drive.gears.forEach((gear) => {
        gear.group.rotation.x = gear.base.x + t * gear.speed * (0.7 + shutterMix * 2.6);
      });
    }

    if (!hold && t > 2.55) {
      state.fire.active = false;
      state.fire.t = 0;
      resetFireDemo();
      if (!state.testing) showToast('曝光完成 · 反光镜回位 / 帘幕复位');
    }
  }

  /* -----------------------------------------------------------------------
     EXPLOSION STATE MACHINE
     ----------------------------------------------------------------------- */

  function windowEase(p, start, end) {
    if (end <= start) return p >= end ? 1 : 0;
    return smooth((p - start) / (end - start));
  }

  function applyExplosion() {
    const p = state.progress;
    model.parts.forEach((part) => {
      const e = windowEase(p, part.stage[0], part.stage[1]);
      part.e = e;
      part.root.position.copy(part.center).addScaledVector(part.explode, e);
      part.root.rotation.set(
        part.baseRot.x + part.explodeRot.x * e,
        part.baseRot.y + part.explodeRot.y * e,
        part.baseRot.z + part.explodeRot.z * e
      );
      if (part.screws.length) {
        const fan = smooth(e);
        part.screws.forEach((screw) => {
          screw.group.position.copy(screw.base).addScaledVector(screw.dir, fan * 1.15);
          screw.group.quaternion.copy(screw.baseQuat);
          screw.group.rotateY(fan * screw.spin * TAU * 1.5);
        });
      }
    });

    const lift = smooth(p);
    rig.group.position.y = -6.0 - 6.0 * lift;
    rig.scanGroup.position.y = -6.0 + ((state.time * 0.11) % 1) * (22 + 6 * lift);
    updateProgressUI();
    updateDetailLive();
    updateLightPath();
  }

  function stepSimulation(dt) {
    if (!state.playing) return;
    const delta = state.speed * state.speedScale * dt;
    if (state.direction > 0) {
      state.progress += delta;
      if (state.progress >= 1) {
        state.progress = 1;
        state.playing = false;
        state.direction = 1;
        if (state.reassembling) state.reassembling = false;
        if (!state.testing) showToast('已到达完全分解状态');
      }
    } else {
      state.progress -= delta;
      if (state.progress <= 0) {
        state.progress = 0;
        state.playing = false;
        state.direction = 1;
        if (state.reassembling) {
          state.reassembling = false;
          if (!state.testing) showToast('重新装配完成 · 全机 0%');
        } else if (!state.testing) {
          showToast('已回到完整装配状态');
        }
      }
    }
    applyExplosion();
  }

  function setProgress(value, options = {}) {
    if (options.pause !== false) {
      state.playing = false;
      state.direction = 1;
      state.reassembling = false;
    }
    state.progress = clamp(value, 0, 1);
    if (state.progress <= 0.0001) state.progress = 0;
    if (state.progress >= 0.9999) state.progress = 1;
    applyExplosion();
    updateButtons();
  }

  function play(direction = 1) {
    if (direction > 0) {
      if (state.progress >= 0.9999) setProgress(0, { pause: false });
      state.direction = 1;
    } else {
      if (state.progress <= 0.0001) setProgress(1, { pause: false });
      state.direction = -1;
    }
    state.playing = true;
    state.reassembling = false;
    updateButtons();
    if (!state.testing) showToast(direction > 0 ? '开始拆解 · 零件按层级展开' : '反向播放 · 从完全分解开始装配');
  }

  function pause(show = true) {
    const wasPlaying = state.playing;
    state.playing = false;
    state.direction = 1;
    state.reassembling = false;
    updateButtons();
    if (show && !state.testing) showToast(wasPlaying ? '动画已暂停' : '动画已处于暂停状态');
  }

  function reassemble() {
    state.hidden.clear();
    state.isolatedId = null;
    state.selectedId = null;
    setSectionEnabled(false);
    setLightEnabled(false);
    setFlashUp(false, true);
    state.dock = null;
    updateDock();
    applyVisibility();
    applyHighlight();
    renderDetail(null);
    if (state.progress <= 0.0001) {
      setProgress(0);
      if (!state.testing) showToast('已经是完整装配状态');
      return;
    }
    state.reassembling = true;
    state.direction = -1;
    state.playing = true;
    updateButtons();
    if (!state.testing) showToast('重新装配 · 所有部件回到基准位置');
  }

  function updateProgressUI() {
    const p = state.progress;
    const percent = Math.round(p * 100);
    if (dom.progressValue) dom.progressValue.textContent = `${percent}%`;
    if (dom.hudProgress) dom.hudProgress.textContent = `${String(percent).padStart(2, '0')}%`;
    if (dom.progressFill) dom.progressFill.style.width = `${p * 100}%`;
    if (dom.meterFill) dom.meterFill.style.width = `${p * 100}%`;
    const slider = Math.round(p * 1000);
    if (dom.progressRange && dom.progressRange.value !== String(slider)) dom.progressRange.value = String(slider);
    let stage = DATA.STAGE_LABELS[0];
    DATA.STAGE_LABELS.forEach((s) => {
      if (p + 0.0001 >= s.at) stage = s;
    });
    if (dom.stageName) dom.stageName.textContent = stage.name;
    if (dom.playState) {
      dom.playState.textContent = state.playing
        ? (state.direction > 0 ? '拆解中' : '反向装配')
        : p <= 0.0001
          ? '完整装配'
          : p >= 0.9999
            ? '完全分解'
            : '已暂停';
    }
    if (dom.selectedStrip) {
      const selected = getPart(state.selectedId);
      if (selected) {
        $('.strip-name', dom.selectedStrip).textContent = selected.def.name;
        $('.strip-index', dom.selectedStrip).textContent = selected.no;
        $('.strip-spec', dom.selectedStrip).textContent = `${Math.round(selected.e * 100)}% / ${selected.def.en}`;
      } else {
        $('.strip-name', dom.selectedStrip).textContent = '未选择部件';
        $('.strip-index', dom.selectedStrip).textContent = '--';
        $('.strip-spec', dom.selectedStrip).textContent = 'CLICK A COMPONENT';
      }
    }
    state.lastPercent = percent;
    state.lastSlider = slider;
    updateButtons();
  }

  function updateButtons() {
    if (dom.btnStart) {
      dom.btnStart.classList.toggle('is-active', state.playing && state.direction > 0);
      const label = $('em', dom.btnStart);
      if (label) {
        label.textContent = state.progress >= 0.9999
          ? '重新拆解'
          : state.progress > 0.001 && !state.playing
            ? '继续拆解'
            : '开始拆解';
      }
    }
    if (dom.btnPause) dom.btnPause.classList.toggle('is-active', !state.playing && state.progress > 0.0001 && state.progress < 0.9999);
    if (dom.btnReverse) dom.btnReverse.classList.toggle('is-active', state.playing && state.direction < 0);
    if (dom.btnReassemble) dom.btnReassemble.classList.toggle('is-active', state.reassembling);
    $$('#presetButtons [data-preset]').forEach((b) => {
      b.classList.toggle('is-active', Math.abs(Number(b.dataset.preset) / 100 - state.progress) < 0.002);
    });
  }

  /* -----------------------------------------------------------------------
     CAMERA + ORBIT
     ----------------------------------------------------------------------- */

  function baseRadius() {
    return isMobile() ? 48 + 28 * smooth(state.progress) : 31.5 + 24 * smooth(state.progress);
  }

  function baseTargetY() {
    return 1.35 + 2.7 * smooth(state.progress);
  }

  function getDesiredTarget() {
    return tempV.set(0.4 + orbit.panX, baseTargetY() + orbit.panY, orbit.panZ);
  }

  function updateCamera(dt) {
    if (state.autoRotate && !drag.active) orbit.tTheta += dt * 0.1;
    orbit.theta = damp(orbit.theta, orbit.tTheta, 8, dt);
    orbit.phi = damp(orbit.phi, orbit.tPhi, 8, dt);
    orbit.zoom = damp(orbit.zoom, orbit.tZoom, 8, dt);
    orbit.panX = damp(orbit.panX, orbit.tPanX, 8, dt);
    orbit.panY = damp(orbit.panY, orbit.tPanY, 8, dt);
    orbit.panZ = damp(orbit.panZ, orbit.tPanZ, 8, dt);

    const desired = getDesiredTarget();
    orbit.currentTarget.x = damp(orbit.currentTarget.x, desired.x, 8, dt);
    orbit.currentTarget.y = damp(orbit.currentTarget.y, desired.y, 8, dt);
    orbit.currentTarget.z = damp(orbit.currentTarget.z, desired.z, 8, dt);

    const radius = baseRadius() * orbit.zoom;
    const sinPhi = Math.sin(orbit.phi);
    camera.position.set(
      orbit.currentTarget.x + sinPhi * Math.sin(orbit.theta) * radius,
      orbit.currentTarget.y + Math.cos(orbit.phi) * radius,
      orbit.currentTarget.z + sinPhi * Math.cos(orbit.theta) * radius
    );
    camera.lookAt(orbit.currentTarget);
  }

  function setView(name, silent = false) {
    state.view = name;
    const mobile = isMobile();
    if (name === 'front') {
      orbit.tTheta = 0;
      orbit.tPhi = 1.36;
      orbit.tZoom = mobile ? 0.9 : 0.82;
    } else if (name === 'back') {
      orbit.tTheta = Math.PI;
      orbit.tPhi = 1.36;
      orbit.tZoom = mobile ? 0.9 : 0.82;
    } else if (name === 'top') {
      orbit.tTheta = 0;
      orbit.tPhi = 0.18;
      orbit.tZoom = mobile ? 0.95 : 0.86;
    } else if (name === 'left') {
      orbit.tTheta = -Math.PI / 2;
      orbit.tPhi = 1.28;
      orbit.tZoom = mobile ? 0.95 : 0.88;
    } else if (name === 'right') {
      orbit.tTheta = Math.PI / 2;
      orbit.tPhi = 1.28;
      orbit.tZoom = mobile ? 0.95 : 0.88;
    } else {
      orbit.tTheta = 0.95;
      orbit.tPhi = 1.18;
      orbit.tZoom = 1;
    }
    if (name === 'hero') {
      orbit.tPanX = 0;
      orbit.tPanY = 0;
      orbit.tPanZ = 0;
    }
    dom.viewButtons.forEach((b) => b.classList.toggle('is-active', b.dataset.view === name));
    if (!silent && !state.testing) showToast(`视角：${viewLabel(name)}`);
  }

  function viewLabel(name) {
    return ({
      hero: '立体',
      front: '正面',
      back: '背面',
      top: '顶部',
      left: '左侧',
      right: '右侧'
    })[name] || name;
  }

  function focusPart(part) {
    if (!part) return;
    model.modelGroup.updateMatrixWorld(true);
    const target = part.root.getWorldPosition(new THREE.Vector3());
    const base = new THREE.Vector3(0.4, baseTargetY(), 0);
    orbit.tPanX = target.x - base.x;
    orbit.tPanY = target.y - base.y;
    orbit.tPanZ = target.z - base.z;
    orbit.tZoom = isMobile() ? 0.62 : 0.55;
    showToast(`聚焦：${part.def.name} · 滚轮可继续缩放`);
  }

  function panBy(dx, dy) {
    const radius = baseRadius() * orbit.zoom;
    const scale = radius * 0.00125;
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
    orbit.tPanX += (-right.x * dx + up.x * dy) * scale;
    orbit.tPanY += (-right.y * dx + up.y * dy) * scale;
    orbit.tPanZ += (-right.z * dx + up.z * dy) * scale;
  }

  function zoomBy(factor) {
    orbit.tZoom = clamp(orbit.tZoom * factor, 0.45, 2.8);
  }

  function resize() {
    if (!renderer) return;
    const w = dom.stage.clientWidth || 1;
    const h = dom.stage.clientHeight || 1;
    stageRect = { width: w, height: h };
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile() ? 1.8 : 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* -----------------------------------------------------------------------
     RAYCAST / SELECTION
     ----------------------------------------------------------------------- */

  function partVisible(part) {
    return part.root.visible && !part.hidden;
  }

  function pickAt(clientX, clientY) {
    if (!model) return null;
    const rect = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(model.pickMeshes, false);
    for (let i = 0; i < hits.length; i += 1) {
      const hit = hits[i];
      const id = hit.object.userData.partId;
      const part = getPart(id);
      if (!part || !partVisible(part)) continue;
      if (state.section.enabled && sectionPlane.distanceToPoint(hit.point) < 0) continue;
      return part;
    }
    return null;
  }

  function getPart(id) {
    return id ? model.byId[id] : null;
  }

  function setHovered(id) {
    if (state.hoveredId === id) return;
    state.hoveredId = id;
    applyHighlight();
    document.body.classList.toggle('has-hover', !!id);
  }

  function applyHighlight() {
    if (!model) return;
    model.parts.forEach((part) => {
      const selected = part.id === state.selectedId;
      const hovered = part.id === state.hoveredId;
      part.materials.forEach((mat) => {
        if (!mat || !mat.emissive) return;
        if (selected || hovered) {
          mat.emissive.setHex(selected ? 0x7a5a16 : 0x3a2a08);
          mat.emissiveIntensity = selected ? 0.26 : 0.14;
        } else {
          const base = mat.userData.baseEmissive;
          if (base) mat.emissive.copy(base);
          else mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = mat.userData.baseEmissiveIntensity || 0;
        }
      });
      part.edges.forEach((edge) => {
        edge.mat.opacity = edge.base * (selected ? 5.4 : hovered ? 2.6 : 1);
      });
    });
  }

  function selectPart(id, options = {}) {
    const part = getPart(id);
    if (!part) {
      clearSelection();
      return;
    }
    if (part.hidden) {
      state.hidden.delete(part.id);
      applyVisibility();
    }
    state.selectedId = part.id;
    if (state.isolatedId && state.isolatedId !== part.id) {
      state.isolatedId = part.id;
      applyVisibility();
    }
    applyHighlight();
    refreshList();
    renderDetail(part);
    updateReticle();
    updateSelectedStrip();
    if (options.focus) focusPart(part);
    if (isMobile() && options.openDrawer !== false) openDrawer('right');
  }

  function clearSelection() {
    state.selectedId = null;
    applyHighlight();
    refreshList();
    renderDetail(null);
    updateReticle();
    updateSelectedStrip();
  }

  function toggleHidden(id) {
    const part = getPart(id);
    if (!part) return;
    if (state.hidden.has(id)) state.hidden.delete(id);
    else state.hidden.add(id);
    applyVisibility();
    refreshList();
    if (state.selectedId === id) {
      renderDetail(part);
      updateReticle();
    }
    showToast(state.hidden.has(id) ? `已隐藏：${part.def.name}` : `已显示：${part.def.name}`);
  }

  function toggleIsolate(id) {
    const part = getPart(id);
    if (!part) return;
    state.isolatedId = state.isolatedId === id ? null : id;
    if (state.isolatedId) {
      state.selectedId = id;
      renderDetail(part);
      refreshList();
      showToast(`隔离：${part.def.name}`);
    } else {
      showToast('已退出隔离视图');
    }
    applyVisibility();
    updateReticle();
  }

  function applyVisibility() {
    if (!model) return;
    model.parts.forEach((part) => {
      part.root.visible = !state.hidden.has(part.id) && (!state.isolatedId || state.isolatedId === part.id);
    });
    updateLabels();
    refreshList();
    updateReticle();
    if (state.selectedId && state.hidden.has(state.selectedId)) {
      renderDetail(getPart(state.selectedId));
    }
  }

  function showAllVisible() {
    state.hidden.clear();
    state.isolatedId = null;
    applyVisibility();
    showToast('已显示全部 15 个部件');
  }

  /* -----------------------------------------------------------------------
     UI: PART LIST / DETAIL / LABELS
     ----------------------------------------------------------------------- */

  function buildPartList() {
    const groups = DATA.GROUPS.map((group) => {
      const items = model.parts.filter((p) => p.def.group === group.id);
      if (!items.length) return '';
      return `
        <section class="list-group" data-group="${group.id}">
          <header class="list-group-head">
            <span class="group-index">${group.no}</span>
            <div><b>${group.name}</b><small>${group.en}</small></div>
            <em>${items.length}</em>
          </header>
          ${items.map((part) => `
            <div class="part-row" data-id="${part.id}">
              <button class="row-main" type="button" data-action="select" data-id="${part.id}" aria-label="选择${part.def.name}">
                <span class="row-no">${part.no}</span>
                <span class="row-copy"><b>${part.def.name}</b><small>${part.def.en}</small></span>
                <span class="row-swatch" style="--sw:${DATA.MATERIALS[part.def.mats[0]].swatch}"></span>
              </button>
              <button class="row-icon" type="button" data-action="hide" data-id="${part.id}" title="隐藏 / 显示" aria-label="隐藏或显示${part.def.name}">
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M1.8 10s3-5 8.2-5 8.2 5 8.2 5-3 5-8.2 5S1.8 10 1.8 10Z"/><circle cx="10" cy="10" r="2.4"/></svg>
              </button>
              <button class="row-icon" type="button" data-action="isolate" data-id="${part.id}" title="隔离" aria-label="隔离${part.def.name}">
                <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="5.2"/><path d="M10 1.5v3M10 15.5v3M1.5 10h3M15.5 10h3"/></svg>
              </button>
            </div>
          `).join('')}
        </section>
      `;
    }).join('');
    dom.partList.innerHTML = groups;
    refreshList();
    applyFilter();
  }

  function refreshList() {
    if (!dom.partList) return;
    const rows = $$('.part-row', dom.partList);
    rows.forEach((row) => {
      const id = row.dataset.id;
      const part = getPart(id);
      if (!part) return;
      row.classList.toggle('is-selected', id === state.selectedId);
      row.classList.toggle('is-hidden', state.hidden.has(id));
      row.classList.toggle('is-isolated', state.isolatedId === id);
      row.classList.toggle('is-hovered', id === state.hoveredId);
      const hideBtn = $('[data-action="hide"]', row);
      const isoBtn = $('[data-action="isolate"]', row);
      if (hideBtn) hideBtn.classList.toggle('is-on', state.hidden.has(id));
      if (isoBtn) isoBtn.classList.toggle('is-on', state.isolatedId === id);
    });
    const visible = model.parts.filter((p) => !state.hidden.has(p.id)).length;
    if (dom.partCount) dom.partCount.textContent = String(visible).padStart(2, '0');
  }

  function applyFilter() {
    if (!dom.partList) return;
    $$('.list-group', dom.partList).forEach((group) => {
      group.hidden = state.filter !== 'all' && group.dataset.group !== state.filter;
    });
    dom.filterButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.filter === state.filter));
  }

  function renderDetail(part) {
    if (!part) {
      dom.detailIndex.textContent = `00 / ${String(model.parts.length).padStart(2, '0')}`;
      dom.detailContent.innerHTML = `
        <div class="detail-empty">
          <div class="empty-orbit"><span></span><i></i><b>SELECT</b></div>
          <p class="panel-kicker">COMPONENT DATA</p>
          <h3>选择一个部件</h3>
          <p>点击 3D 模型、左侧列表或悬浮标签，查看结构说明、材质参数与拆解阶段。</p>
          <div class="empty-stats">
            <div><strong>15</strong><span>模型部件</span></div>
            <div><strong>07</strong><span>层级组</span></div>
            <div><strong>26</strong><span>紧固螺钉</span></div>
          </div>
          <p class="empty-note">拖动旋转 · 滚轮缩放 · 右键平移</p>
        </div>
      `;
      return;
    }
    const def = part.def;
    const mats = def.mats.map((key) => ({ key, ...DATA.MATERIALS[key] }));
    dom.detailIndex.textContent = `${part.no} / ${String(model.parts.length).padStart(2, '0')}`;
    dom.detailContent.innerHTML = `
      <div class="detail-hero">
        <div class="detail-hero-top">
          <span class="detail-no">${part.no}</span>
          <span class="detail-group" style="--accent:${part.group.color}">${part.group.name} / ${part.group.en}</span>
          <span class="detail-state ${state.hidden.has(part.id) ? 'is-hidden' : ''}" id="detailHiddenState">${state.hidden.has(part.id) ? 'HIDDEN' : 'VISIBLE'}</span>
        </div>
        <h3>${def.name}</h3>
        <p class="detail-en">${def.en}</p>
        <p class="detail-desc">${def.desc}</p>
        <div class="detail-tags">${def.mats.map((m) => `<span>${DATA.MATERIALS[m].en}</span>`).join('')}</div>
      </div>

      <div class="detail-block">
        <div class="block-head"><span>EXPLOSION PHASE</span><b>${Math.round(def.stage[0] * 100)}% – ${Math.round(def.stage[1] * 100)}%</b></div>
        <div class="detail-progress"><i class="js-detail-fill" style="width:${part.e * 100}%"></i></div>
        <div class="detail-progress-meta"><span class="js-detail-pct">${Math.round(part.e * 100)}%</span><span>${part.e >= 0.999 ? '已完全拆出' : part.e <= 0.001 ? '等待阶段' : '正在移动'}</span></div>
        <div class="detail-actions">
          <button type="button" data-detail="focus">聚焦</button>
          <button type="button" data-detail="hide">${state.hidden.has(part.id) ? '显示' : '隐藏'}</button>
          <button type="button" data-detail="isolate">${state.isolatedId === part.id ? '取消隔离' : '隔离'}</button>
          <button type="button" data-detail="stage">定位阶段</button>
        </div>
      </div>

      <div class="detail-block">
        <div class="block-head"><span>SPECIFICATION</span><b>${def.short}</b></div>
        <dl class="spec-list">${def.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      </div>

      <div class="detail-block material-block">
        <div class="block-head"><span>MATERIAL / 材质</span><b>${mats.length} LAYERS</b></div>
        ${mats.map((m) => `
          <article class="material-card">
            <span class="mat-swatch" style="background:${m.sheen};--sw:${m.swatch}"></span>
            <div class="mat-copy">
              <b>${m.name}</b>
              <small>${m.en}</small>
              <p>${m.note}</p>
              <div class="mat-metrics"><span>METAL ${m.metalness.toFixed(2)}</span><span>ROUGH ${m.roughness.toFixed(2)}</span></div>
            </div>
          </article>
        `).join('')}
      </div>

      <div class="detail-block">
        <div class="block-head"><span>STRUCTURAL NOTE</span><b>${part.group.en}</b></div>
        <p class="detail-note">${def.desc}</p>
      </div>
    `;
  }

  function updateDetailLive() {
    if (!dom.detailContent || !state.selectedId) return;
    const part = getPart(state.selectedId);
    if (!part) return;
    const fill = $('.js-detail-fill', dom.detailContent);
    const pct = $('.js-detail-pct', dom.detailContent);
    if (fill) fill.style.width = `${part.e * 100}%`;
    if (pct) pct.textContent = `${Math.round(part.e * 100)}%`;
  }

  function updateSelectedStrip() {
    updateProgressUI();
  }

  function buildLabels() {
    dom.labelLayer.innerHTML = '';
    dom.leaderLayer.innerHTML = '';
    model.parts.forEach((part) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'part-label';
      el.dataset.id = part.id;
      el.innerHTML = `<span class="pl-no">${part.no}</span><span class="pl-copy"><b>${part.def.name}</b><small>${part.def.en}</small></span>`;
      dom.labelLayer.appendChild(el);
      part.labelEl = el;

      const ns = 'http://www.w3.org/2000/svg';
      const poly = document.createElementNS(ns, 'polyline');
      poly.setAttribute('points', '0,0 0,0 0,0');
      poly.dataset.id = part.id;
      dom.leaderLayer.appendChild(poly);
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('r', '2.4');
      dot.dataset.id = part.id;
      dom.leaderLayer.appendChild(dot);
      part.leaderLine = poly;
      part.leaderDot = dot;
    });
  }

  const labelAnchor = new THREE.Vector3();
  const labelProjected = new THREE.Vector3();

  function updateLabels() {
    if (!dom.labelLayer || !model) return;
    const w = dom.stage.clientWidth;
    const h = dom.stage.clientHeight;
    const mobile = isMobile();
    const show = state.labels;
    const labelWidth = mobile ? 138 : 164;
    const labelHeight = 28;
    const items = [];

    model.parts.forEach((part) => {
      const el = part.labelEl;
      const line = part.leaderLine;
      const dot = part.leaderDot;
      if (!el) return;
      const external = ['mount', 'frontShell', 'backShell', 'topShell', 'bottomShell', 'grip'].includes(part.id);
      const focusLabel = state.selectedId === part.id || state.hoveredId === part.id;
      const visible = show && part.root.visible && !part.hidden
        && (!state.isolatedId || state.isolatedId === part.id)
        && (!mobile || state.selectedId === part.id)
        && (focusLabel || external || part.e > 0.12);

      if (!visible) {
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        line.setAttribute('opacity', '0');
        dot.setAttribute('opacity', '0');
        return;
      }

      const anchor = part.def.anchor || [0, 0, 0];
      labelAnchor.set(anchor[0], anchor[1], anchor[2]);
      part.root.localToWorld(labelAnchor);
      labelProjected.copy(labelAnchor).project(camera);
      if (labelProjected.z > 1 || labelProjected.z < -1) {
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        line.setAttribute('opacity', '0');
        dot.setAttribute('opacity', '0');
        return;
      }
      const sx = (labelProjected.x * 0.5 + 0.5) * w;
      const sy = (-labelProjected.y * 0.5 + 0.5) * h;
      if (sx < -100 || sx > w + 100 || sy < -100 || sy > h + 100) {
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        line.setAttribute('opacity', '0');
        dot.setAttribute('opacity', '0');
        return;
      }

      const dir = part.def.labelDir || [1, 0];
      const dx = dir[0] >= 0 ? 1 : -1;
      const dy = dir[1] >= 0 ? 1 : -1;
      const gap = mobile ? 34 : 48;
      let lx = dx > 0 ? sx + gap : sx - gap - labelWidth;
      lx = clamp(lx, 8, w - labelWidth - 8);
      let ly = clamp(sy + dy * (mobile ? 24 : 34), 12, h - labelHeight - 34);

      items.push({ part, el, line, dot, sx, sy, dx, dy, lx, ly });
    });

    // Simple per-side vertical collision resolution keeps dense exploded labels readable.
    [items.filter((i) => i.dx > 0), items.filter((i) => i.dx < 0)].forEach((side) => {
      side.sort((a, b) => a.ly - b.ly);
      const placed = [];
      side.forEach((item) => {
        let guard = 0;
        while (guard < 18) {
          const hit = placed.find((p) => Math.abs(p.ly - item.ly) < labelHeight + 2
            && Math.abs(p.lx - item.lx) < labelWidth + 6);
          if (!hit) break;
          item.ly += labelHeight + 3;
          if (item.ly > h - labelHeight - 34) {
            item.ly = Math.max(12, item.ly - (labelHeight + 3) * 2);
          }
          guard += 1;
        }
        item.ly = clamp(item.ly, 12, h - labelHeight - 34);
        placed.push(item);
      });
    });

    items.forEach(({ part, el, line, dot, sx, sy, dx, dy, lx, ly }) => {
      el.style.visibility = 'visible';
      el.style.opacity = '1';
      el.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
      el.classList.toggle('is-selected', part.id === state.selectedId);
      el.classList.toggle('is-hovered', part.id === state.hoveredId);
      el.classList.toggle('is-left', dx < 0);
      const labelEdgeX = dx > 0 ? lx : lx + labelWidth;
      const labelEdgeY = ly + 13;
      line.setAttribute('points', `${sx.toFixed(1)},${sy.toFixed(1)} ${(sx + dx * 24).toFixed(1)},${(sy + dy * 16).toFixed(1)} ${labelEdgeX.toFixed(1)},${labelEdgeY.toFixed(1)}`);
      line.setAttribute('opacity', part.id === state.selectedId ? '0.9' : part.id === state.hoveredId ? '0.6' : '0.22');
      dot.setAttribute('cx', sx.toFixed(1));
      dot.setAttribute('cy', sy.toFixed(1));
      dot.setAttribute('opacity', part.id === state.selectedId ? '0.95' : '0.35');
      dot.setAttribute('fill', part.id === state.selectedId ? '#ffd477' : '#64e4ff');
    });
  }

  const reticleAnchor = new THREE.Vector3();
  const reticleProjected = new THREE.Vector3();

  function updateReticle() {
    if (!dom.reticle) return;
    const part = getPart(state.selectedId);
    if (!part || !part.root.visible || part.hidden) {
      dom.reticle.classList.remove('is-visible');
      return;
    }
    model.modelGroup.updateMatrixWorld(true);
    reticleAnchor.set(0, 0, 0);
    part.root.localToWorld(reticleAnchor);
    reticleProjected.copy(reticleAnchor).project(camera);
    if (reticleProjected.z > 1 || reticleProjected.z < -1) {
      dom.reticle.classList.remove('is-visible');
      return;
    }
    const w = dom.stage.clientWidth;
    const h = dom.stage.clientHeight;
    const x = (reticleProjected.x * 0.5 + 0.5) * w;
    const y = (-reticleProjected.y * 0.5 + 0.5) * h;
    dom.reticle.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    dom.reticle.classList.add('is-visible');
    const label = $('b', dom.reticle);
    if (label) label.textContent = part.def.name;
  }

  /* -----------------------------------------------------------------------
     UI EVENTS
     ----------------------------------------------------------------------- */

  function bindUI() {
    dom.btnStart.addEventListener('click', () => play(1));
    dom.btnPause.addEventListener('click', () => pause(true));
    dom.btnReverse.addEventListener('click', () => play(-1));
    dom.btnReassemble.addEventListener('click', reassemble);

    dom.progressRange.addEventListener('input', (e) => {
      state.playing = false;
      state.reassembling = false;
      state.direction = 1;
      setProgress(Number(e.target.value) / 1000);
    });
    dom.progressRange.addEventListener('pointerdown', () => {
      state.playing = false;
      state.reassembling = false;
      dom.progressRange.classList.add('is-dragging');
    });
    window.addEventListener('pointerup', () => dom.progressRange.classList.remove('is-dragging'));

    dom.presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        pause(false);
        setProgress(Number(btn.dataset.preset) / 100);
        showToast(`已跳转至 ${btn.dataset.preset}% · ${Number(btn.dataset.preset) === 0 ? '完整装配' : Number(btn.dataset.preset) === 100 ? '完全分解' : '中间拆解状态'}`);
      });
    });

    dom.speedButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.speedScale = Number(btn.dataset.speed);
        dom.speedButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
        showToast(`播放速度 ${btn.textContent.trim()}`);
      });
    });

    dom.filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.filter = btn.dataset.filter;
        applyFilter();
      });
    });

    dom.viewButtons.forEach((btn) => {
      btn.addEventListener('click', () => setView(btn.dataset.view));
    });

    dom.partList.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]');
      if (!action) return;
      const id = action.dataset.id;
      if (action.dataset.action === 'select') selectPart(id, { openDrawer: false });
      else if (action.dataset.action === 'hide') toggleHidden(id);
      else if (action.dataset.action === 'isolate') toggleIsolate(id);
    });

    dom.partList.addEventListener('pointerover', (e) => {
      const row = e.target.closest('.part-row');
      if (row) setHovered(row.dataset.id);
    });
    dom.partList.addEventListener('pointerout', (e) => {
      if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('.part-row')) setHovered(null);
    });

    dom.detailContent.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-detail]');
      if (!btn) return;
      const part = getPart(state.selectedId);
      if (!part) return;
      const action = btn.dataset.detail;
      if (action === 'focus') focusPart(part);
      else if (action === 'hide') toggleHidden(part.id);
      else if (action === 'isolate') toggleIsolate(part.id);
      else if (action === 'stage') {
        pause(false);
        setProgress(Math.min(1, part.stage[1] + 0.01));
        showToast(`已定位到${part.def.name}的拆解阶段`);
      }
    });

    dom.labelLayer.addEventListener('click', (e) => {
      const btn = e.target.closest('.part-label');
      if (btn) selectPart(btn.dataset.id, { openDrawer: false });
    });

    dom.btnSection.addEventListener('click', () => {
      if (state.section.enabled && state.dock === 'section') setSectionEnabled(false);
      else activateDock('section');
    });
    dom.btnLight.addEventListener('click', () => {
      if (state.light.enabled && state.dock === 'light') setLightEnabled(false);
      else activateDock('light');
    });
    dom.btnFlash.addEventListener('click', () => activateDock('flash'));
    dom.btnFlashToggle.addEventListener('click', () => setFlashUp(!state.flash.up));
    dom.btnFlashFire.addEventListener('click', fireFlash);
    dom.btnFlashClose.addEventListener('click', () => {
      state.dock = null;
      updateDock();
    });
    dom.btnLabels.addEventListener('click', () => {
      state.labels = !state.labels;
      dom.btnLabels.classList.toggle('is-on', state.labels);
      document.body.classList.toggle('labels-off', !state.labels);
      updateLabels();
      showToast(state.labels ? '零件标签已显示' : '零件标签已隐藏');
    });
    dom.btnRotate.addEventListener('click', () => {
      state.autoRotate = !state.autoRotate;
      dom.btnRotate.classList.toggle('is-on', state.autoRotate);
      showToast(state.autoRotate ? '自动旋转已开启' : '自动旋转已暂停');
    });

    dom.btnPartsMobile.addEventListener('click', () => openDrawer('left'));
    dom.btnDetailsMobile.addEventListener('click', () => openDrawer('right'));
    dom.drawerScrim.addEventListener('click', closeDrawers);
    $$('[data-close-drawer]').forEach((b) => b.addEventListener('click', closeDrawers));

    dom.zoomIn.addEventListener('click', () => zoomBy(1 / 1.28));
    dom.zoomOut.addEventListener('click', () => zoomBy(1.28));
    dom.btnAllVisible.addEventListener('click', showAllVisible);

    $$('#sectionAxis [data-axis]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.section.axis = btn.dataset.axis;
        state.section.offset = btn.dataset.axis === 'x' ? 0 : btn.dataset.axis === 'y' ? 2.2 : 2.6;
        applySection(true);
      });
    });
    const crossPresets = {
      box: { axis: 'z', offset: 2.6 },
      shutter: { axis: 'z', offset: 0.6 },
      cmos: { axis: 'z', offset: 0.2 },
      frame: { axis: 'x', offset: 0 }
    };
    $$('#sectionPresets [data-cross]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = crossPresets[btn.dataset.cross];
        if (!preset) return;
        state.section.axis = preset.axis;
        state.section.offset = preset.offset;
        applySection(true);
        showToast(`剖切预设：${btn.textContent.trim()}`);
      });
    });
    dom.sectionOffset.addEventListener('input', (e) => {
      state.section.offset = Number(e.target.value);
      applySection(true);
    });
    $('#sectionFlip').addEventListener('click', () => {
      state.section.flip = !state.section.flip;
      applySection(true);
    });
    $('#sectionClose').addEventListener('click', () => setSectionEnabled(false));

    dom.lightView.addEventListener('click', () => {
      state.light.showView = !state.light.showView;
      dom.lightView.classList.toggle('is-on', state.light.showView);
    });
    dom.lightTake.addEventListener('click', () => {
      setLightTake(!state.light.showTake);
    });
    dom.btnFire.addEventListener('click', triggerFire);
    $('#lightClose').addEventListener('click', () => setLightEnabled(false));

    dom.btnDiag.addEventListener('click', toggleDiagnostics);
    $('#diagClose').addEventListener('click', toggleDiagnostics);
    dom.btnRunTest.addEventListener('click', () => runSelfTest());

    dom.btnGuide.addEventListener('click', openGuide);
    $$('[data-close-modal]').forEach((b) => b.addEventListener('click', closeGuide));

    setupPointerControls();
    setupKeyboard();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 220));
  }

  function setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === ' ') {
        e.preventDefault();
        if (state.playing) pause();
        else play(1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        pause(false);
        setProgress(state.progress + 0.02);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        pause(false);
        setProgress(state.progress - 0.02);
      } else if (e.key.toLowerCase() === 'r') {
        setView('hero');
      } else if (e.key.toLowerCase() === 'l') {
        dom.btnLabels.click();
      } else if (e.key.toLowerCase() === 'x') {
        dom.btnSection.click();
      } else if (e.key.toLowerCase() === 'p') {
        dom.btnLight.click();
      } else if (e.key.toLowerCase() === 'f') {
        triggerFire();
      } else if (e.key.toLowerCase() === 'g') {
        fireFlash();
      } else if (e.key === 'Escape') {
        closeDrawers();
        closeGuide();
        if (state.diagOpen) toggleDiagnostics();
      }
    });
  }

  function setupPointerControls() {
    const el = renderer.domElement;
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('pointerleave', () => {
      if (!drag.active) setHovered(null);
    });
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = Math.exp(e.deltaY * 0.00082);
      zoomBy(factor);
    }, { passive: false });
    el.addEventListener('dblclick', (e) => {
      const part = pickAt(e.clientX, e.clientY);
      if (part) selectPart(part.id, { focus: true, openDrawer: false });
    });
  }

  function onPointerDown(e) {
    if (e.button === 1) return;
    const el = renderer.domElement;
    try {
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
    } catch (error) {
      /* Synthetic pointer events have no capturable pointer; drag still works. */
    }
    pointerMap.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointerMap.size === 1) {
      drag.active = true;
      drag.mode = e.button === 2 || e.shiftKey ? 'pan' : 'rotate';
      drag.moved = 0;
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      el.classList.add('is-dragging');
    } else if (pointerMap.size === 2) {
      const pts = Array.from(pointerMap.values());
      drag.pinch = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      drag.midX = (pts[0].x + pts[1].x) / 2;
      drag.midY = (pts[0].y + pts[1].y) / 2;
      drag.active = true;
      drag.moved = 999;
    }
  }

  function onPointerMove(e) {
    if (!pointerMap.has(e.pointerId)) {
      if (!drag.active) {
        const part = pickAt(e.clientX, e.clientY);
        setHovered(part ? part.id : null);
        renderer.domElement.style.cursor = part ? 'pointer' : 'grab';
      }
      return;
    }
    const prev = pointerMap.get(e.pointerId);
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    pointerMap.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointerMap.size === 2) {
      const pts = Array.from(pointerMap.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (drag.pinch > 0) zoomBy(drag.pinch / Math.max(1, dist));
      const mx = (pts[0].x + pts[1].x) / 2;
      const my = (pts[0].y + pts[1].y) / 2;
      panBy(mx - drag.midX, my - drag.midY);
      drag.midX = mx;
      drag.midY = my;
      drag.pinch = dist;
      return;
    }

    if (!drag.active) return;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.mode === 'pan') {
      panBy(dx, dy);
    } else {
      orbit.tTheta -= dx * 0.006;
      orbit.tPhi = clamp(orbit.tPhi - dy * 0.0052, 0.16, 1.46);
      state.view = 'free';
      dom.viewButtons.forEach((b) => b.classList.remove('is-active'));
    }
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
  }

  function onPointerUp(e) {
    const wasActive = drag.active;
    const moved = drag.moved;
    pointerMap.delete(e.pointerId);
    if (pointerMap.size === 0) {
      drag.active = false;
      drag.pinch = 0;
      renderer.domElement.classList.remove('is-dragging');
      if (wasActive && moved < 7) {
        const part = pickAt(e.clientX, e.clientY);
        if (part) selectPart(part.id, { openDrawer: false });
        else clearSelection();
      }
    } else if (pointerMap.size === 1) {
      drag.pinch = 0;
      const pts = Array.from(pointerMap.values());
      drag.lastX = pts[0].x;
      drag.lastY = pts[0].y;
    }
  }

  /* -----------------------------------------------------------------------
     DRAWERS / MODALS / TOAST
     ----------------------------------------------------------------------- */

  function openDrawer(side) {
    if (!isMobile()) return;
    closeDrawers();
    const panel = side === 'left' ? dom.leftPanel : dom.rightPanel;
    panel.classList.add('is-open');
    dom.drawerScrim.classList.add('is-open');
    document.body.classList.add('drawer-open');
  }

  function closeDrawers() {
    dom.leftPanel.classList.remove('is-open');
    dom.rightPanel.classList.remove('is-open');
    dom.drawerScrim.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
  }

  function openGuide() {
    dom.guideModal.classList.add('is-open');
    document.body.classList.add('modal-open');
  }

  function closeGuide() {
    dom.guideModal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }

  let toastTimer = 0;
  function showToast(message) {
    if (!dom.toast || state.testing) return;
    if (state.time < 0.3 && !state.testing) return;
    dom.toast.textContent = message;
    dom.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.remove('is-visible'), 2400);
  }

  function toggleDiagnostics() {
    state.diagOpen = !state.diagOpen;
    dom.diagPanel.hidden = !state.diagOpen;
    dom.btnDiag.classList.toggle('is-on', state.diagOpen);
    if (state.diagOpen && !dom.diagResults.children.length) {
      dom.diagResults.innerHTML = '<li class="diag-idle">点击「运行自检」执行 16 项状态与交互断言。</li>';
      dom.diagSummary.textContent = 'READY';
    }
  }

  /* -----------------------------------------------------------------------
     SELF TEST
     ----------------------------------------------------------------------- */

  function snapshotState() {
    return {
      progress: state.progress,
      playing: state.playing,
      direction: state.direction,
      reassembling: state.reassembling,
      selectedId: state.selectedId,
      hoveredId: state.hoveredId,
      hidden: Array.from(state.hidden),
      isolatedId: state.isolatedId,
      section: { ...state.section },
      light: { ...state.light },
      flash: { ...state.flash },
      dock: state.dock,
      view: state.view,
      orbit: { ...orbit, target: orbit.target.clone(), currentTarget: orbit.currentTarget.clone() }
    };
  }

  function restoreState(snap) {
    state.playing = false;
    state.direction = snap.direction;
    state.reassembling = snap.reassembling;
    state.progress = snap.progress;
    state.selectedId = snap.selectedId;
    state.hoveredId = snap.hoveredId;
    state.hidden = new Set(snap.hidden);
    state.isolatedId = snap.isolatedId;
    state.section = { ...snap.section };
    state.light = { ...snap.light };
    state.flash = { ...(snap.flash || { up: false, firing: false, t: 0, intensity: 0 }), firing: false, t: 0, intensity: 0 };
    state.dock = snap.dock || null;
    state.view = snap.view;
    cancelFire(false);
    resetFireDemo();
    const fp = flashModule();
    if (fp) {
      fp.group.visible = state.flash.up;
      fp.group.position.y = state.flash.up ? fp.upY : fp.baseY;
      fp.group.rotation.x = state.flash.up ? -0.18 : 0;
    }
    if (flashLight) flashLight.intensity = 0;
    if (dom.flashBurst) dom.flashBurst.style.opacity = '0';
    Object.assign(orbit, snap.orbit);
    applySection(true);
    setLightEnabled(state.light.enabled);
    state.dock = snap.dock || null;
    updateDock();
    applyVisibility();
    applyExplosion();
    applyHighlight();
    renderDetail(getPart(state.selectedId));
    updateProgressUI();
    updateLabels();
    updateReticle();
    updateButtons();
    updateFlashUI();
  }

  function advanceSim(seconds, step = 0.04) {
    let t = 0;
    let guard = 0;
    while (t < seconds && guard < 5000) {
      const dt = Math.min(step, seconds - t);
      state.time += dt;
      stepSimulation(dt);
      updateFire(dt);
      t += dt;
      guard += 1;
    }
  }

  function testAssert(results, name, fn, detail) {
    try {
      const info = fn();
      if (info && typeof info === 'object') {
        results.push({ name, pass: info.pass !== false, detail: info.detail || (info.pass === false ? 'failed' : 'ok') });
        return;
      }
      results.push({ name, pass: info !== false, detail: detail || String(info === true ? 'ok' : info) });
    } catch (error) {
      results.push({ name, pass: false, detail: error && error.message ? error.message : String(error) });
    }
  }

  function allFinite(values) {
    return values.every((v) => Number.isFinite(v));
  }

  async function runSelfTest() {
    if (state.testing) return;
    const snap = snapshotState();
    const results = [];
    state.testing = true;
    dom.btnRunTest.disabled = true;
    dom.diagSummary.textContent = 'RUNNING…';
    dom.diagResults.innerHTML = '<li class="diag-idle">正在执行状态断言，请稍候…</li>';
    const started = performance.now();

    try {
      pause(false);
      setSectionEnabled(false);
      setLightEnabled(false);
      setLightTake(false);
      simulationReset: {
        state.hidden.clear();
        state.isolatedId = null;
        clearSelection();
        break simulationReset;
      }
      setProgress(0);

      testAssert(results, '01 部件完整性', () => {
        const ids = new Set(model.parts.map((p) => p.id));
        const meshes = model.parts.reduce((n, p) => n + p.meshes.length, 0);
        return model.parts.length === 15 && ids.size === 15 && meshes >= 380
          ? true
          : `parts=${model.parts.length} unique=${ids.size} meshes=${meshes}`;
      });

      testAssert(results, '02 0% 装配置零', () => {
        const bad = model.parts.filter((p) => p.root.position.distanceTo(p.center) > 1e-6
          || Math.abs(p.root.rotation.x - p.baseRot.x) > 1e-6
          || Math.abs(p.root.rotation.y - p.baseRot.y) > 1e-6
          || Math.abs(p.root.rotation.z - p.baseRot.z) > 1e-6);
        return bad.length === 0 ? true : `未归零: ${bad.map((p) => p.id).join(',')}`;
      });

      testAssert(results, '03 100% 目标位一致', () => {
        setProgress(1);
        const bad = model.parts.filter((p) => {
          const target = p.center.clone().add(p.explode);
          return p.root.position.distanceTo(target) > 1e-5;
        });
        return bad.length === 0 ? true : `偏差: ${bad.map((p) => p.id).join(',')}`;
      });

      testAssert(results, '04 25/50/75 单调无 NaN', () => {
        const values = [];
        [0, 0.25, 0.5, 0.75, 1].forEach((p) => {
          setProgress(p);
          const snapshot = model.parts.map((part) => ({
            id: part.id,
            d: part.root.position.distanceTo(part.center),
            x: part.root.position.x,
            y: part.root.position.y,
            z: part.root.position.z
          }));
          values.push(snapshot);
        });
        const flat = values.flatMap((s) => s.flatMap((p) => [p.d, p.x, p.y, p.z]));
        if (!allFinite(flat)) return '出现 NaN/Infinity';
        for (let i = 0; i < model.parts.length; i += 1) {
          for (let s = 1; s < values.length; s += 1) {
            if (values[s][i].d + 1e-6 < values[s - 1][i].d) return `${values[s][i].id} 在 ${[0, 25, 50, 75, 100][s]}% 回退`;
          }
        }
        return true;
      });

      testAssert(results, '05 层级阶段顺序', () => {
        setProgress(0.25);
        const electronics = ['mainboard', 'sensor'].map((id) => getPart(id).e);
        const shell = getPart('frontShell').e;
        setProgress(0.5);
        const chassis = getPart('chassis').e;
        const optics = getPart('mirror').e;
        setProgress(0.75);
        const shutter = getPart('shutterCurtains').e;
        const drive = getPart('shutterDrive').e;
        setProgress(0.92);
        const late = getPart('sensor').e;
        const board = getPart('mainboard').e;
        if (electronics.some((e) => e > 0.001)) return '25% 时电子组件提前移动';
        if (shell < 0.2) return '25% 时外壳尚未展开';
        if (chassis <= 0.1 || optics <= 0) return '50% 时骨架/光学未开始';
        if (shutter <= 0.1 || drive <= 0.1) return '75% 时快门机构未展开';
        if (late <= 0.1 || board <= 0.1) return '92% 时电子组件未展开';
        return true;
      });

      testAssert(results, '06 进度滑块共用状态', () => {
        setProgress(0.42);
        const slider = Number(dom.progressRange.value);
        const text = dom.progressValue.textContent;
        dom.progressRange.value = '250';
        dom.progressRange.dispatchEvent(new Event('input', { bubbles: true }));
        const fromSlider = state.progress;
        return slider === 420 && text === '42%' && Math.abs(fromSlider - 0.25) < 1e-9
          ? true
          : `slider=${slider} text=${text} fromSlider=${fromSlider}`;
      });

      testAssert(results, '07 无跳变 / 连续映射', () => {
        setProgress(0.5);
        const before = model.parts.map((p) => p.root.position.clone());
        setProgress(0.5005);
        let max = 0;
        model.parts.forEach((p, i) => {
          max = Math.max(max, p.root.position.distanceTo(before[i]));
        });
        return { pass: max < 0.06, detail: `maxΔ=${max.toFixed(4)} cm / Δp=0.0005` };
      });

      testAssert(results, '08 播放推进 + 暂停', () => {
        setProgress(0);
        play(1);
        advanceSim(0.42);
        const a = state.progress;
        pause(false);
        advanceSim(0.42);
        const b = state.progress;
        return a > 0.01 && Math.abs(a - b) < 1e-6 ? `t1=${a.toFixed(3)} held=${b.toFixed(3)}` : `t1=${a} t2=${b}`;
      });

      testAssert(results, '09 反向播放', () => {
        setProgress(0.7);
        play(-1);
        advanceSim(0.35);
        const a = state.progress;
        pause(false);
        return a < 0.7 && a > 0 ? `reverse→${a.toFixed(3)}` : `reverse=${a}`;
      });

      testAssert(results, '10 重新装配归零', () => {
        setProgress(1);
        state.hidden.add('grip');
        state.isolatedId = 'mirror';
        reassemble();
        advanceSim(9);
        return state.progress <= 1e-6 && !state.playing && state.hidden.size === 0 && state.isolatedId === null
          ? true
          : `p=${state.progress} playing=${state.playing} hidden=${state.hidden.size} isolate=${state.isolatedId}`;
      });

      testAssert(results, '11 部件选择 / 隔离', () => {
        clearSelection();
        selectPart('pentaprism', { openDrawer: false });
        const selected = state.selectedId === 'pentaprism';
        toggleIsolate('pentaprism');
        const visible = model.parts.filter((p) => p.root.visible).length;
        toggleIsolate('pentaprism');
        return selected && visible === 1 && state.isolatedId === null ? true : `selected=${selected} visible=${visible}`;
      });

      testAssert(results, '12 隐藏不改变进度', () => {
        setProgress(0.33);
        const before = state.progress;
        toggleHidden('grip');
        const hidden = !getPart('grip').root.visible;
        const after = state.progress;
        toggleHidden('grip');
        return hidden && Math.abs(before - after) < 1e-9 ? true : `hidden=${hidden} before=${before} after=${after}`;
      });

      testAssert(results, '13 剖切 / 光路互不破坏', () => {
        setProgress(0.55);
        setSectionEnabled(true, { axis: 'z', offset: 0 });
        const clip = getPart('chassis').materials.every((m) => m.clippingPlanes && m.clippingPlanes.length === 1);
        const p1 = state.progress;
        selectPart('chassis', { openDrawer: false });
        const selected = state.selectedId === 'chassis';
        setLightEnabled(true);
        setLightTake(true);
        updateLightPath();
        const pathVisible = lightPath.view.group.visible || lightPath.take.group.visible;
        triggerFire();
        advanceSim(3.0);
        const fireDone = !state.fire.active;
        const p2 = state.progress;
        setLightEnabled(false);
        setSectionEnabled(false);
        return clip && selected && pathVisible && fireDone && Math.abs(p1 - p2) < 1e-9
          ? true
          : `clip=${clip} selected=${selected} path=${pathVisible} fireDone=${fireDone} Δp=${Math.abs(p1 - p2)}`;
      });

      testAssert(results, '14 光路复位', () => {
        const mirror = getPart('mirror');
        const shutter = getPart('shutterCurtains');
        const rot = Math.abs(mirror.holder.rotation.x);
        const up = Math.abs(shutter.curtains.upper.group.position.y - shutter.curtains.upper.base);
        return rot < 1e-6 && up < 1e-6 ? true : `mirror=${rot} curtain=${up}`;
      });

      testAssert(results, '15 旋转 / 缩放输入', () => {
        const canvas = renderer.domElement;
        const rect = canvas.getBoundingClientRect();
        const cx = rect.left + rect.width * 0.52;
        const cy = rect.top + rect.height * 0.5;
        const beforeTheta = orbit.tTheta;
        const beforeZoom = orbit.tZoom;
        canvas.dispatchEvent(new PointerEvent('pointerdown', {
          pointerId: 91, clientX: cx, clientY: cy, button: 0, bubbles: true, pointerType: 'mouse'
        }));
        canvas.dispatchEvent(new PointerEvent('pointermove', {
          pointerId: 91, clientX: cx - 46, clientY: cy - 22, button: 0, bubbles: true, pointerType: 'mouse'
        }));
        canvas.dispatchEvent(new PointerEvent('pointerup', {
          pointerId: 91, clientX: cx - 46, clientY: cy - 22, button: 0, bubbles: true, pointerType: 'mouse'
        }));
        canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true, cancelable: true }));
        const rotated = Math.abs(orbit.tTheta - beforeTheta) > 0.01;
        const zoomed = orbit.tZoom !== beforeZoom;
        return {
          pass: rotated && zoomed,
          detail: `Δθ=${(orbit.tTheta - beforeTheta).toFixed(3)} rad · zoom ${beforeZoom.toFixed(2)}→${orbit.tZoom.toFixed(2)}`
        };
      });

      testAssert(results, '16 闪光灯升降 / 闪光', () => {
        const fp = flashModule();
        if (!fp) return 'flash module missing';
        setFlashUp(true, true);
        for (let i = 0; i < 12; i += 1) updateFlash(0.05);
        const up = fp.group.visible && Math.abs(fp.group.position.y - fp.upY) < 0.08;
        fireFlash();
        updateFlash(0.06);
        const lit = flashLight && flashLight.intensity > 1;
        for (let i = 0; i < 14; i += 1) updateFlash(0.05);
        const ended = !state.flash.firing && state.flash.intensity < 0.05;
        setFlashUp(false, true);
        for (let i = 0; i < 24; i += 1) updateFlash(0.05);
        const down = !fp.group.visible;
        return {
          pass: up && lit && ended && down,
          detail: `up=${up} lit=${lit} ended=${ended} retract=${down}`
        };
      });
    } finally {
      const elapsed = performance.now() - started;
      const passed = results.filter((r) => r.pass).length;
      restoreState(snap);
      state.testing = false;
      dom.btnRunTest.disabled = false;
      dom.diagSummary.textContent = `${passed}/${results.length} PASS · ${elapsed.toFixed(0)} ms`;
      dom.diagSummary.classList.toggle('is-fail', passed !== results.length);
      dom.diagResults.innerHTML = results.map((r, i) => `
        <li class="${r.pass ? 'is-pass' : 'is-fail'}">
          <span class="diag-check">${r.pass ? 'PASS' : 'FAIL'}</span>
          <div><b>${r.name}</b><small>${r.detail}</small></div>
          <em>${String(i + 1).padStart(2, '0')}</em>
        </li>
      `).join('');
      window.CAM6D_TEST_RESULTS = results;
      window.CAM6D_TEST_SUMMARY = { passed, total: results.length, elapsed };
    }
  }

  /* -----------------------------------------------------------------------
     RIG / PARTICLES / LOOP
     ----------------------------------------------------------------------- */

  function updateRig(dt) {
    if (!rig) return;
    rig.rotating.rotation.y = state.time * 0.07;
    rig.outerRing.material.opacity = 0.58 + Math.sin(state.time * 1.4) * 0.16;
    rig.innerRing.material.opacity = 0.4 + Math.sin(state.time * 1.1 + 1.5) * 0.12;
    rig.scanGroup.position.y = -6.2 + ((state.time * 0.095) % 1) * (24 + 6 * smooth(state.progress));
    rig.scanGroup.rotation.y = state.time * 0.12;
    rig.scanDisc.material.opacity = 0.018 + Math.sin(state.time * 2.2) * 0.008;
    const data = rig.particleData;
    const arr = rig.particles.geometry.attributes.position.array;
    for (let i = 0; i < data.count; i += 1) {
      const iy = i * 3 + 1;
      arr[iy] += data.speeds[i] * dt;
      if (arr[iy] > 18) arr[iy] = -9;
      arr[i * 3] += Math.sin(state.time * 0.25 + data.seeds[i]) * dt * 0.03;
      arr[i * 3 + 2] += Math.cos(state.time * 0.21 + data.seeds[i]) * dt * 0.03;
    }
    rig.particles.geometry.attributes.position.needsUpdate = true;
    rig.violetParticles.rotation.y = -state.time * 0.012;
  }

  function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    state.time += dt;
    stepSimulation(dt);
    updateFire(dt);
    updateFlash(dt);
    updateCamera(dt);
    updateRig(dt);
    updateLightPath();
    updateLabels();
    updateReticle();
    renderer.render(scene, camera);
  }

  function bootAnim() {
    dom.bootBar.style.width = '100%';
    dom.bootStatus.textContent = 'MODEL READY / 15 MODULES';
    setTimeout(() => {
      dom.boot.classList.add('is-done');
      setTimeout(() => dom.boot && dom.boot.remove(), 900);
    }, 420);
  }

  /* -----------------------------------------------------------------------
     INIT
     ----------------------------------------------------------------------- */

  function init() {
    cacheDom();
    initRenderer();
    initScene();
    buildWorld();
    initClipping();
    raycaster = new THREE.Raycaster();
    raycaster.params.Line = { threshold: 0.1 };
    clock = new THREE.Clock();

    resize();
    buildPartList();
    buildLabels();
    renderDetail(null);
    applySection(true);
    applyVisibility();
    applyExplosion();
    applyHighlight();
    updateProgressUI();
    bindUI();
    setView('hero', true);
    setLightEnabled(false);
    setSectionEnabled(false);
    updateDock();
    updateFlashUI();
    updateButtons();
    bootAnim();
    requestAnimationFrame(loop);
    window.CAM6D_READY = true;
    window.CAM6D = {
      version: DATA.VERSION,
      model: DATA.MODEL,
      parts: model.parts,
      getState: () => ({
        progress: state.progress,
        playing: state.playing,
        direction: state.direction,
        reassembling: state.reassembling,
        selectedId: state.selectedId,
        hidden: Array.from(state.hidden),
        isolatedId: state.isolatedId,
        section: { ...state.section },
        light: { ...state.light },
        fire: { ...state.fire }
      }),
      api: {
        setProgress,
        play,
        pause,
        reverse: () => play(-1),
        reassemble,
        select: (id) => selectPart(id, { openDrawer: false }),
        clearSelection,
        hide: toggleHidden,
        isolate: toggleIsolate,
        setSection: setSectionEnabled,
        setLight: setLightEnabled,
        setLightTake,
        fire: triggerFire,
        flashUp: setFlashUp,
        flashFire: fireFlash,
        dock: activateDock,
        setView,
        focus: (id) => focusPart(getPart(id)),
        showAllVisible,
        runSelfTest,
        getWorld: (id) => {
          const part = getPart(id);
          if (!part) return null;
          const pos = part.root.getWorldPosition(new THREE.Vector3());
          return { id, x: pos.x, y: pos.y, z: pos.z, e: part.e, visible: part.root.visible };
        }
      }
    };
    const query = new URLSearchParams(location.search);
    if (query.get('progress') != null) {
      setProgress(clamp(Number(query.get('progress')) || 0, 0, 1));
    }
    if (query.get('view')) setView(query.get('view'), true);
    if (query.get('section')) {
      const axis = ['x', 'y', 'z'].includes(query.get('section')) ? query.get('section') : 'z';
      const offset = query.get('offset') != null ? Number(query.get('offset')) : (axis === 'x' ? 0 : axis === 'y' ? 2.2 : 2.6);
      setSectionEnabled(true, { axis, offset });
      if (query.get('panel') === '0') {
        state.dock = null;
        updateDock();
      }
    }
    if (query.get('light') === '1') {
      setLightEnabled(true);
      if (query.get('take') === '1') setLightTake(true);
      if (query.get('panel') === '0') {
        state.dock = null;
        updateDock();
      }
      if (query.get('fire') === '1') {
        setTimeout(() => {
          triggerFire();
          if (query.get('hold') != null) {
            state.fire.hold = true;
            state.fire.holdT = Number(query.get('hold')) || 0.85;
          }
        }, 700);
      }
    }
    if (query.get('flash') === '1') {
      setTimeout(() => {
        setFlashUp(true, true);
        state.dock = query.get('panel') === '0' ? null : 'flash';
        updateDock();
        if (query.get('fire') === '1') setTimeout(fireFlash, 500);
      }, 700);
    }
    if (query.get('select')) {
      setTimeout(() => selectPart(query.get('select'), { openDrawer: false }), 80);
    }
    if (query.get('isolate')) {
      setTimeout(() => toggleIsolate(query.get('isolate')), 140);
    }
    if (query.get('drawer')) {
      setTimeout(() => {
        openDrawer(query.get('drawer') === 'right' ? 'right' : 'left');
        if (query.get('drawer') === 'right') renderDetail(getPart('topShell'));
      }, 420);
    }
    if (query.get('selftest') === '1') {
      setTimeout(async () => {
        await runSelfTest();
        if (query.get('diag') === '1' && !state.diagOpen) {
          toggleDiagnostics();
        }
      }, 900);
    }
    if (query.get('debug') === 'layout') {
      setTimeout(() => {
        const el = document.createElement('pre');
        const bar = document.querySelector('.controlbar').getBoundingClientRect();
        const trans = document.querySelector('.transport-buttons').getBoundingClientRect();
        const top = document.querySelector('.topbar').getBoundingClientRect();
        el.style.cssText = 'position:fixed;left:0;top:0;z-index:999;background:#000;color:#0ff;font:10px monospace;padding:4px;white-space:pre';
        el.textContent = `inner=${innerWidth}\nbar=${bar.width} scroll=${document.querySelector('.controlbar').scrollWidth}\ntrans=${trans.width}\ntop=${top.width}/${top.height}\nbodyScroll=${document.body.scrollWidth}`;
        document.body.appendChild(el);
      }, 800);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

































