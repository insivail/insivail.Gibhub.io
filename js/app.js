/* =========================================================================
   CANON EOS R8 — INTERACTIVE TEARDOWN LAB
   All geometry, materials, lighting and interaction are generated in code.
   No external 3D model files are used.
   ========================================================================= */

(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     00 / DATA
     ----------------------------------------------------------------------- */

  const PART_DEFS = [
    {
      id: 'bodyShell',
      no: '01',
      group: 'body',
      category: 'mechanical',
      name: '机身外壳',
      en: 'Magnesium Alloy Body',
      kicker: 'STRUCTURAL FRAME / 结构骨架',
      short: '镁合金骨架 · 461 g',
      tags: ['STRUCTURE', 'MAGNESIUM', 'RF MOUNT'],
      center: [1.1, -0.55, -0.35],
      explode: [-6.6, 0.4, -1.2],
      rotation: [0.04, -0.24, 0.05],
      showAssembled: true,
      labelDir: [-1, -0.55],
      desc: '承托 RF 卡口、全画幅传感器与主板的主体框架。外壳以镁合金与高强度工程塑料组合压缩重量，右侧握柄内部同时容纳电池与存储卡。',
      specs: [
        ['机身尺寸', '132.5 × 86.1 × 70.0 mm'],
        ['整机重量', '约 461 g（含电池与存储卡）'],
        ['骨架材质', '镁合金 / 高强度工程塑料'],
        ['卡口系统', 'Canon RF / 54 mm 内径']
      ]
    },
    {
      id: 'grip',
      no: '02',
      group: 'body',
      category: 'mechanical',
      name: '握持手柄',
      en: 'Ergonomic Grip',
      kicker: 'HANDLING / 人体工学',
      short: '防滑蒙皮 · LP-E17 仓',
      tags: ['HANDLING', 'RUBBER', 'BATTERY BAY'],
      center: [-4.75, -0.55, 0.02],
      explode: [-6.8, -3.4, 0.6],
      rotation: [0.08, 0.1, 0.12],
      showAssembled: false,
      labelDir: [-1, 0.35],
      desc: '为全画幅机身提供深握持区。前缘橡胶蒙皮与手指凹槽提升单手持握稳定性，内部电池仓通过底部舱门快速更换 LP-E17。',
      specs: [
        ['握持结构', '人体工学深握柄'],
        ['表面材质', '防滑橡胶蒙皮'],
        ['内置空间', 'LP-E17 电池仓'],
        ['存储布局', '单 SD 卡槽（手柄后方）']
      ]
    },
    {
      id: 'topCover',
      no: '03',
      group: 'body',
      category: 'mechanical',
      name: '顶部组件',
      en: 'Top Cover & Dials',
      kicker: 'CONTROL DECK / 控制层',
      short: '快门 · 模式盘 · 热靴',
      tags: ['CONTROL', 'HOT SHOE', 'DIAL'],
      center: [0.8, 3.5, -0.3],
      explode: [0, 5.2, 0.4],
      rotation: [-0.12, 0.14, 0.02],
      showAssembled: true,
      labelDir: [0.1, -1],
      desc: '集成快门按钮、电子主拨盘、模式转盘与多功能热靴的上盖总成。EVF 外罩与眼罩同样固定在这一层，拆下后可直接接触取景器模块。',
      specs: [
        ['集成组件', '快门 / 模式转盘 / 热靴'],
        ['热靴类型', '多功能热靴'],
        ['拨盘系统', '电子主拨盘 + 模式盘'],
        ['上盖材质', '镁合金压铸上盖']
      ]
    },
    {
      id: 'evf',
      no: '04',
      group: 'body',
      category: 'electronic',
      name: '电子取景器',
      en: '0.39" OLED EVF',
      kicker: 'VIEWFINDER / 取景系统',
      short: '236 万点 · 120 fps',
      tags: ['OLED', '120 FPS', '0.70×'],
      center: [1.25, 3.48, -0.72],
      explode: [3.4, 1.9, -0.8],
      rotation: [0, -0.18, 0],
      showAssembled: false,
      labelDir: [0.75, -1],
      desc: '0.39 英寸 OLED 电子取景器，提供约 236 万点分辨率与最高 120 fps 刷新，眼点与目镜光学组共同构成所见即所得的取景链路。',
      specs: [
        ['面板类型', '0.39 英寸 OLED'],
        ['有效像素', '约 236 万点'],
        ['刷新率', '最高 120 fps'],
        ['放大倍率', '约 0.70×（50mm 等效）']
      ]
    },
    {
      id: 'lcd',
      no: '05',
      group: 'body',
      category: 'electronic',
      name: '翻转触控屏',
      en: '3.0" Vari-Angle LCD',
      kicker: 'DISPLAY / 显示与触控',
      short: '162 万点 · 侧翻结构',
      tags: ['TOUCH', 'VARI-ANGLE', '3.0"'],
      center: [1.0, -0.72, -3.02],
      explode: [3.2, -3.5, -2.4],
      rotation: [0.08, 2.52, 0.03],
      showAssembled: false,
      labelDir: [-1, -0.4],
      desc: '3.0 英寸约 162 万点电容触控屏，采用侧翻式转轴，可向前翻转用于自拍与 Vlog。屏幕总成通过柔性排线与主板连接。',
      specs: [
        ['屏幕尺寸', '3.0 英寸'],
        ['显示像素', '约 162 万点'],
        ['翻转结构', '侧翻旋转触控屏'],
        ['触控方式', '电容式多点触控']
      ]
    },
    {
      id: 'mount',
      no: '06',
      group: 'body',
      category: 'mechanical',
      name: 'RF 卡口',
      en: 'RF Lens Mount',
      kicker: 'INTERFACE / 光学接口',
      short: '54 mm 内径 · 12 触点',
      tags: ['RF', '54 MM', '12 PIN'],
      center: [1.1, 0.2, 2.28],
      explode: [4.8, -2.0, 0.8],
      rotation: [0.15, -0.32, 0.1],
      showAssembled: false,
      labelDir: [1, 0],
      desc: '直径 54 mm 的 Canon RF 卡口，20 mm 短法兰距让大口径后组镜片更靠近传感器。12 个镀金触点负责镜头供电、对焦与防抖数据通讯。',
      specs: [
        ['卡口系统', 'Canon RF'],
        ['内径', '54 mm'],
        ['法兰距', '20 mm'],
        ['电子触点', '12 pin 镀金触点']
      ]
    },
    {
      id: 'sensor',
      no: '07',
      group: 'body',
      category: 'optical',
      name: '全画幅 CMOS',
      en: '24.2MP Full-Frame Sensor',
      kicker: 'IMAGING CORE / 成像核心',
      short: '24.2 MP · 36 × 24 mm',
      tags: ['FULL FRAME', '24.2 MP', 'DUAL PIXEL II'],
      center: [1.1, 0.2, 0.35],
      explode: [-2.8, -0.7, 3.2],
      rotation: [0.02, -0.54, 0.04],
      showAssembled: false,
      labelDir: [-1, -0.15],
      desc: '约 2420 万有效像素全画幅 CMOS，配合 DIGIC X 提供高感与宽容度。传感器表面集成低通滤镜与除尘涂层，Dual Pixel CMOS AF II 覆盖广泛对焦区域。',
      specs: [
        ['传感器', '全画幅 CMOS'],
        ['有效像素', '约 2420 万'],
        ['物理尺寸', '36 × 24 mm'],
        ['对焦技术', 'Dual Pixel CMOS AF II'],
        ['原生 ISO', '100–102400']
      ]
    },
    {
      id: 'shutter',
      no: '08',
      group: 'body',
      category: 'mechanical',
      name: '机械快门',
      en: 'Focal-Plane Shutter',
      kicker: 'TIMING / 曝光时序',
      short: '1/4000 s · 6 fps',
      tags: ['MECHANICAL', '1/4000 S', '6 FPS'],
      center: [1.1, 0.2, 1.02],
      explode: [3.6, -0.9, 2.0],
      rotation: [0.02, -0.34, -0.04],
      showAssembled: false,
      labelDir: [1, -0.15],
      desc: '焦平面机械快门位于传感器前方，机械模式最高约 6 fps；电子快门下最高约 40 fps，并支持电子前帘以降低机震。',
      specs: [
        ['快门类型', '焦平面机械快门'],
        ['最高速度', '1/4000 s'],
        ['连拍速度', '6 fps 机械 / 40 fps 电子'],
        ['快门模式', '机械 / 电子前帘 / 电子']
      ]
    },
    {
      id: 'mainboard',
      no: '09',
      group: 'body',
      category: 'electronic',
      name: '图像主板',
      en: 'DIGIC X Mainboard',
      kicker: 'COMPUTE / 图像处理',
      short: 'DIGIC X · 4K 60p',
      tags: ['DIGIC X', '4K 60P', '6K OVERSAMPLE'],
      center: [1.1, -0.05, -1.38],
      explode: [0.2, -0.3, -5.0],
      rotation: [-0.04, -0.28, 0],
      showAssembled: false,
      labelDir: [0.45, 0.2],
      desc: '以 DIGIC X 为核心的主板负责图像处理、对焦运算、视频编码与接口控制。支持 6K 超采样 4K 60p、FHD 180p 以及 HDR PQ 与 Canon Log 3。',
      specs: [
        ['处理器', 'DIGIC X'],
        ['视频能力', '4K 60p / 6K 超采样'],
        ['高帧率', 'FHD 180p'],
        ['接口', 'USB-C / Micro HDMI / 3.5 mm']
      ]
    },
    {
      id: 'battery',
      no: '10',
      group: 'body',
      category: 'electronic',
      name: 'LP-E17 电池',
      en: 'LP-E17 Battery Pack',
      kicker: 'POWER / 能源',
      short: '1040 mAh · USB-C 充电',
      tags: ['7.2 V', '1040 MAH', 'USB-C PD'],
      center: [-4.88, -0.55, 0.3],
      explode: [-5.2, -3.8, 1.1],
      rotation: [0.04, 0.3, 0.14],
      showAssembled: false,
      labelDir: [-1, 0.6],
      desc: 'LP-E17 可充电锂离子电池封装于手柄内部，容量约 1040 mAh。机身支持 USB-C PD 供电与充电，方便长时间延时或直播使用。',
      specs: [
        ['型号', 'LP-E17'],
        ['容量', '1040 mAh / 7.2 V'],
        ['续航参考', '约 370 张（EVF）'],
        ['充电方式', 'USB-C PD 机身充电']
      ]
    },
    {
      id: 'sdCard',
      no: '11',
      group: 'body',
      category: 'electronic',
      name: 'SD 存储卡',
      en: 'SD UHS-II Media',
      kicker: 'STORAGE / 存储',
      short: 'UHS-II · 单卡槽',
      tags: ['UHS-II', 'SDXC', 'V90'],
      center: [-4.35, 0.75, -2.45],
      explode: [-4.7, 1.8, 2.6],
      rotation: [0.1, 0.4, -0.08],
      showAssembled: false,
      labelDir: [-1, 0.9],
      desc: '单 SD 卡槽支持 UHS-II 总线。高码率 4K 录制与高速连拍建议使用 V90 级别 UHS-II SDXC 卡，以缩短清缓存时间。',
      specs: [
        ['插槽数量', '单 SD 卡槽'],
        ['总线标准', 'UHS-II'],
        ['推荐规格', 'V90 UHS-II SDXC'],
        ['文件系统', 'exFAT / FAT32']
      ]
    },
    {
      id: 'lensBarrel',
      no: '12',
      group: 'lens',
      category: 'mechanical',
      name: '镜头镜筒',
      en: 'RF 28–70mm F2.8 IS STM',
      kicker: 'OPTICAL HOUSING / 光学镜筒',
      short: 'F2.8 · 495 g · φ67',
      tags: ['RF', 'F2.8', 'STM', '5.5-STOP IS'],
      center: [1.1, 0.2, 8.1],
      explode: [2.0, 6.2, 1.0],
      rotation: [0.02, 0.05, 0],
      showAssembled: true,
      labelDir: [1, -0.3],
      desc: 'RF 28–70mm F2.8 IS STM 的镜筒与操作环总成。采用可收缩结构，收纳长度仅约 92.2 mm；内置 5.5 档光学防抖与导螺杆型 STM 对焦。',
      specs: [
        ['镜头型号', 'RF 28–70mm F2.8 IS STM'],
        ['光学结构', '15 片 / 12 组'],
        ['收纳尺寸', 'φ76.5 × 92.2 mm'],
        ['重量', '约 495 g'],
        ['滤镜口径', 'φ67 mm']
      ]
    },
    {
      id: 'frontElement',
      no: '13',
      group: 'lens',
      category: 'optical',
      name: '前组镜片',
      en: 'Front Optical Group',
      kicker: 'OPTICS / 光学前组',
      short: 'UD 镜片 · 氟涂层',
      tags: ['UD GLASS', 'FLUORINE', 'φ67'],
      center: [1.1, 0.2, 13.0],
      explode: [1.4, 4.6, 4.0],
      rotation: [0.04, -0.2, 0.05],
      showAssembled: true,
      labelDir: [1, -0.8],
      desc: '前组采用 UD 超低色散镜片压制色差，最外层镀有氟涂层，便于清洁水滴与油污。67 mm 滤镜接口位于前镜筒内侧。',
      specs: [
        ['前组镜片', 'UD 超低色散镜片'],
        ['表面镀膜', '氟涂层'],
        ['滤镜口径', 'φ67 mm'],
        ['最近对焦', '0.27 m（28mm AF）']
      ]
    },
    {
      id: 'opticalCore',
      no: '14',
      group: 'lens',
      category: 'optical',
      name: '光学镜组',
      en: 'Optical Lens Groups',
      kicker: 'OPTICAL STACK / 光学堆栈',
      short: '15 片 12 组 · 2 UD',
      tags: ['15/12', '2 UD', '2 PMo'],
      center: [1.1, 0.2, 9.1],
      explode: [3.2, 0.6, 1.8],
      rotation: [0.08, 0.3, -0.06],
      showAssembled: false,
      labelDir: [1, 0.35],
      desc: '由 15 片镜片分为 12 组构成的标准变焦光学系统，包含 2 片 UD 与 2 片 PMo 非球面镜片，在全程变焦范围内维持高画质与柔顺焦外。',
      specs: [
        ['镜片结构', '15 片 / 12 组'],
        ['特殊镜片', '2 片 UD + 2 片 PMo'],
        ['防抖补偿', '5.5 档（CIPA 2024）'],
        ['卡口类型', 'Canon RF']
      ]
    },
    {
      id: 'aperture',
      no: '15',
      group: 'lens',
      category: 'mechanical',
      name: '九叶片光圈',
      en: '9-Blade Diaphragm',
      kicker: 'APERTURE / 光圈机构',
      short: 'F2.8–F22 · 9 片',
      tags: ['F2.8–22', '9 BLADES', 'ROUNDED'],
      center: [1.1, 0.2, 7.15],
      explode: [-3.4, 0.4, 1.4],
      rotation: [0.1, -0.26, 0.04],
      showAssembled: false,
      labelDir: [-1, -0.1],
      desc: '9 片圆形光圈叶片由电子脉冲马达驱动，在全开与收缩状态下均保持圆润开口，营造自然柔和的焦外光斑。',
      specs: [
        ['光圈范围', 'F2.8–F22'],
        ['光圈叶片', '9 片圆形叶片'],
        ['驱动方式', '电子控制光圈'],
        ['光圈环', '无（机身控制）']
      ]
    },
    {
      id: 'stmMotor',
      no: '16',
      group: 'lens',
      category: 'electronic',
      name: 'STM 对焦马达',
      en: 'Lead-Screw STM Motor',
      kicker: 'AF ACTUATOR / 对焦驱动',
      short: '导螺杆 STM · 磁编码',
      tags: ['STM', 'MAGNETIC ENCODER', 'QUIET'],
      center: [1.1, -1.55, 5.0],
      explode: [3.0, -2.8, 0.6],
      rotation: [0.15, 0.2, -0.1],
      showAssembled: false,
      labelDir: [1, 0.9],
      desc: '导螺杆型 STM 步进马达配合磁编码器反馈，实现安静、平滑且高速的自动对焦。该结构特别适合视频拍摄中的连续追焦。',
      specs: [
        ['马达类型', '导螺杆型 STM'],
        ['反馈系统', '磁编码器'],
        ['工作特性', '安静 / 平滑 / 高速 AF'],
        ['适用场景', '照片与视频连续对焦']
      ]
    },
    {
      id: 'isUnit',
      no: '17',
      group: 'lens',
      category: 'optical',
      name: 'IS 防抖单元',
      en: 'Optical Image Stabilizer',
      kicker: 'STABILIZATION / 防抖',
      short: '5.5 档 · 镜头光学防抖',
      tags: ['5.5 STOPS', 'CIPA 2024', 'COOPERATIVE'],
      center: [1.1, 1.58, 4.55],
      explode: [-3.4, -2.8, 1.2],
      rotation: [-0.1, 0.26, 0.08],
      showAssembled: false,
      labelDir: [-1, 0.55],
      desc: '镜头内置光学防抖单元，通过两组音圈马达驱动补偿镜片，在 EOS R8 上提供约 5.5 档 CIPA 2024 标准补偿效果。',
      specs: [
        ['防抖类型', '镜头光学防抖'],
        ['补偿效果', '5.5 档'],
        ['测试标准', 'CIPA 2024'],
        ['协同控制', '支持 RF 机身协同']
      ]
    }
  ];

  const CATEGORY = {
    optical: { label: 'OPTICAL', color: 0xff5a3f, css: 'red' },
    electronic: { label: 'ELECTRONIC', color: 0x6de8ff, css: 'cyan' },
    mechanical: { label: 'MECHANICAL', color: 0xffb15c, css: 'amber' }
  };

  /* -----------------------------------------------------------------------
     01 / UTILITIES
     ----------------------------------------------------------------------- */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const damp = (value, target, lambda, dt) => value + (target - value) * (1 - Math.exp(-lambda * dt));
  const smoothstep = (t) => {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  };
  const formatPercent = (value) => `${String(Math.round(value * 100)).padStart(2, '0')}%`;

  function isMobileLayout() {
    return window.innerWidth <= 1020;
  }

  function showToast(message) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
  }

  /* -----------------------------------------------------------------------
     02 / DOM & STATE
     ----------------------------------------------------------------------- */

  const dom = {
    boot: $('#boot'),
    bootBar: $('#bootBar'),
    bootStatus: $('#bootStatus'),
    partList: $('#partList'),
    partCount: $('#partCount'),
    stage: $('#stage'),
    stageWrap: $('#stageWrap'),
    annotations: $('#annotationLayer'),
    leaders: $('#leaderLayer'),
    detailContent: $('#detailContent'),
    detailIndex: $('#detailIndex'),
    viewState: $('#viewState'),
    explodePercent: $('#explodePercent'),
    meterFill: $('#meterFill'),
    selectedStrip: $('#selectedStrip'),
    coach: $('#coach'),
    reticle: $('#reticle'),
    guideModal: $('#guideModal'),
    leftPanel: $('#leftPanel'),
    rightPanel: $('#rightPanel'),
    drawerScrim: $('#drawerScrim')
  };

  const state = {
    selected: null,
    hovered: null,
    labels: true,
    autoRotate: false,
    mode: 'assembled',
    filter: 'all',
    userZoomed: false,
    time: 0,
    pointer: {
      down: false,
      dragging: false,
      button: 0,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      moved: 0,
      downTime: 0,
      pointers: new Map(),
      pinchStart: 0,
      pinchRadius: 0
    },
    cam: {
      theta: -0.38,
      phi: 1.18,
      radius: 40.5,
      dTheta: -0.38,
      dPhi: 1.18,
      dRadius: 40.5,
      target: null,
      dTarget: null
    },
    bootProgress: 0
  };

  let scene;
  let camera;
  let renderer;
  let root;
  let raycaster;
  let pointerNdc;
  let pickMeshes = [];
  let parts = [];
  let byId = new Map();
  let glowTexture;
  let clock;
  let lastAnnotationAt = 0;
  let annotationLines = new Map();
  let annotationEls = new Map();
  let currentUI = { percent: -1, state: '' };
  let envTexture = null;

  const view = {
    width: 1,
    height: 1,
    dpr: Math.min(window.devicePixelRatio || 1, 2)
  };

  /* -----------------------------------------------------------------------
     03 / PROCEDURAL TEXTURES
     ----------------------------------------------------------------------- */

  const textureCache = new Map();

  function canvasTexture(width, height, draw, options = {}) {
    const key = options.key;
    if (key && textureCache.has(key)) return textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    draw(ctx, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = options.wrapS || THREE.RepeatWrapping;
    texture.wrapT = options.wrapT || THREE.RepeatWrapping;
    if (options.mapping) texture.mapping = options.mapping;
    texture.repeat.set(options.repeatX || 1, options.repeatY || 1);
    texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 4;
    if (options.srgb !== false) texture.encoding = THREE.sRGBEncoding;
    texture.needsUpdate = true;
    if (key) textureCache.set(key, texture);
    return texture;
  }

  function noise(ctx, width, height, amount, alpha, light = true) {
    for (let i = 0; i < amount; i += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const a = Math.random() * alpha;
      ctx.fillStyle = light ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
      ctx.fillRect(x, y, Math.random() < 0.7 ? 1 : 2, 1);
    }
  }

  function initTextures() {
    const bodyMap = canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#9da1a4';
      ctx.fillRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(255,255,255,0.08)');
      grad.addColorStop(0.48, 'rgba(0,0,0,0.03)');
      grad.addColorStop(1, 'rgba(0,0,0,0.16)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      noise(ctx, w, h, 7000, 0.075, true);
      noise(ctx, w, h, 4500, 0.07, false);
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 90; i += 1) {
        const y = Math.random() * h;
        ctx.strokeStyle = i % 2 ? '#ffffff' : '#000000';
        ctx.beginPath();
        ctx.moveTo(Math.random() * w * 0.5, y);
        ctx.lineTo(w - Math.random() * w * 0.5, y + Math.random() * 0.4);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }, { key: 'body-map', repeatX: 2.2, repeatY: 1.4 });

    const bodyBump = canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#777';
      ctx.fillRect(0, 0, w, h);
      noise(ctx, w, h, 2600, 0.22, true);
      noise(ctx, w, h, 2300, 0.2, false);
    }, { key: 'body-bump', srgb: false, repeatX: 4, repeatY: 3 });

    const leatherMap = canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#7f8184';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.22;
      for (let y = 0; y < h; y += 7) {
        for (let x = 0; x < w; x += 7) {
          const ox = (y / 7) % 2 ? 3.5 : 0;
          ctx.fillStyle = (x + y) % 3 ? '#d8dadd' : '#26282a';
          ctx.beginPath();
          ctx.arc(x + ox, y, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      noise(ctx, w, h, 1600, 0.08, false);
    }, { key: 'leather-map', repeatX: 3, repeatY: 3 });

    const leatherBump = canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#888';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 7) {
        for (let x = 0; x < w; x += 7) {
          const ox = (y / 7) % 2 ? 3.5 : 0;
          ctx.fillStyle = (x + y) % 3 ? '#d7d7d7' : '#333';
          ctx.beginPath();
          ctx.arc(x + ox, y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }, { key: 'leather-bump', srgb: false, repeatX: 3, repeatY: 3 });

    const ribBump = canvasTexture(128, 128, (ctx, w, h) => {
      ctx.fillStyle = '#555';
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 6) {
        ctx.fillStyle = '#dedede';
        ctx.fillRect(x, 0, 2, h);
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 2, 0, 1, h);
      }
    }, { key: 'rib-bump', srgb: false, repeatX: 8, repeatY: 1 });

    const brushedMetal = canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#8e9499';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 500; i += 1) {
        const y = Math.random() * h;
        ctx.strokeStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.09})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y + (Math.random() - 0.5) * 0.8);
        ctx.stroke();
      }
    }, { key: 'brushed-metal', repeatX: 2, repeatY: 1 });

    const sensorMap = canvasTexture(768, 512, (ctx, w, h) => {
      ctx.fillStyle = '#07151c';
      ctx.fillRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, 'rgba(20,83,111,0.55)');
      bg.addColorStop(0.45, 'rgba(7,27,38,0.75)');
      bg.addColorStop(1, 'rgba(65,34,68,0.4)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(78,205,242,0.25)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255,94,62,0.42)';
      ctx.strokeRect(82, 58, w - 164, h - 116);
      ctx.strokeStyle = 'rgba(109,232,255,0.5)';
      ctx.strokeRect(96, 72, w - 192, h - 144);

      ctx.fillStyle = 'rgba(218,247,255,0.9)';
      ctx.font = '500 28px "Bahnschrift", "Segoe UI", sans-serif';
      ctx.fillText('FULL FRAME CMOS', 106, 135);
      ctx.fillStyle = 'rgba(109,232,255,0.7)';
      ctx.font = '15px "Consolas", monospace';
      ctx.fillText('24.2 MEGAPIXELS  /  36.0 × 24.0 MM', 106, 164);
      ctx.fillStyle = 'rgba(255,255,255,0.44)';
      ctx.font = '11px "Consolas", monospace';
      ctx.fillText('DUAL PIXEL CMOS AF II', 106, h - 108);
      ctx.fillText('R8 // IMAGING CORE', 106, h - 89);

      const glow = ctx.createRadialGradient(w * 0.7, h * 0.52, 10, w * 0.7, h * 0.52, w * 0.28);
      glow.addColorStop(0, 'rgba(114,235,255,0.2)');
      glow.addColorStop(1, 'rgba(114,235,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }, { key: 'sensor-map', repeatX: 1, repeatY: 1 });

    const pcbMap = canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#07130f';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#0a1c16';
      for (let y = 14; y < h; y += 34) {
        for (let x = 14; x < w; x += 34) {
          ctx.fillRect(x, y, 18, 12);
        }
      }
      const traces = ['#a7793f', '#28675a', '#2e4f46'];
      for (let i = 0; i < 90; i += 1) {
        const y = Math.random() * h;
        ctx.strokeStyle = traces[i % traces.length];
        ctx.globalAlpha = 0.24 + Math.random() * 0.2;
        ctx.lineWidth = Math.random() < 0.15 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < w; x += 40) {
          ctx.lineTo(x, y + Math.sin(x * 0.045 + i) * 16);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(219,242,240,0.48)';
      ctx.font = '10px "Consolas", monospace';
      ctx.fillText('DIGIC X / IMAGE PROCESSING', 24, h - 34);
      ctx.fillText('R8-MB-01   REV.03', 24, h - 18);
      for (let i = 0; i < 40; i += 1) {
        ctx.fillStyle = 'rgba(205,175,99,0.6)';
        ctx.beginPath();
        ctx.arc(24 + Math.random() * (w - 48), 24 + Math.random() * (h - 48), 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }, { key: 'pcb-map', repeatX: 1, repeatY: 1 });

    const screenMap = canvasTexture(1024, 704, (ctx, w, h) => {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#101923');
      bg.addColorStop(1, '#070b10');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(124,233,255,0.11)';
      ctx.fillRect(0, 0, w, 36);
      ctx.fillStyle = 'rgba(215,240,248,0.82)';
      ctx.font = '500 17px "Consolas", monospace';
      ctx.fillText('EOS R8', 28, 24);
      ctx.fillStyle = 'rgba(255,93,63,0.9)';
      ctx.fillText('● REC', 123, 24);
      ctx.fillStyle = 'rgba(210,232,238,0.6)';
      ctx.font = '13px "Consolas", monospace';
      ctx.fillText('4K 60P  25.0 FPS', w - 230, 24);

      ctx.strokeStyle = 'rgba(124,233,255,0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.16, h * 0.22, w * 0.68, h * 0.55);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 9; i += 1) {
        ctx.beginPath();
        ctx.moveTo(w / 3, h / 3 + i * h * 0.045);
        ctx.lineTo(2 * w / 3, h / 3 + i * h * 0.045);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255,93,63,0.95)';
      ctx.lineWidth = 3;
      const bx = w * 0.44;
      const by = h * 0.5;
      const bw = w * 0.14;
      const bh = h * 0.1;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.beginPath();
      ctx.moveTo(bx + bw / 2, by - 12);
      ctx.lineTo(bx + bw / 2, by + bh + 12);
      ctx.moveTo(bx - 12, by + bh / 2);
      ctx.lineTo(bx + bw + 12, by + bh / 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(8,14,19,0.82)';
      ctx.fillRect(0, h - 88, w, 88);
      ctx.fillStyle = 'rgba(210,235,242,0.75)';
      ctx.font = '13px "Consolas", monospace';
      ctx.fillText('1/500    F2.8    ISO 400    ±0.0', 28, h - 52);
      ctx.fillStyle = 'rgba(124,233,255,0.7)';
      ctx.fillText('RAW   C-LOG3   FULL   [  ]', 28, h - 27);

      ctx.fillStyle = 'rgba(124,233,255,0.16)';
      for (let i = 0; i < 14; i += 1) {
        const v = 0.2 + Math.random() * 0.7;
        ctx.fillRect(w - 250 + i * 12, h - 180 + (1 - v) * 100, 8, v * 100);
      }
    }, { key: 'screen-map', repeatX: 1, repeatY: 1 });

    const evfMap = canvasTexture(512, 320, (ctx, w, h) => {
      const bg = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.62);
      bg.addColorStop(0, '#10262e');
      bg.addColorStop(1, '#020709');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(124,233,255,0.26)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,83,54,0.75)';
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.43, h * 0.45, w * 0.14, h * 0.1);
      ctx.fillStyle = 'rgba(218,244,250,0.8)';
      ctx.font = '14px "Consolas", monospace';
      ctx.fillText('AF  [TRACKING]', 20, 28);
      ctx.fillText('1/500  F2.8  ISO 400', 20, h - 20);
      ctx.fillStyle = 'rgba(124,233,255,0.6)';
      ctx.fillText('0.39" OLED / 120 FPS', w - 192, h - 20);
    }, { key: 'evf-map', repeatX: 1, repeatY: 1 });

    const dialMap = canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#1a1d20';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      ctx.translate(cx, cy);
      ctx.strokeStyle = 'rgba(230,244,248,0.65)';
      ctx.fillStyle = 'rgba(230,244,248,0.72)';
      ctx.lineWidth = 2;
      ctx.font = '500 22px "Bahnschrift", "Segoe UI", sans-serif';
      const labels = ['M', 'Av', 'Tv', 'P', 'A+', 'SCN', 'FILM', 'B'];
      for (let i = 0; i < 8; i += 1) {
        const a = -Math.PI / 2 + (i / 8) * Math.PI * 2;
        const x = Math.cos(a) * 155;
        const y = Math.sin(a) * 155;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a + Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], 0, 0);
        ctx.restore();
        ctx.save();
        ctx.rotate(a);
        ctx.strokeStyle = 'rgba(124,233,255,0.35)';
        ctx.beginPath();
        ctx.moveTo(0, 195);
        ctx.lineTo(0, 208);
        ctx.stroke();
        ctx.restore();
      }
      ctx.strokeStyle = 'rgba(124,233,255,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 185, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 118, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ff5438';
      ctx.beginPath();
      ctx.moveTo(0, -104);
      ctx.lineTo(10, -80);
      ctx.lineTo(-10, -80);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.32)';
      ctx.font = '13px "Consolas", monospace';
      ctx.fillText('EOS R8', -34, 8);
      ctx.restore();
    }, { key: 'dial-map', repeatX: 1, repeatY: 1 });

    const lensTextMap = canvasTexture(2048, 128, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(220,235,240,0.78)';
      ctx.font = '500 28px "Bahnschrift", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CANON  RF 28-70mm  1:2.8  IS STM', w * 0.25, 57);
      ctx.font = '18px "Consolas", monospace';
      ctx.fillStyle = 'rgba(160,210,225,0.65)';
      ctx.fillText('φ67mm   ·   0.27m/0.88ft   ·   OPTICAL STABILIZER', w * 0.25, 91);
      ctx.fillStyle = 'rgba(220,235,240,0.78)';
      ctx.font = '500 28px "Bahnschrift", "Segoe UI", sans-serif';
      ctx.fillText('CANON  RF 28-70mm  1:2.8  IS STM', w * 0.75, 57);
      ctx.font = '18px "Consolas", monospace';
      ctx.fillStyle = 'rgba(160,210,225,0.65)';
      ctx.fillText('φ67mm   ·   0.27m/0.88ft   ·   OPTICAL STABILIZER', w * 0.75, 91);
    }, { key: 'lens-text', repeatX: 1, repeatY: 1 });

    const glassMap = canvasTexture(512, 512, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const radial = ctx.createRadialGradient(cx * 0.72, cy * 0.62, 20, cx, cy, w * 0.5);
      radial.addColorStop(0, 'rgba(255,255,255,0.7)');
      radial.addColorStop(0.06, 'rgba(134,255,238,0.45)');
      radial.addColorStop(0.24, 'rgba(37,91,134,0.4)');
      radial.addColorStop(0.54, 'rgba(75,34,115,0.34)');
      radial.addColorStop(0.78, 'rgba(16,53,85,0.6)');
      radial.addColorStop(1, 'rgba(2,8,14,0.95)');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(cx, cy, w * 0.49, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(124,233,255,0.22)';
      ctx.lineWidth = 2;
      for (let i = 1; i <= 4; i += 1) {
        ctx.beginPath();
        ctx.arc(cx, cy, w * 0.1 * i, 0, Math.PI * 2);
        ctx.stroke();
      }

      const shine = ctx.createLinearGradient(0, 0, w, h);
      shine.addColorStop(0, 'rgba(255,255,255,0)');
      shine.addColorStop(0.42, 'rgba(255,255,255,0.28)');
      shine.addColorStop(0.47, 'rgba(255,255,255,0)');
      ctx.fillStyle = shine;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, w * 0.49, 0, Math.PI * 2);
      ctx.stroke();
    }, { key: 'glass-map', repeatX: 1, repeatY: 1 });

    const eosBadge = canvasTexture(640, 220, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(228,239,244,0.92)';
      ctx.font = '600 104px "Bahnschrift", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EOS R8', w / 2, 115);
      ctx.fillStyle = 'rgba(124,233,255,0.65)';
      ctx.font = '26px "Consolas", monospace';
      ctx.fillText('FULL FRAME  /  24.2 MP', w / 2, 166);
    }, { key: 'eos-badge', repeatX: 1, repeatY: 1 });

    const canonBadge = canvasTexture(512, 128, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(225,236,241,0.8)';
      ctx.font = '600 64px "Bahnschrift", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CANON', w / 2, 86);
    }, { key: 'canon-badge', repeatX: 1, repeatY: 1 });

    const batteryMap = canvasTexture(512, 640, (ctx, w, h) => {
      ctx.fillStyle = '#171b1e';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(225,240,245,0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, w - 24, h - 24);
      ctx.fillStyle = 'rgba(225,240,245,0.88)';
      ctx.font = '600 54px "Bahnschrift", "Segoe UI", sans-serif';
      ctx.fillText('Canon', 34, 93);
      ctx.fillStyle = 'rgba(124,233,255,0.8)';
      ctx.font = '600 77px "Bahnschrift", "Segoe UI", sans-serif';
      ctx.fillText('LP-E17', 34, 190);
      ctx.fillStyle = 'rgba(225,240,245,0.62)';
      ctx.font = '25px "Consolas", monospace';
      ctx.fillText('Li-ion Battery Pack', 36, 235);
      ctx.fillText('7.2V   1040mAh', 36, 284);
      ctx.fillText('CANON INC. MADE IN CHINA', 36, 326);
      ctx.fillStyle = 'rgba(255,83,54,0.78)';
      ctx.fillRect(36, 363, 158, 5);
      ctx.fillStyle = 'rgba(124,233,255,0.18)';
      ctx.fillRect(36, 393, 440, 2);
      ctx.fillStyle = 'rgba(220,235,240,0.32)';
      ctx.font = '18px "Consolas", monospace';
      ctx.fillText('R8 / PORTABLE POWER MODULE', 36, h - 34);
      ctx.strokeStyle = 'rgba(190,210,218,0.18)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.moveTo(36, 430 + i * 20);
        ctx.lineTo(476, 430 + i * 20);
        ctx.stroke();
      }
    }, { key: 'battery-map', repeatX: 1, repeatY: 1 });

    const sdMap = canvasTexture(640, 820, (ctx, w, h) => {
      ctx.fillStyle = '#11181f';
      ctx.fillRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, 'rgba(25,59,79,0.9)');
      grad.addColorStop(1, 'rgba(8,20,28,0.9)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.86)';
      ctx.font = '600 86px "Bahnschrift", "Segoe UI", sans-serif';
      ctx.fillText('SDXC', 42, 146);
      ctx.fillStyle = 'rgba(124,233,255,0.72)';
      ctx.font = '600 44px "Consolas", monospace';
      ctx.fillText('UHS-II  V90', 42, 215);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '25px "Consolas", monospace';
      ctx.fillText('128 GB   /   300 MB/s', 42, 268);
      ctx.fillStyle = 'rgba(255,83,54,0.82)';
      ctx.fillRect(42, 300, 220, 6);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.strokeRect(42, 340, w - 84, 250);
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      for (let i = 0; i < 9; i += 1) {
        ctx.fillRect(60 + i * 55, 370, 26, 190);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '17px "Consolas", monospace';
      ctx.fillText('CANON EOS R8 / HIGH BITRATE MEDIA', 42, h - 46);
    }, { key: 'sd-map', repeatX: 1, repeatY: 1 });

    const chipMap = canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#101417';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 18, w - 36, h - 36);
      ctx.fillStyle = 'rgba(218,234,240,0.78)';
      ctx.font = '600 72px "Bahnschrift", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DIGIC', w / 2, 232);
      ctx.fillStyle = 'rgba(255,84,58,0.92)';
      ctx.font = '600 142px "Bahnschrift", "Segoe UI", sans-serif';
      ctx.fillText('X', w / 2, 363);
      ctx.fillStyle = 'rgba(124,233,255,0.62)';
      ctx.font = '20px "Consolas", monospace';
      ctx.fillText('CANON  2022', w / 2, 422);
      for (let i = 0; i < 14; i += 1) {
        ctx.fillStyle = 'rgba(190,210,218,0.24)';
        ctx.fillRect(26 + i * 34, 12, 8, 6);
        ctx.fillRect(26 + i * 34, h - 18, 8, 6);
      }
    }, { key: 'chip-map', repeatX: 1, repeatY: 1 });

    const portMap = canvasTexture(512, 512, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(215,235,242,0.56)';
      ctx.font = '19px "Consolas", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MIC', w / 2, 90);
      ctx.fillText('HDMI', w / 2, 240);
      ctx.fillText('USB-C', w / 2, 390);
    }, { key: 'port-map', repeatX: 1, repeatY: 1 });

    glowTexture = canvasTexture(256, 256, (ctx, w, h) => {
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
      gradient.addColorStop(0.12, 'rgba(180,248,255,0.55)');
      gradient.addColorStop(0.38, 'rgba(92,214,255,0.18)');
      gradient.addColorStop(0.7, 'rgba(52,126,180,0.05)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }, { key: 'glow', wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping, srgb: false });

    TEX.bodyMap = bodyMap;
    TEX.bodyBump = bodyBump;
    TEX.leatherMap = leatherMap;
    TEX.leatherBump = leatherBump;
    TEX.ribBump = ribBump;
    TEX.brushedMetal = brushedMetal;
    TEX.sensorMap = sensorMap;
    TEX.pcbMap = pcbMap;
    TEX.screenMap = screenMap;
    TEX.evfMap = evfMap;
    TEX.dialMap = dialMap;
    TEX.lensTextMap = lensTextMap;
    TEX.glassMap = glassMap;
    TEX.eosBadge = eosBadge;
    TEX.canonBadge = canonBadge;
    TEX.batteryMap = batteryMap;
    TEX.sdMap = sdMap;
    TEX.chipMap = chipMap;
    TEX.portMap = portMap;
  }

  const TEX = {};

  function createEnvironment() {
    const envMap = canvasTexture(1024, 512, (ctx, w, h) => {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#040608');
      bg.addColorStop(0.35, '#07131b');
      bg.addColorStop(0.52, '#0b1b24');
      bg.addColorStop(0.6, '#03080c');
      bg.addColorStop(1, '#010304');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      function softbox(x, y, rx, ry, color, alpha) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
        g.addColorStop(0, color);
        g.addColorStop(0.35, color.replace(/[\d.]+\)$/, `${alpha * 0.45})`));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, ry / rx);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      softbox(w * 0.2, h * 0.26, 190, 90, 'rgba(255,244,226,0.95)', 0.8);
      softbox(w * 0.78, h * 0.33, 135, 130, 'rgba(110,220,255,0.8)', 0.58);
      softbox(w * 0.54, h * 0.18, 80, 50, 'rgba(255,255,255,0.8)', 0.4);
      softbox(w * 0.1, h * 0.62, 250, 42, 'rgba(51,131,164,0.65)', 0.4);
      softbox(w * 0.9, h * 0.68, 120, 80, 'rgba(255,76,48,0.5)', 0.3);

      ctx.fillStyle = 'rgba(255,255,255,0.055)';
      ctx.fillRect(0, h * 0.5, w, 2);
      ctx.fillStyle = 'rgba(124,233,255,0.05)';
      ctx.fillRect(0, h * 0.55, w, 1);
    }, {
      key: 'environment',
      mapping: THREE.EquirectangularReflectionMapping,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      srgb: true
    });

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const target = pmrem.fromEquirectangular(envMap);
    scene.environment = target.texture;
    envTexture = target.texture;
    envMap.dispose();
    pmrem.dispose();
  }

  /* -----------------------------------------------------------------------
     04 / MATERIALS
     ----------------------------------------------------------------------- */

  function std(color, options = {}) {
    return new THREE.MeshStandardMaterial(Object.assign({
      color,
      roughness: 0.46,
      metalness: 0.35,
      envMapIntensity: 0.9
    }, options));
  }

  function phys(color, options = {}) {
    return new THREE.MeshPhysicalMaterial(Object.assign({
      color,
      roughness: 0.3,
      metalness: 0.2,
      envMapIntensity: 1,
      clearcoat: 0.2
    }, options));
  }

  function matBody() {
    return std(0x0a0d10, {
      map: TEX.bodyMap,
      bumpMap: TEX.bodyBump,
      bumpScale: 0.04,
      roughness: 0.66,
      metalness: 0.24,
      envMapIntensity: 0.3
    });
  }

  function matMetal(color = 0x6c747b, roughness = 0.32) {
    return std(color, {
      map: TEX.brushedMetal,
      bumpMap: TEX.brushedMetal,
      bumpScale: 0.012,
      roughness,
      metalness: 0.86,
      envMapIntensity: 1.2
    });
  }

  function matDarkMetal(color = 0x101419) {
    return std(color, {
      roughness: 0.46,
      metalness: 0.58,
      envMapIntensity: 0.72
    });
  }

  function matRubber(color = 0x171b1e) {
    return std(color, {
      map: TEX.leatherMap,
      bumpMap: TEX.leatherBump,
      bumpScale: 0.028,
      roughness: 0.82,
      metalness: 0.05,
      envMapIntensity: 0.5
    });
  }

  function matPlastic(color = 0x111519, roughness = 0.42) {
    return std(color, {
      roughness,
      metalness: 0.1,
      envMapIntensity: 0.55
    });
  }

  function matBrass() {
    return std(0xb58b4a, {
      roughness: 0.28,
      metalness: 0.95,
      envMapIntensity: 1.3
    });
  }

  function matCopper() {
    return std(0x9f5d3d, {
      roughness: 0.32,
      metalness: 0.85,
      envMapIntensity: 1.1
    });
  }

  function matGlass(tint = 0x88d9e7, opacity = 0.32) {
    return phys(tint, {
      roughness: 0.06,
      metalness: 0.02,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      envMapIntensity: 1.8,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      depthWrite: false
    });
  }

  function matScreen(map) {
    return new THREE.MeshBasicMaterial({
      map,
      toneMapped: false,
      transparent: true,
      opacity: 0.96
    });
  }

  function matEmissive(color, intensity = 1.5) {
    return new THREE.MeshStandardMaterial({
      color: 0x05080b,
      emissive: color,
      emissiveIntensity: intensity,
      roughness: 0.4,
      metalness: 0.2
    });
  }

  /* -----------------------------------------------------------------------
     05 / GEOMETRY HELPERS
     ----------------------------------------------------------------------- */

  function roundedBoxGeometry(width, height, depth, radius = 0.16, segments = 4) {
    const geometry = new THREE.BoxGeometry(width, height, depth, segments, segments, segments);
    const position = geometry.attributes.position;
    const half = new THREE.Vector3(width / 2, height / 2, depth / 2);
    const inner = new THREE.Vector3(
      Math.max(0.001, half.x - radius),
      Math.max(0.001, half.y - radius),
      Math.max(0.001, half.z - radius)
    );
    const vertex = new THREE.Vector3();
    const normal = new THREE.Vector3();
    for (let i = 0; i < position.count; i += 1) {
      vertex.fromBufferAttribute(position, i);
      normal.set(vertex.x / half.x, vertex.y / half.y, vertex.z / half.z).normalize();
      vertex.x = clamp(vertex.x, -inner.x, inner.x) + normal.x * radius;
      vertex.y = clamp(vertex.y, -inner.y, inner.y) + normal.y * radius;
      vertex.z = clamp(vertex.z, -inner.z, inner.z) + normal.z * radius;
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  }

  function cylinderZ(radiusTop, radiusBottom, height, segments = 64, openEnded = false) {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments, 1, openEnded);
    geometry.rotateX(Math.PI / 2);
    return geometry;
  }

  function cylinderY(radiusTop, radiusBottom, height, segments = 48) {
    return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
  }

  function cylinderX(radiusTop, radiusBottom, height, segments = 48) {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
    geometry.rotateZ(Math.PI / 2);
    return geometry;
  }

  function registerMaterial(part, material) {
    if (!material) return;
    const list = Array.isArray(material) ? material : [material];
    list.forEach((mat) => {
      if (!mat || part.materialSet.has(mat)) return;
      part.materialSet.add(mat);
      if (mat.emissive) {
        mat.userData.baseEmissive = mat.emissive.clone();
        mat.userData.baseEmissiveIntensity = mat.emissiveIntensity || 0;
      }
      part.materials.push(mat);
    });
  }

  function addEdges(part, mesh) {
    if (!mesh.geometry) return;
    if (mesh.geometry.attributes.position.count > 38000) return;
    try {
      const edgeGeometry = new THREE.EdgesGeometry(mesh.geometry, 34);
      const material = new THREE.LineBasicMaterial({
        color: part.glowColor || 0x79eaff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.LineSegments(edgeGeometry, material);
      line.scale.setScalar(1.004);
      line.renderOrder = 5;
      mesh.add(line);
      part.edgeLines.push({ line, material });
    } catch (error) {
      /* EdgesGeometry can reject exotic geometry; the solid mesh still renders. */
    }
  }

  function partMesh(part, geometry, material, worldPosition, worldRotation = [0, 0, 0], options = {}) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(worldPosition[0], worldPosition[1], worldPosition[2]).sub(part.centerV);
    mesh.rotation.set(worldRotation[0], worldRotation[1], worldRotation[2]);
    mesh.castShadow = options.cast !== false;
    mesh.receiveShadow = options.receive !== false;
    mesh.userData.partId = part.id;
    registerMaterial(part, material);
    part.group.add(mesh);
    part.meshes.push(mesh);
    pickMeshes.push(mesh);
    if (options.edges !== false) addEdges(part, mesh);
    return mesh;
  }

  function partPlane(part, width, height, material, worldPosition, worldRotation = [0, 0, 0], options = {}) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(worldPosition[0], worldPosition[1], worldPosition[2]).sub(part.centerV);
    mesh.rotation.set(worldRotation[0], worldRotation[1], worldRotation[2]);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = options.renderOrder || 2;
    mesh.userData.partId = part.id;
    registerMaterial(part, material);
    part.group.add(mesh);
    part.meshes.push(mesh);
    pickMeshes.push(mesh);
    return mesh;
  }

  function partTorus(part, radius, tube, material, worldPosition, worldRotation = [0, 0, 0], radialSegments = 10, tubularSegments = 64, options = {}) {
    const geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, options.arc || Math.PI * 2);
    return partMesh(part, geometry, material, worldPosition, worldRotation, options);
  }

  function addKnurledRing(part, cx, cy, z, radius, width, count, material, ribWidth = 0.05, ribDepth = 0.12) {
    const geometry = new THREE.BoxGeometry(ribWidth, ribDepth, width);
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    mesh.userData.partId = part.id;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      dummy.position.set(
        cx + Math.cos(angle) * radius - part.centerV.x,
        cy + Math.sin(angle) * radius - part.centerV.y,
        z - part.centerV.z
      );
      dummy.rotation.set(0, 0, angle);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    registerMaterial(part, material);
    part.group.add(mesh);
    part.meshes.push(mesh);
    pickMeshes.push(mesh);
    return mesh;
  }

  function addDialKnurl(part, cx, cy, cz, radius, height, count, material) {
    const geometry = new THREE.BoxGeometry(0.055, height, 0.11);
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.userData.partId = part.id;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      dummy.position.set(cx + Math.cos(angle) * radius, cy, cz + Math.sin(angle) * radius).sub(part.centerV);
      dummy.rotation.set(0, -angle, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    registerMaterial(part, material);
    part.group.add(mesh);
    part.meshes.push(mesh);
    pickMeshes.push(mesh);
    return mesh;
  }

  function addSpringGeometry(radius, height, turns, wireRadius = 0.026, segments = 90) {
    const points = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * turns;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        t * height - height / 2,
        Math.sin(angle) * radius
      ));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, segments, wireRadius, 5, false);
  }

  /* -----------------------------------------------------------------------
     06 / MODEL BUILDERS
     ----------------------------------------------------------------------- */

  function buildBodyShell(part) {
    const body = matBody();
    const dark = matPlastic(0x101418, 0.52);
    const blackMetal = matDarkMetal(0x20262b);
    const chrome = matMetal(0x878f96, 0.26);
    const rubber = matRubber(0x14181c);

    partMesh(part, roundedBoxGeometry(10.6, 6.55, 4.85, 0.28, 5), body, [1.2, -0.6, -0.35], [0, 0, 0]);
    partMesh(part, roundedBoxGeometry(10.25, 6.18, 0.12, 0.16, 4), dark, [1.2, -0.6, 2.08], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(10.42, 0.24, 4.7, 0.08, 3), body, [1.2, 2.52, -0.35], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(10.2, 0.22, 4.55, 0.08, 3), body, [1.2, -3.77, -0.35], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(9.85, 0.44, 0.72, 0.1, 3), body, [1.2, 2.29, 1.78], [-0.24, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(8.9, 0.24, 0.45, 0.06, 2), dark, [1.2, 2.53, 1.64], [-0.2, 0, 0], { edges: false });

    const ringMat = matMetal(0x4f575f, 0.3);
    partMesh(part, new THREE.RingGeometry(3.3, 3.98, 72), ringMat, [1.1, 0.2, 2.14], [0, 0, 0], { edges: false });
    partTorus(part, 3.96, 0.055, matMetal(0x858e95, 0.2), [1.1, 0.2, 2.16], [0, 0, 0], 8, 96, { edges: false });
    partTorus(part, 3.32, 0.06, matDarkMetal(0x11161a), [1.1, 0.2, 2.17], [0, 0, 0], 8, 96, { edges: false });

    const eosMaterial = new THREE.MeshBasicMaterial({
      map: TEX.eosBadge,
      transparent: true,
      depthWrite: false,
      toneMapped: false
    });
    partPlane(part, 2.25, 0.78, eosMaterial, [4.75, -2.12, 2.151], [0, 0, 0], { renderOrder: 3 });

    const canonMaterial = new THREE.MeshBasicMaterial({
      map: TEX.canonBadge,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      opacity: 0.72
    });
    partPlane(part, 1.45, 0.36, canonMaterial, [-2.35, 2.0, 2.152], [0, 0, 0], { renderOrder: 3 });

    partMesh(part, cylinderZ(0.58, 0.63, 0.16, 36), dark, [4.4, -0.15, 2.14], [0, 0, 0], { edges: false });
    partTorus(part, 0.59, 0.045, chrome, [4.4, -0.15, 2.2], [0, 0, 0], 6, 40, { edges: false });
    partMesh(part, roundedBoxGeometry(0.44, 0.24, 0.08, 0.04, 2), matBrass(), [4.4, -0.4, 2.19], [0, 0, 0], { edges: false });

    partMesh(part, cylinderY(0.16, 0.16, 0.06, 24), matEmissive(0xff4b32, 1.4), [-2.25, 2.13, 2.14], [0, 0, 0], { edges: false });

    // Side strap lugs.
    partTorus(part, 0.3, 0.07, chrome, [6.52, 1.8, -0.82], [0, Math.PI / 2, 0], 6, 32, { edges: false });
    partTorus(part, 0.3, 0.07, chrome, [-4.12, 1.8, -0.82], [0, Math.PI / 2, 0], 6, 32, { edges: false });

    // Rear controls.
    partMesh(part, roundedBoxGeometry(1.28, 2.0, 0.18, 0.2, 3), rubber, [5.78, 0.55, -3.02], [0, 0, 0], { edges: false });
    partMesh(part, cylinderZ(0.46, 0.5, 0.16, 40), blackMetal, [5.2, -1.55, -2.98], [0, 0, 0], { edges: false });
    partTorus(part, 0.5, 0.055, chrome, [5.2, -1.55, -3.06], [0, 0, 0], 6, 48, { edges: false });
    partMesh(part, cylinderZ(0.16, 0.16, 0.13, 24), dark, [5.2, -1.55, -3.1], [0, 0, 0], { edges: false });

    const buttonPositions = [
      [5.05, -0.82], [5.05, -0.18], [5.05, 1.42], [5.78, 1.55], [4.75, -2.4]
    ];
    buttonPositions.forEach(([x, y]) => {
      partMesh(part, cylinderZ(0.17, 0.2, 0.13, 24), dark, [x, y, -3.0], [0, 0, 0], { edges: false });
      partTorus(part, 0.21, 0.025, matMetal(0x4d565d, 0.35), [x, y, -3.08], [0, 0, 0], 5, 28, { edges: false });
    });

    // Ports and side access covers.
    partMesh(part, roundedBoxGeometry(0.1, 1.25, 1.4, 0.12, 3), rubber, [6.58, -0.3, -1.0], [0, 0, 0], { edges: false });
    const portMaterial = new THREE.MeshBasicMaterial({
      map: TEX.portMap,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      opacity: 0.5
    });
    partPlane(part, 1.05, 1.05, portMaterial, [6.645, -0.3, -1.0], [0, Math.PI / 2, 0], { renderOrder: 3 });
    partMesh(part, roundedBoxGeometry(0.1, 1.2, 1.35, 0.1, 3), rubber, [6.58, 1.05, -1.0], [0, 0, 0], { edges: false });

    // Bottom tripod socket and battery hatch seam.
    partMesh(part, cylinderY(0.47, 0.51, 0.08, 42), chrome, [1.15, -3.92, -0.5], [0, 0, 0], { edges: false });
    partMesh(part, cylinderY(0.26, 0.26, 0.1, 36), dark, [1.15, -3.96, -0.5], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(2.7, 0.04, 1.6, 0.04, 2), dark, [-4.82, -3.92, 0.25], [0, 0, 0], { edges: false });
    partMesh(part, cylinderZ(0.08, 0.08, 0.07, 20), matMetal(0x6c747b, 0.28), [-3.5, -3.93, 0.6], [0, 0, 0], { edges: false });

    // Shell seam details.
    partMesh(part, roundedBoxGeometry(0.035, 5.7, 0.03, 0.01, 2), dark, [6.54, -0.7, 1.0], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.035, 5.7, 0.03, 0.01, 2), dark, [-4.12, -0.7, 1.0], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(7.8, 0.035, 0.03, 0.01, 2), dark, [1.2, -3.26, 2.12], [0, 0, 0], { edges: false });
  }

  function buildGrip(part) {
    const body = matBody();
    const rubber = matRubber(0x14181c);
    const dark = matPlastic(0x0d1114, 0.58);
    const chrome = matMetal(0x737b83, 0.3);

    const gripShape = new THREE.Shape();
    gripShape.moveTo(-1.58, -3.48);
    gripShape.quadraticCurveTo(-1.86, -2.95, -1.8, -2.1);
    gripShape.lineTo(-1.7, 1.72);
    gripShape.quadraticCurveTo(-1.68, 2.46, -1.08, 2.68);
    gripShape.lineTo(0.68, 2.78);
    gripShape.quadraticCurveTo(1.5, 2.78, 1.58, 2.02);
    gripShape.lineTo(1.58, -2.7);
    gripShape.quadraticCurveTo(1.58, -3.42, 0.92, -3.58);
    gripShape.lineTo(-0.98, -3.58);
    gripShape.quadraticCurveTo(-1.4, -3.58, -1.58, -3.48);
    const gripGeometry = new THREE.ExtrudeGeometry(gripShape, {
      depth: 4.82,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.14,
      bevelThickness: 0.14,
      curveSegments: 12
    });
    gripGeometry.translate(0, 0, -2.41);
    partMesh(part, gripGeometry, body, [-4.75, -0.55, 0.0], [0, 0, 0]);
    partMesh(part, roundedBoxGeometry(3.04, 5.22, 1.35, 0.5, 5), rubber, [-4.9, -0.52, 2.38], [0, 0, 0]);
    partMesh(part, roundedBoxGeometry(3.12, 0.2, 4.75, 0.1, 3), body, [-4.76, 2.38, -0.02], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(3.35, 0.48, 4.3, 0.2, 4), body, [-4.78, 2.12, -0.22], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(1.1, 2.12, 0.28, 0.2, 4), rubber, [-4.88, 0.92, -2.62], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.07, 4.45, 3.65, 0.22, 4), rubber, [-6.37, -0.58, 0.0], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.24, 1.7, 0.9, 0.2, 3), rubber, [-6.3, 1.15, -1.0], [0.08, 0, -0.06], { edges: false });
    for (let i = 0; i < 3; i += 1) {
      partMesh(part, roundedBoxGeometry(2.64, 0.075, 0.06, 0.025, 2), matRubber(0x0d1114), [-4.9, -2.15 + i * 0.92, 3.045], [0, 0, 0], { edges: false });
    }

    for (let i = 0; i < 5; i += 1) {
      partMesh(part, roundedBoxGeometry(0.055, 3.5, 0.14, 0.02, 2), dark, [-5.95 + i * 0.47, -0.65, 2.87], [0, 0, 0], { edges: false });
    }

    partMesh(part, roundedBoxGeometry(2.45, 0.05, 1.12, 0.02, 2), dark, [-4.85, -3.94, 0.32], [0, 0, 0], { edges: false });
    partMesh(part, cylinderZ(0.065, 0.065, 0.08, 20), chrome, [-3.55, -3.93, 0.83], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.05, 0.42, 0.05, 0.01, 2), matEmissive(0xff4d32, 0.8), [-6.33, 2.32, 0.8], [0, 0, 0], { edges: false });

    // Battery hatch label hint.
    const hatchMat = new THREE.MeshBasicMaterial({
      map: TEX.batteryMap,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      toneMapped: false
    });
    partPlane(part, 1.2, 1.5, hatchMat, [-4.83, -3.9, 0.3], [-Math.PI / 2, 0, 0], { renderOrder: 3 });
  }

  function buildTopCover(part) {
    const body = matBody();
    const dark = matPlastic(0x101418, 0.5);
    const blackMetal = matDarkMetal(0x20262b);
    const chrome = matMetal(0x8b939a, 0.24);
    const rubber = matRubber(0x14171a);

    partMesh(part, roundedBoxGeometry(12.55, 0.42, 4.65, 0.12, 4), body, [0.15, 2.85, -0.35], [0, 0, 0]);
    partMesh(part, roundedBoxGeometry(12.18, 0.28, 4.3, 0.09, 3), dark, [0.15, 2.6, -0.35], [0, 0, 0], { edges: false });

    // EVF housing / prism hump.
    partMesh(part, roundedBoxGeometry(4.35, 1.55, 3.35, 0.28, 5), body, [1.25, 3.66, -0.5], [0, 0, 0]);
    partMesh(part, roundedBoxGeometry(3.92, 0.38, 3.08, 0.13, 4), body, [1.25, 4.46, -0.54], [0, 0, 0]);
    partMesh(part, roundedBoxGeometry(3.75, 0.9, 0.44, 0.16, 4), body, [1.25, 3.72, 1.16], [-0.2, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(4.15, 0.82, 0.3, 0.1, 3), body, [1.25, 3.25, 1.05], [-0.12, 0, 0], { edges: false });

    // Eyecup.
    partMesh(part, roundedBoxGeometry(3.3, 1.55, 0.62, 0.23, 4), rubber, [1.25, 3.48, -2.36], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(2.36, 0.94, 0.06, 0.06, 3), matPlastic(0x030507, 0.18), [1.25, 3.48, -2.69], [0, 0, 0], { edges: false });

    // Hot shoe.
    partMesh(part, roundedBoxGeometry(1.72, 0.16, 1.62, 0.06, 3), blackMetal, [1.25, 4.69, -0.54], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(1.9, 0.1, 0.1, 0.02, 2), chrome, [1.25, 4.77, 0.27], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(1.9, 0.1, 0.1, 0.02, 2), chrome, [1.25, 4.77, -1.35], [0, 0, 0], { edges: false });
    for (let i = 0; i < 5; i += 1) {
      partMesh(part, roundedBoxGeometry(0.08, 0.03, 0.52, 0.01, 1), matBrass(), [0.89 + i * 0.18, 4.78, -0.54], [0, 0, 0], { edges: false });
    }

    // Mode dial.
    partMesh(part, cylinderY(1.18, 1.18, 0.32, 64), dark, [4.45, 3.07, 0.35], [0, 0, 0], { edges: false });
    addDialKnurl(part, 4.45, 3.18, 0.35, 1.17, 0.34, 44, blackMetal);
    const dialMaterial = new THREE.MeshBasicMaterial({
      map: TEX.dialMap,
      transparent: true,
      toneMapped: false
    });
    partMesh(part, new THREE.CircleGeometry(1.14, 64), dialMaterial, [4.45, 3.255, 0.35], [-Math.PI / 2, 0, 0], { edges: false });
    partMesh(part, cylinderY(1.3, 1.3, 0.12, 64), blackMetal, [4.45, 2.92, 0.35], [0, 0, 0], { edges: false });

    // Shutter button + power collar.
    partMesh(part, cylinderY(0.64, 0.68, 0.16, 40), chrome, [-4.9, 2.97, -1.38], [0, 0, 0], { edges: false });
    partMesh(part, cylinderY(0.52, 0.54, 0.2, 40), dark, [-4.9, 3.09, -1.38], [0, 0, 0], { edges: false });
    partMesh(part, cylinderY(0.2, 0.2, 0.035, 24), matPlastic(0x06080a, 0.34), [-4.9, 3.2, -1.38], [0, 0, 0], { edges: false });
    partTorus(part, 0.74, 0.08, blackMetal, [-4.9, 2.96, -1.38], [-Math.PI / 2, 0, 0], 6, 48, { edges: false });
    partMesh(part, roundedBoxGeometry(0.48, 0.14, 0.28, 0.04, 2), chrome, [-5.22, 2.96, -1.06], [0, 0, 0], { edges: false });

    // Front command dial on the grip shoulder.
    partMesh(part, cylinderX(0.64, 0.64, 0.24, 40), dark, [-5.46, 2.71, 0.68], [0, 0, 0], { edges: false });
    partMesh(part, cylinderX(0.47, 0.47, 0.27, 36), matPlastic(0x11161a, 0.44), [-5.47, 2.71, 0.68], [0, 0, 0], { edges: false });
    partTorus(part, 0.61, 0.03, matMetal(0x7e878e, 0.3), [-5.58, 2.71, 0.68], [0, Math.PI / 2, 0], 5, 40, { edges: false });

    // Movie button.
    partMesh(part, cylinderY(0.24, 0.24, 0.12, 32), matEmissive(0xff3f2b, 1.3), [-3.52, 3.08, -1.23], [0, 0, 0], { edges: false });
    partTorus(part, 0.3, 0.035, chrome, [-3.52, 2.99, -1.23], [-Math.PI / 2, 0, 0], 5, 36, { edges: false });

    // Function button and microphone perforations.
    partMesh(part, cylinderY(0.2, 0.2, 0.1, 28), dark, [3.15, 3.08, 1.27], [0, 0, 0], { edges: false });
    for (let i = 0; i < 6; i += 1) {
      partMesh(part, cylinderY(0.035, 0.035, 0.02, 12), matPlastic(0x050607, 0.2), [-1.0 + i * 0.28, 3.075, 1.42], [0, 0, 0], { edges: false });
    }

    const topCanonMaterial = new THREE.MeshBasicMaterial({
      map: TEX.canonBadge,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      opacity: 0.6
    });
    partPlane(part, 1.1, 0.28, topCanonMaterial, [1.25, 3.36, 1.35], [0, 0, 0], { renderOrder: 3 });

    const topModelMaterial = new THREE.MeshBasicMaterial({
      map: TEX.eosBadge,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      opacity: 0.8
    });
    partPlane(part, 1.7, 0.58, topModelMaterial, [-2.2, 3.085, 1.65], [-Math.PI / 2, 0, 0], { renderOrder: 4 });
  }

  function buildEVF(part) {
    const dark = matPlastic(0x0b1014, 0.36);
    const chrome = matMetal(0x555f67, 0.3);
    const screen = matScreen(TEX.evfMap);

    partMesh(part, roundedBoxGeometry(2.65, 1.15, 2.25, 0.13, 4), dark, [1.25, 3.52, -0.7], [0, 0, 0]);
    partMesh(part, roundedBoxGeometry(1.55, 0.86, 0.1, 0.04, 2), dark, [1.25, 3.54, 0.48], [0, 0, 0], { edges: false });
    partMesh(part, new THREE.CircleGeometry(0.75, 40), screen, [1.25, 3.54, 0.54], [0, 0, 0], { edges: false });
    partMesh(part, cylinderZ(0.63, 0.7, 0.24, 48), chrome, [1.25, 3.54, -1.88], [0, 0, 0], { edges: false });
    partMesh(part, new THREE.CircleGeometry(0.53, 40), matGlass(0x84d9e8, 0.45), [1.25, 3.54, -2.005], [0, 0, 0], { edges: false });
    partTorus(part, 0.67, 0.045, chrome, [1.25, 3.54, -2.0], [0, 0, 0], 6, 48, { edges: false });
    partMesh(part, cylinderX(0.27, 0.27, 0.18, 28), dark, [2.7, 3.5, -1.12], [0, 0, 0], { edges: false });
    partTorus(part, 0.29, 0.03, chrome, [2.79, 3.5, -1.12], [0, Math.PI / 2, 0], 5, 32, { edges: false });
    partMesh(part, roundedBoxGeometry(0.06, 0.42, 0.78, 0.02, 2), matCopper(), [2.78, 3.16, -0.85], [0, 0, 0], { edges: false });
  }

  function buildLCD(part) {
    const dark = matPlastic(0x0a0e12, 0.46);
    const blackMetal = matDarkMetal(0x1b2025);
    const chrome = matMetal(0x697178, 0.3);

    partMesh(part, roundedBoxGeometry(7.05, 5.2, 0.34, 0.16, 4), blackMetal, [1.0, -0.72, -3.02], [0, 0, 0]);
    partMesh(part, roundedBoxGeometry(6.62, 4.85, 0.14, 0.1, 3), dark, [1.0, -0.72, -3.21], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(6.1, 4.2, 0.04, 0.04, 2), matPlastic(0x020304, 0.22), [1.0, -0.72, -3.3], [0, 0, 0], { edges: false });
    partMesh(part, new THREE.PlaneGeometry(5.95, 4.05), matScreen(TEX.screenMap), [1.0, -0.72, -3.325], [0, Math.PI, 0], { edges: false });
    partMesh(part, cylinderY(0.28, 0.28, 4.95, 32), dark, [-2.48, -0.72, -2.94], [0, 0, 0], { edges: false });
    partMesh(part, cylinderY(0.36, 0.36, 0.22, 32), chrome, [-2.48, -3.13, -2.94], [0, 0, 0], { edges: false });
    partMesh(part, cylinderY(0.36, 0.36, 0.22, 32), chrome, [-2.48, 1.69, -2.94], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.18, 0.08, 0.04, 0.01, 2), matEmissive(0x74e7ff, 1), [4.25, -2.72, -3.23], [0, 0, 0], { edges: false });

    // Hinge ribbing.
    for (let i = 0; i < 7; i += 1) {
      partMesh(part, roundedBoxGeometry(0.12, 0.18, 0.34, 0.02, 2), dark, [-2.48, -2.72 + i * 0.65, -2.94], [0, 0, 0], { edges: false });
    }
  }

  function buildMount(part) {
    const chrome = matMetal(0xa6afb5, 0.2);
    const steel = matMetal(0x6a737a, 0.32);
    const dark = matDarkMetal(0x0b1115);
    const gold = matBrass();

    partMesh(part, cylinderZ(3.35, 3.35, 0.38, 80, true), steel, [1.1, 0.2, 2.3], [0, 0, 0], { edges: false });
    partTorus(part, 3.22, 0.15, chrome, [1.1, 0.2, 2.52], [0, 0, 0], 10, 96, { edges: false });
    partTorus(part, 2.9, 0.09, steel, [1.1, 0.2, 2.55], [0, 0, 0], 8, 96, { edges: false });
    partMesh(part, cylinderZ(2.95, 3.1, 0.4, 64, true), dark, [1.1, 0.2, 2.26], [0, 0, 0], { edges: false });

    const tabMaterial = matMetal(0x8d969c, 0.26);
    [0.2, 2.5, 4.4].forEach((angle) => {
      const x = 1.1 + Math.cos(angle) * 2.54;
      const y = 0.2 + Math.sin(angle) * 2.54;
      partMesh(part, roundedBoxGeometry(0.9, 0.2, 0.09, 0.03, 2), tabMaterial, [x, y, 2.57], [0, 0, angle], { edges: false });
    });

    for (let i = 0; i < 12; i += 1) {
      const angle = -1.05 + i * 0.19;
      const x = 1.1 + Math.cos(angle) * 2.34;
      const y = 0.2 + Math.sin(angle) * 2.34;
      partMesh(part, roundedBoxGeometry(0.08, 0.14, 0.08, 0.01, 1), gold, [x, y, 2.59], [0, 0, angle], { edges: false });
    }

    partMesh(part, new THREE.SphereGeometry(0.09, 18, 12), matEmissive(0xff3d28, 1.8), [1.1, 3.0, 2.56], [0, 0, 0], { edges: false });
    partMesh(part, cylinderZ(0.16, 0.16, 0.1, 24), dark, [4.1, -1.35, 2.55], [0, 0, 0], { edges: false });
    partMesh(part, cylinderZ(0.08, 0.08, 0.04, 16), chrome, [4.1, -1.35, 2.61], [0, 0, 0], { edges: false });
  }

  function buildSensor(part) {
    const dark = matPlastic(0x0a0e12, 0.34);
    const ceramic = std(0x15211e, { roughness: 0.55, metalness: 0.2 });
    const gold = matBrass();
    const chrome = matMetal(0x555e66, 0.34);

    partMesh(part, roundedBoxGeometry(5.35, 4.25, 0.82, 0.16, 4), ceramic, [1.1, 0.2, 0.2], [0, 0, 0]);
    partMesh(part, roundedBoxGeometry(4.25, 3.1, 0.16, 0.06, 3), dark, [1.1, 0.2, 0.66], [0, 0, 0], { edges: false });
    partMesh(part, new THREE.PlaneGeometry(3.6, 2.4), matScreen(TEX.sensorMap), [1.1, 0.2, 0.755], [0, 0, 0], { edges: false });
    partMesh(part, new THREE.PlaneGeometry(3.85, 2.65), matGlass(0x4fc7e2, 0.16), [1.1, 0.2, 0.79], [0, 0, 0], { edges: false });

    // Sensor frame and mount screws.
    const frameMaterial = matEmissive(0x5fe6ff, 0.3);
    partMesh(part, roundedBoxGeometry(4.02, 0.045, 0.04, 0.01, 2), frameMaterial, [1.1, 1.42, 0.78], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(4.02, 0.045, 0.04, 0.01, 2), frameMaterial, [1.1, -1.02, 0.78], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.045, 2.48, 0.04, 0.01, 2), frameMaterial, [-0.93, 0.2, 0.78], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.045, 2.48, 0.04, 0.01, 2), frameMaterial, [3.13, 0.2, 0.78], [0, 0, 0], { edges: false });

    partMesh(part, roundedBoxGeometry(3.9, 0.24, 0.12, 0.03, 2), gold, [1.1, -1.64, 0.62], [0, 0, 0], { edges: false });
    for (let i = 0; i < 4; i += 1) {
      partMesh(part, cylinderZ(0.12, 0.12, 0.05, 18), chrome, [0.05 + i * 0.7, 2.1, 0.7], [0, 0, 0], { edges: false });
     }

    // Rear heat spreader fins.
    for (let i = 0; i < 6; i += 1) {
      partMesh(part, roundedBoxGeometry(4.8, 0.06, 0.28, 0.02, 2), matMetal(0x2c343b, 0.38), [1.1, -1.25 + i * 0.5, -0.28], [0, 0, 0], { edges: false });
    }
  }

  function buildShutter(part) {
    const frame = matDarkMetal(0x252b30);
    const blade = std(0x111519, { roughness: 0.52, metalness: 0.42 });
    const gold = matBrass();
    const dark = matPlastic(0x080b0e, 0.38);

    // Four-sided frame leaves a real opening for the sensor.
    partMesh(part, roundedBoxGeometry(6.1, 0.38, 0.56, 0.1, 3), frame, [1.1, 2.3, 1.0], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(6.1, 0.38, 0.56, 0.1, 3), frame, [1.1, -1.9, 1.0], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.38, 4.2, 0.56, 0.1, 3), frame, [-1.95, 0.2, 1.0], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.38, 4.2, 0.56, 0.1, 3), frame, [4.15, 0.2, 1.0], [0, 0, 0], { edges: false });

    for (let i = 0; i < 7; i += 1) {
      partMesh(part, roundedBoxGeometry(3.4, 0.32, 0.035, 0.02, 2), blade, [1.1, -1.0 + i * 0.42, 1.12], [0, 0, (i % 2 ? 1 : -1) * 0.05], { edges: false });
    }

    partMesh(part, roundedBoxGeometry(1.4, 0.65, 0.18, 0.04, 2), dark, [4.1, -2.18, 1.08], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(2.1, 0.1, 0.07, 0.02, 2), gold, [-0.9, -2.18, 1.15], [0, 0, 0], { edges: false });
    partMesh(part, cylinderZ(0.22, 0.22, 0.33, 28), matMetal(0x5a6269, 0.3), [4.1, -1.78, 1.08], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.5, 0.06, 0.04, 0.01, 2), matEmissive(0xff5a3d, 0.8), [1.1, 2.34, 1.3], [0, 0, 0], { edges: false });
  }

  function buildMainboard(part) {
    const pcb = std(0x0c1b16, {
      map: TEX.pcbMap,
      roughness: 0.63,
      metalness: 0.28,
      envMapIntensity: 0.65
    });
    const dark = matPlastic(0x0b0e11, 0.3);
    const chip = matPlastic(0x0c1014, 0.34);
    const gold = matBrass();
    const copper = matCopper();

    partMesh(part, roundedBoxGeometry(5.8, 4.8, 0.16, 0.06, 3), pcb, [1.1, -0.05, -1.38], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(5.55, 4.55, 0.08, 0.05, 2), matMetal(0x252d33, 0.42), [1.1, -0.05, -1.49], [0, 0, 0], { edges: false });

    // DIGIC X processor and heatsink.
    partMesh(part, roundedBoxGeometry(1.55, 1.55, 0.14, 0.03, 2), chip, [1.65, 0.7, -1.24], [0, 0, 0], { edges: false });
    const chipMaterial = new THREE.MeshBasicMaterial({
      map: TEX.chipMap,
      transparent: true,
      toneMapped: false
    });
    partPlane(part, 1.28, 1.28, chipMaterial, [1.65, 0.7, -1.158], [0, 0, 0], { renderOrder: 4 });
    partMesh(part, roundedBoxGeometry(1.9, 1.9, 0.08, 0.04, 2), matMetal(0x3b444b, 0.36), [1.65, 0.7, -1.52], [0, 0, 0], { edges: false });

    partMesh(part, roundedBoxGeometry(1.25, 0.95, 0.12, 0.02, 2), dark, [-0.25, 0.78, -1.25], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.88, 0.65, 0.12, 0.02, 2), dark, [-1.15, -0.45, -1.25], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.8, 1.2, 0.13, 0.02, 2), dark, [3.0, -1.0, -1.25], [0, 0, 0], { edges: false });

    for (let i = 0; i < 12; i += 1) {
      const x = -1.85 + (i % 4) * 0.52;
      const y = -1.65 + Math.floor(i / 4) * 0.4;
      partMesh(part, cylinderZ(0.12, 0.12, 0.16, 16), copper, [x, y, -1.2], [0, 0, 0], { edges: false });
    }

    // Connector sockets and ribbon tail.
    partMesh(part, roundedBoxGeometry(1.2, 0.34, 0.24, 0.04, 2), dark, [-1.7, 1.65, -1.22], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.9, 0.24, 0.2, 0.03, 2), gold, [3.1, 1.55, -1.22], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.22, 2.25, 0.03, 0.01, 2), gold, [-2.48, 0.35, -1.29], [0, 0, 0], { edges: false });

    // Shielding and screw points.
    for (let i = 0; i < 4; i += 1) {
      partMesh(part, cylinderZ(0.09, 0.09, 0.05, 16), gold, [0.1 + (i % 2) * 2.0, -1.5 + Math.floor(i / 2) * 2.85, -1.16], [0, 0, 0], { edges: false });
    }
  }

  function buildBattery(part) {
    const plastic = matPlastic(0x14191d, 0.55);
    const dark = matPlastic(0x090c0f, 0.45);
    const gold = matBrass();
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: TEX.batteryMap,
      toneMapped: false
    });

    partMesh(part, roundedBoxGeometry(1.55, 4.75, 3.05, 0.12, 4), plastic, [-4.88, -0.55, 0.3], [0, 0, 0]);
    partMesh(part, roundedBoxGeometry(1.6, 0.28, 3.1, 0.08, 3), dark, [-4.88, 1.82, 0.3], [0, 0, 0], { edges: false });
    partPlane(part, 1.48, 3.05, labelMaterial, [-4.08, -0.5, 0.3], [0, Math.PI / 2, 0], { renderOrder: 3 });
    partPlane(part, 1.48, 3.05, labelMaterial, [-5.68, -0.5, 0.3], [0, -Math.PI / 2, 0], { renderOrder: 3 });
    partMesh(part, roundedBoxGeometry(1.62, 0.9, 3.12, 0.09, 3), dark, [-4.88, -2.5, 0.3], [0, 0, 0], { edges: false });

    for (let i = 0; i < 3; i += 1) {
      partMesh(part, roundedBoxGeometry(0.22, 0.08, 0.28, 0.02, 2), gold, [-5.05 + i * 0.22, 1.97, 0.9], [0, 0, 0], { edges: false });
    }
    partMesh(part, roundedBoxGeometry(0.42, 0.16, 0.08, 0.02, 2), matEmissive(0x7ce9ff, 0.5), [-4.08, 1.55, 1.55], [0, Math.PI / 2, 0], { edges: false });
  }

  function buildSDCard(part) {
    const plastic = matPlastic(0x10161c, 0.4);
    const dark = matPlastic(0x070b0e, 0.45);
    const gold = matBrass();
    const sdMaterial = new THREE.MeshBasicMaterial({
      map: TEX.sdMap,
      toneMapped: false
    });

    partMesh(part, roundedBoxGeometry(2.4, 3.15, 0.2, 0.05, 3), plastic, [-4.35, 0.75, -2.45], [0, 0, 0]);
    partPlane(part, 2.2, 2.92, sdMaterial, [-4.35, 0.75, -2.34], [0, 0, 0], { renderOrder: 3 });
    partPlane(part, 2.2, 2.92, sdMaterial, [-4.35, 0.75, -2.56], [0, Math.PI, 0], { renderOrder: 3 });
    partMesh(part, roundedBoxGeometry(1.82, 0.22, 0.22, 0.03, 2), dark, [-4.35, -0.82, -2.45], [0, 0, 0], { edges: false });
    for (let i = 0; i < 7; i += 1) {
      partMesh(part, roundedBoxGeometry(0.18, 0.05, 0.22, 0.01, 1), gold, [-5.1 + i * 0.25, 2.28, -2.45], [0, 0, 0], { edges: false });
    }
    partMesh(part, roundedBoxGeometry(0.22, 0.2, 0.05, 0.01, 2), matEmissive(0xff5b3f, 0.8), [-5.38, 1.25, -2.45], [0, 0, 0], { edges: false });
  }

  function buildLensBarrel(part) {
    const blackMetal = matDarkMetal(0x161b1f);
    const dark = matPlastic(0x070a0c, 0.5);
    const rubber = matRubber(0x101316);
    const chrome = matMetal(0x7b848b, 0.27);
    const inner = matPlastic(0x030506, 0.7);
    const cx = 1.1;
    const cy = 0.2;

    // Rear mount collar.
    partMesh(part, cylinderZ(3.55, 3.62, 1.0, 96, true), blackMetal, [cx, cy, 3.12], [0, 0, 0], { edges: false });
    partTorus(part, 3.59, 0.06, chrome, [cx, cy, 2.67], [0, 0, 0], 8, 96, { edges: false });
    partTorus(part, 3.64, 0.035, matMetal(0x49545b, 0.36), [cx, cy, 3.61], [0, 0, 0], 8, 96, { edges: false });

    // Control ring.
    partMesh(part, cylinderZ(3.82, 3.82, 0.58, 96, true), dark, [cx, cy, 3.93], [0, 0, 0], { edges: false });
    addKnurledRing(part, cx, cy, 3.93, 3.86, 0.54, 64, rubber, 0.055, 0.1);

    // Middle barrel section.
    partMesh(part, cylinderZ(3.75, 3.78, 1.0, 96, true), blackMetal, [cx, cy, 4.82], [0, 0, 0], { edges: false });
    partTorus(part, 3.78, 0.04, chrome, [cx, cy, 5.34], [0, 0, 0], 8, 96, { edges: false });

    // Broad zoom ring.
    partMesh(part, cylinderZ(3.91, 3.91, 3.2, 96, true), rubber, [cx, cy, 6.92], [0, 0, 0], { edges: false });
    addKnurledRing(part, cx, cy, 6.92, 3.95, 3.12, 88, matRubber(0x15191d), 0.075, 0.085);
    partTorus(part, 3.94, 0.035, matMetal(0x596267, 0.34), [cx, cy, 5.43], [0, 0, 0], 7, 96, { edges: false });
    partTorus(part, 3.94, 0.035, matMetal(0x596267, 0.34), [cx, cy, 8.41], [0, 0, 0], 7, 96, { edges: false });

    // Focus ring.
    partMesh(part, cylinderZ(3.82, 3.86, 1.08, 96, true), blackMetal, [cx, cy, 9.2], [0, 0, 0], { edges: false });
    addKnurledRing(part, cx, cy, 9.2, 3.87, 1.02, 72, rubber, 0.055, 0.09);

    // Front barrel.
    partMesh(part, cylinderZ(3.67, 3.82, 2.8, 96, true), blackMetal, [cx, cy, 11.22], [0, 0, 0], { edges: false });
    partTorus(part, 3.72, 0.05, chrome, [cx, cy, 12.72], [0, 0, 0], 8, 96, { edges: false });
    partMesh(part, cylinderZ(3.58, 3.58, 0.28, 80, true), inner, [cx, cy, 12.87], [0, 0, 0], { edges: false });
    partMesh(part, cylinderZ(3.27, 3.32, 9.6, 72, true), inner, [cx, cy, 8.0], [0, 0, 0], { edges: false });

    // Printed lens band.
    const lensTextMaterial = new THREE.MeshBasicMaterial({
      map: TEX.lensTextMap,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      opacity: 0.92,
      side: THREE.DoubleSide
    });
    partMesh(part, cylinderZ(3.79, 3.79, 0.46, 96, true), lensTextMaterial, [cx, cy, 11.87], [0, 0, 0], { edges: false });

    // Switch panel at the rear upper side.
    partMesh(part, roundedBoxGeometry(1.55, 0.1, 1.1, 0.05, 3), dark, [cx - 1.45, 4.0, 3.64], [0, 0, 0], { edges: false });
    const switchLabel = canvasTexture(256, 128, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(228,242,247,0.72)';
      ctx.font = '17px "Consolas", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('AF   |   MF', w / 2, 26);
      ctx.fillText('STABILIZER   ON', w / 2, 108);
    }, { key: 'switch-label', srgb: true, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping });
    const switchMat = new THREE.MeshBasicMaterial({
      map: switchLabel,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      opacity: 0.8
    });
    partPlane(part, 1.6, 0.8, switchMat, [cx - 1.45, 4.06, 3.64], [-Math.PI / 2, 0, 0], { renderOrder: 4 });
    partMesh(part, roundedBoxGeometry(0.34, 0.11, 0.22, 0.03, 2), matMetal(0x616a70, 0.3), [cx - 1.85, 4.06, 3.3], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.34, 0.11, 0.22, 0.03, 2), matMetal(0x616a70, 0.3), [cx - 1.05, 4.06, 3.3], [0, 0, 0], { edges: false });

    // Red index dot and small screws.
    partMesh(part, new THREE.SphereGeometry(0.08, 16, 10), matEmissive(0xff3b26, 1.8), [cx + 3.66, cy - 0.22, 2.7], [0, 0, 0], { edges: false });
    for (let i = 0; i < 4; i += 1) {
      const angle = i * Math.PI / 2 + 0.4;
      partMesh(part, cylinderZ(0.065, 0.065, 0.04, 14), matMetal(0x9aa2a7, 0.3), [
        cx + Math.cos(angle) * 3.55,
        cy + Math.sin(angle) * 3.55,
        3.0
      ], [0, 0, 0], { edges: false });
    }
  }

  function buildFrontElement(part) {
    const chrome = matMetal(0x9ba4aa, 0.22);
    const dark = matDarkMetal(0x1b2126);
    const glassMaterial = new THREE.MeshBasicMaterial({
      map: TEX.glassMap,
      transparent: true,
      toneMapped: false,
      opacity: 0.94
    });
    const domeMaterial = phys(0x6fd0e2, {
      roughness: 0.03,
      metalness: 0.04,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      envMapIntensity: 2.2,
      clearcoat: 1,
      clearcoatRoughness: 0.01,
      depthWrite: false
    });

    partTorus(part, 3.04, 0.13, chrome, [1.1, 0.2, 13.06], [0, 0, 0], 10, 96, { edges: false });
    partTorus(part, 3.26, 0.045, dark, [1.1, 0.2, 13.1], [0, 0, 0], 8, 96, { edges: false });
    partMesh(part, new THREE.CircleGeometry(2.94, 96), glassMaterial, [1.1, 0.2, 13.09], [0, 0, 0], { edges: false });

    const dome = new THREE.SphereGeometry(3.18, 80, 28, 0, Math.PI * 2, 0, 0.44);
    dome.rotateX(Math.PI / 2);
    partMesh(part, dome, domeMaterial, [1.1, 0.2, 10.0], [0, 0, 0], { edges: false, cast: false, receive: false });

    // Inner coating reflections.
    const reflectionMaterial = new THREE.MeshBasicMaterial({
      color: 0xbff7ff,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    partMesh(part, new THREE.RingGeometry(1.35, 1.42, 64), reflectionMaterial, [1.1, 0.5, 13.12], [0, 0, 0], { edges: false });
    partMesh(part, new THREE.RingGeometry(2.35, 2.38, 80), reflectionMaterial, [1.1, 0.2, 13.13], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.7, 0.04, 0.03, 0.01, 2), matEmissive(0x7ce9ff, 0.5), [2.2, 2.65, 13.14], [0, 0, 0], { edges: false });
  }

  function buildOpticalCore(part) {
    const glassA = matGlass(0x69d4e8, 0.32);
    const glassB = matGlass(0x8e9bff, 0.26);
    const glassC = matGlass(0x8ee6c8, 0.28);
    const spacer = matDarkMetal(0x1b2227);
    const rim = matMetal(0x6b747b, 0.3);

    const elements = [
      { z: 6.55, r: 2.62, thickness: 0.12, material: glassA },
      { z: 7.45, r: 2.35, thickness: 0.18, material: glassB },
      { z: 8.45, r: 2.15, thickness: 0.14, material: glassC },
      { z: 9.55, r: 1.92, thickness: 0.2, material: glassA },
      { z: 10.55, r: 2.28, thickness: 0.13, material: glassB },
      { z: 11.55, r: 2.52, thickness: 0.17, material: glassC }
    ];

    elements.forEach((element, index) => {
      partMesh(part, cylinderZ(element.r, element.r, element.thickness, 64, false), element.material, [1.1, 0.2, element.z], [0, 0, 0], { edges: index % 2 === 0, cast: false, receive: false });
      partTorus(part, element.r - 0.04, 0.035, rim, [1.1, 0.2, element.z + 0.02], [0, 0, 0], 6, 64, { edges: false });
      if (index < elements.length - 1) {
        partMesh(part, cylinderZ(element.r - 0.12, element.r - 0.12, 0.22, 48, true), spacer, [1.1, 0.2, (element.z + elements[index + 1].z) / 2], [0, 0, 0], { edges: false });
      }
    });

    // Guide rods.
    [0, 2.1, 4.2].forEach((angle) => {
      partMesh(part, cylinderZ(0.055, 0.055, 6.25, 14), rim, [
        1.1 + Math.cos(angle) * 2.88,
        0.2 + Math.sin(angle) * 2.88,
        9.05
      ], [0, 0, 0], { edges: false });
    });

    // Central optical axis and floating light.
    partMesh(part, cylinderZ(0.025, 0.025, 5.6, 8), matEmissive(0x6de8ff, 0.35), [1.1, 0.2, 8.9], [0, 0, 0], { edges: false });
    partTorus(part, 1.19, 0.025, matEmissive(0xff5b40, 0.45), [1.1, 0.2, 8.95], [0, 0, 0], 6, 48, { edges: false });
  }

  function buildAperture(part) {
    const metal = matDarkMetal(0x171c20);
    const edge = matMetal(0x555f66, 0.32);
    const bladeMaterial = std(0x101419, { roughness: 0.44, metalness: 0.58, side: THREE.DoubleSide });

    partTorus(part, 2.48, 0.16, metal, [1.1, 0.2, 7.15], [0, 0, 0], 10, 80, { edges: false });
    partTorus(part, 2.24, 0.045, edge, [1.1, 0.2, 7.24], [0, 0, 0], 8, 80, { edges: false });

    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0.35, 0.16);
    bladeShape.lineTo(2.22, 0.05);
    bladeShape.lineTo(2.04, 0.72);
    bladeShape.lineTo(0.5, 0.58);
    bladeShape.closePath();
    const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, {
      depth: 0.035,
      bevelEnabled: false,
      curveSegments: 8
    });

    for (let i = 0; i < 9; i += 1) {
      const angle = (i / 9) * Math.PI * 2;
      partMesh(part, bladeGeometry, bladeMaterial, [1.1, 0.2, 7.19 + i * 0.004], [0, 0, angle], { edges: false, cast: false });
    }

    partMesh(part, roundedBoxGeometry(0.8, 0.22, 0.3, 0.04, 2), metal, [3.22, -0.83, 7.3], [0, 0, -0.45], { edges: false });
    partMesh(part, roundedBoxGeometry(0.38, 0.3, 0.18, 0.03, 2), matCopper(), [3.55, -0.98, 7.34], [0, 0, -0.45], { edges: false });
    partMesh(part, roundedBoxGeometry(1.8, 0.06, 0.04, 0.01, 2), matBrass(), [1.1, -2.34, 7.4], [0, 0, 0], { edges: false });
    partTorus(part, 0.74, 0.025, matEmissive(0xff5b40, 0.5), [1.1, 0.2, 7.27], [0, 0, 0], 6, 40, { edges: false });
  }

  function buildSTMMotor(part) {
    const metal = matMetal(0x5a636a, 0.32);
    const dark = matDarkMetal(0x171d22);
    const copper = matCopper();
    const gold = matBrass();

    partMesh(part, cylinderZ(0.52, 0.52, 1.5, 40), dark, [1.1, -1.48, 4.82], [0, 0, 0]);
    partMesh(part, cylinderZ(0.56, 0.56, 0.22, 40), copper, [1.1, -1.48, 4.25], [0, 0, 0], { edges: false });
    partMesh(part, cylinderZ(0.56, 0.56, 0.22, 40), copper, [1.1, -1.48, 5.38], [0, 0, 0], { edges: false });
    partMesh(part, cylinderZ(0.09, 0.09, 2.35, 16), metal, [1.1, -1.48, 5.95], [0, 0, 0], { edges: false });
    partMesh(part, cylinderZ(0.3, 0.3, 0.46, 32), metal, [1.1, -1.48, 4.05], [0, 0, 0], { edges: false });

    const gearMaterial = matMetal(0x8d969c, 0.26);
    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      partMesh(part, roundedBoxGeometry(0.1, 0.16, 0.14, 0.02, 1), gearMaterial, [
        1.1 + Math.cos(angle) * 0.42,
        -1.48 + Math.sin(angle) * 0.42,
        5.84
      ], [0, 0, angle], { edges: false });
    }
    partMesh(part, cylinderZ(0.28, 0.28, 0.16, 28), gearMaterial, [1.1, -1.48, 5.84], [0, 0, 0], { edges: false });

    partMesh(part, roundedBoxGeometry(1.1, 0.54, 0.08, 0.03, 2), std(0x0d1916, { roughness: 0.6, metalness: 0.2 }), [2.05, -1.48, 4.8], [0, 0.08, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.28, 0.26, 0.1, 0.02, 2), gold, [2.45, -1.48, 4.8], [0, 0, 0], { edges: false });
    for (let i = 0; i < 6; i += 1) {
      partMesh(part, roundedBoxGeometry(0.035, 0.5, 0.03, 0.01, 2), gold, [2.0 + i * 0.09, -1.48, 4.84], [0, 0, 0], { edges: false });
    }
    partMesh(part, new THREE.TorusGeometry(0.72, 0.025, 6, 48, Math.PI * 1.5), matEmissive(0x7ce9ff, 0.35), [1.1, -1.48, 4.4], [0, 0, 0], { edges: false });
  }

  function buildISUnit(part) {
    const metal = matMetal(0x707980, 0.3);
    const dark = matDarkMetal(0x171c21);
    const copper = matCopper();
    const gold = matBrass();
    const board = std(0x0b1814, { roughness: 0.55, metalness: 0.25 });

    partMesh(part, roundedBoxGeometry(2.2, 1.22, 0.9, 0.1, 3), metal, [1.1, 1.58, 4.55], [0, 0, 0]);
    partMesh(part, roundedBoxGeometry(1.8, 0.9, 0.18, 0.06, 2), dark, [1.1, 1.58, 4.03], [0, 0, 0], { edges: false });
    partTorus(part, 0.62, 0.13, copper, [0.3, 1.58, 4.54], [0, 0, 0], 8, 36, { edges: false });
    partTorus(part, 0.62, 0.13, copper, [1.9, 1.58, 4.54], [0, 0, 0], 8, 36, { edges: false });
    partMesh(part, cylinderZ(0.42, 0.42, 0.22, 32), dark, [0.3, 1.58, 4.54], [0, 0, 0], { edges: false });
    partMesh(part, cylinderZ(0.42, 0.42, 0.22, 32), dark, [1.9, 1.58, 4.54], [0, 0, 0], { edges: false });

    partMesh(part, roundedBoxGeometry(0.9, 0.62, 0.08, 0.03, 2), board, [2.42, 1.3, 4.55], [0, 0.2, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.23, 0.23, 0.08, 0.02, 2), gold, [2.24, 1.12, 4.58], [0, 0, 0], { edges: false });
    partMesh(part, roundedBoxGeometry(0.2, 0.2, 0.08, 0.02, 2), gold, [2.6, 1.4, 4.58], [0, 0, 0], { edges: false });

    const springGeometry = addSpringGeometry(0.12, 0.48, 4, 0.018, 60);
    [[-0.72, 1.1], [-0.72, 2.06], [2.92, 1.1], [2.92, 2.06]].forEach(([x, z]) => {
      partMesh(part, springGeometry, copper, [x, 1.72, z], [0, 0, 0], { edges: false });
    });

    partMesh(part, new THREE.TorusGeometry(0.82, 0.035, 6, 48), matEmissive(0xff5b40, 0.5), [1.1, 1.58, 4.0], [0, 0, 0], { edges: false });
  }

  const BUILDERS = {
    bodyShell: buildBodyShell,
    grip: buildGrip,
    topCover: buildTopCover,
    evf: buildEVF,
    lcd: buildLCD,
    mount: buildMount,
    sensor: buildSensor,
    shutter: buildShutter,
    mainboard: buildMainboard,
    battery: buildBattery,
    sdCard: buildSDCard,
    lensBarrel: buildLensBarrel,
    frontElement: buildFrontElement,
    opticalCore: buildOpticalCore,
    aperture: buildAperture,
    stmMotor: buildSTMMotor,
    isUnit: buildISUnit
  };

  /* -----------------------------------------------------------------------
     07 / SCENE
     ----------------------------------------------------------------------- */

  function initScene() {
    initTextures();

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04080c, 0.011);

    camera = new THREE.PerspectiveCamera(33, 1, 0.1, 200);
    camera.position.set(-17, 10.5, 32);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(view.dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    dom.stage.appendChild(renderer.domElement);

    createEnvironment();
    addLights();
    addEnvironmentSet();

    root = new THREE.Group();
    root.name = 'EOS_R8_TEARDOWN';
    scene.add(root);

    state.cam.target = new THREE.Vector3(1.1, 0.25, 5.2);
    state.cam.dTarget = state.cam.target.clone();

    buildModel();
    setupControls();
    resize();
    buildPartList();
    buildAnnotations();
    updateDetail(null);
    bindUI();

    clock = new THREE.Clock();
    animate();

    window.addEventListener('resize', resize);
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(resize);
      ro.observe(dom.stageWrap);
    }
  }

  function addLights() {
    const hemi = new THREE.HemisphereLight(0x98ddff, 0x080a0c, 0.72);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff3e8, 2.15);
    key.position.set(13, 17, 17);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 70;
    key.shadow.camera.left = -18;
    key.shadow.camera.right = 18;
    key.shadow.camera.top = 18;
    key.shadow.camera.bottom = -18;
    key.shadow.bias = -0.00035;
    key.shadow.normalBias = 0.04;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x65dfff, 1.75);
    rim.position.set(-14, 10, -12);
    scene.add(rim);

    const warm = new THREE.PointLight(0xff7c56, 1.5, 42, 2);
    warm.position.set(11, 1.6, 13);
    scene.add(warm);

    const cool = new THREE.PointLight(0x6be7ff, 1.1, 48, 2);
    cool.position.set(-12, 3.5, 9);
    scene.add(cool);

    const frontFill = new THREE.DirectionalLight(0xbfe9ff, 0.72);
    frontFill.position.set(-8, 4.5, 24);
    scene.add(frontFill);

    const topFill = new THREE.DirectionalLight(0xfff0e4, 0.38);
    topFill.position.set(3, 14, 8);
    scene.add(topFill);

    const top = new THREE.SpotLight(0xdaf8ff, 1.1, 55, 0.55, 0.7, 1.4);
    top.position.set(0, 21, 4);
    top.target.position.set(0.5, 0, 4);
    scene.add(top);
    scene.add(top.target);
  }

  function addEnvironmentSet() {
    const floorY = -4.24;

    // Shadow catcher.
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 70),
      new THREE.ShadowMaterial({ opacity: 0.42, color: 0x000000 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, floorY, 3);
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(18, 96),
      new THREE.MeshBasicMaterial({ color: 0x061016, transparent: true, opacity: 0.45, depthWrite: false })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(0.5, floorY + 0.01, 3.5);
    scene.add(disc);

    const grid = new THREE.GridHelper(56, 56, 0x2a5a68, 0x142b35);
    grid.position.set(0.5, floorY + 0.02, 3.5);
    grid.material.transparent = true;
    grid.material.opacity = 0.26;
    scene.add(grid);

    // Concentric technical platform rings.
    [7.6, 10.4, 13.2].forEach((radius, index) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(radius - 0.018, radius + 0.018, 128),
        new THREE.MeshBasicMaterial({
          color: index === 1 ? 0xff5033 : 0x67dcf4,
          transparent: true,
          opacity: index === 1 ? 0.28 : 0.17,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0.5, floorY + 0.035, 3.5);
      scene.add(ring);
    });

    // Radial tick marks.
    const tickGeo = new THREE.BoxGeometry(0.04, 0.012, 0.38);
    const tickMat = new THREE.MeshBasicMaterial({ color: 0x7fe8ff, transparent: true, opacity: 0.26 });
    const ticks = new THREE.InstancedMesh(tickGeo, tickMat, 72);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 72; i += 1) {
      const angle = (i / 72) * Math.PI * 2;
      const radius = i % 6 === 0 ? 13.55 : 13.4;
      dummy.position.set(
        0.5 + Math.cos(angle) * radius,
        floorY + 0.03,
        3.5 + Math.sin(angle) * radius
      );
      dummy.rotation.set(0, -angle, 0);
      dummy.scale.set(i % 6 === 0 ? 1.8 : 1, 1, 1);
      dummy.updateMatrix();
      ticks.setMatrixAt(i, dummy.matrix);
    }
    ticks.instanceMatrix.needsUpdate = true;
    scene.add(ticks);

    // Fine dust field.
    const count = 760;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const radius = 9 + Math.random() * 26;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius + 0.5;
      positions[i * 3 + 1] = -2 + Math.random() * 21;
      positions[i * 3 + 2] = Math.sin(angle) * radius + 3.5;
      sizes[i] = 0.3 + Math.random() * 1.4;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({
        color: 0x6ed9f3,
        size: 0.055,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      })
    );
    particles.name = 'dust';
    scene.add(particles);

    // A pair of faint holographic orbit rings around the subject.
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x6fe3ff,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Mesh(new THREE.RingGeometry(10.8, 10.83, 128), haloMaterial);
    halo.rotation.x = Math.PI / 2.45;
    halo.position.set(0.4, 3.2, 3.0);
    halo.name = 'halo';
    scene.add(halo);

    const halo2 = new THREE.Mesh(
      new THREE.RingGeometry(12.4, 12.42, 128, 1, 0.6, 4.4),
      new THREE.MeshBasicMaterial({
        color: 0xff5a3b,
        transparent: true,
        opacity: 0.09,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    halo2.rotation.x = Math.PI / 2.2;
    halo2.rotation.z = 0.5;
    halo2.position.set(0.4, 3.0, 3.0);
    halo2.name = 'halo2';
    scene.add(halo2);

    // Vertical accent line from the floor.
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.5, floorY, 3.5),
      new THREE.Vector3(0.5, 11, 3.5)
    ]);
    const line = new THREE.Line(
      lineGeometry,
      new THREE.LineBasicMaterial({ color: 0x6de8ff, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending })
    );
    scene.add(line);
  }

  function buildModel() {
    parts = PART_DEFS.map((def) => {
      const group = new THREE.Group();
      group.name = def.id;
      const centerV = new THREE.Vector3(def.center[0], def.center[1], def.center[2]);
      const explodeV = new THREE.Vector3(def.explode[0], def.explode[1], def.explode[2]);
      const endEuler = new THREE.Euler(def.rotation[0], def.rotation[1], def.rotation[2], 'XYZ');
      const endQuat = new THREE.Quaternion().setFromEuler(endEuler);
      const part = {
        ...def,
        centerV,
        explodeV,
        endQuat,
        group,
        progress: 0,
        target: 0,
        meshes: [],
        materials: [],
        materialSet: new Set(),
        edgeLines: [],
        glow: null,
        box: null,
        glowColor: CATEGORY[def.category].color
      };
      group.position.copy(centerV);
      root.add(group);
      return part;
    });

    byId = new Map(parts.map((part) => [part.id, part]));

    parts.forEach((part) => {
      const builder = BUILDERS[part.id];
      if (builder) builder(part);
      part.group.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(part.group);
      part.box = box;
      const size = new THREE.Vector3();
      box.getSize(size);
      const glowSize = clamp(Math.max(size.x, size.y, size.z) * 1.35, 2.2, 10);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: part.glowColor,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(glowSize, glowSize, 1);
      sprite.position.set(0, 0, 0);
      sprite.renderOrder = 9;
      part.group.add(sprite);
      part.glow = sprite;
    });
  }

  /* -----------------------------------------------------------------------
     08 / CAMERA CONTROLS
     ----------------------------------------------------------------------- */

  function updateCamera(dt) {
    const cam = state.cam;

    if (state.autoRotate && !state.pointer.dragging) {
      cam.dTheta += dt * 0.115;
    }

    cam.theta = damp(cam.theta, cam.dTheta, 9, dt);
    cam.phi = damp(cam.phi, cam.dPhi, 9, dt);
    cam.radius = damp(cam.radius, cam.dRadius, 6.4, dt);
    cam.target.lerp(cam.dTarget, 1 - Math.exp(-7 * dt));

    const sinPhi = Math.sin(cam.phi);
    camera.position.set(
      cam.target.x + cam.radius * sinPhi * Math.sin(cam.theta),
      cam.target.y + cam.radius * Math.cos(cam.phi),
      cam.target.z + cam.radius * sinPhi * Math.cos(cam.theta)
    );
    camera.lookAt(cam.target);
  }

  function responsiveRadius() {
    const aspect = view.width / Math.max(1, view.height);
    return 40.5 * clamp(0.82 / aspect, 1, 1.55);
  }

  function responsiveExplodedRadius() {
    const aspect = view.width / Math.max(1, view.height);
    return 56 * clamp(0.82 / aspect, 1, 1.32);
  }

  function resetView() {
    const cam = state.cam;
    state.userZoomed = false;
    cam.dTheta = -0.38;
    cam.dPhi = 1.18;
    cam.dRadius = responsiveRadius();
    cam.dTarget.set(1.1, 0.25, 5.2);
    showToast('视角已重置');
  }

  function focusOnPart(part) {
    const target = part.centerV.clone().addScaledVector(part.explodeV, part.target > 0.5 ? 1 : part.progress);
    const cam = state.cam;
    cam.dTarget.copy(target);
    cam.dRadius = clamp(state.cam.radius * 0.64, 13, 22);
    showToast(`聚焦：${part.name}`);
  }

  function explodeAll() {
    state.mode = 'exploded';
    parts.forEach((part) => { part.target = 1; });
    const cam = state.cam;
    state.userZoomed = false;
    cam.dTheta = -0.33;
    cam.dPhi = 1.22;
    cam.dRadius = responsiveExplodedRadius();
    cam.dTarget.set(0.3, 0.7, 4.6);
    if (dom.coach) dom.coach.classList.add('is-dismissed');
    showToast('全部 17 个部件已拆解');
    setSegment('explode');
  }

  function collapseAll() {
    state.mode = 'assembled';
    parts.forEach((part) => { part.target = 0; });
    const cam = state.cam;
    state.userZoomed = false;
    cam.dRadius = responsiveRadius();
    cam.dTarget.set(1.1, 0.25, 5.2);
    showToast('整机已复位');
    setSegment('collapse');
  }

  function setSegment(mode) {
    $$('.seg').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.action === mode);
    });
  }

  function setupControls() {
    const canvas = renderer.domElement;
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    canvas.addEventListener('pointerdown', (event) => {
      const pointer = state.pointer;
      if (event.button !== 0 && event.button !== 2) return;
      if (pointer.pointers.size >= 2) return;
      if (isMobileLayout()) closeDrawers();

      pointer.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      canvas.setPointerCapture(event.pointerId);
      pointer.down = true;
      pointer.dragging = false;
      pointer.button = event.button;
      pointer.startX = event.clientX;
      pointer.startY = event.clientY;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.moved = 0;
      pointer.downTime = performance.now();

      if (pointer.pointers.size === 2) {
        const values = Array.from(pointer.pointers.values());
        const dx = values[0].x - values[1].x;
        const dy = values[0].y - values[1].y;
        pointer.pinchStart = Math.sqrt(dx * dx + dy * dy);
        pointer.pinchRadius = state.cam.dRadius;
      }

      canvas.classList.add('is-grabbing');
    });

    canvas.addEventListener('pointermove', (event) => {
      const pointer = state.pointer;
      if (!pointer.down) {
        hoverAt(event.clientX, event.clientY);
        return;
      }

      if (!pointer.pointers.has(event.pointerId)) return;
      pointer.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointer.pointers.size >= 2) {
        const values = Array.from(pointer.pointers.values());
        const dx = values[0].x - values[1].x;
        const dy = values[0].y - values[1].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (pointer.pinchStart > 0) {
          state.userZoomed = true;
          state.cam.dRadius = clamp(pointer.pinchRadius * (pointer.pinchStart / distance), 13, 72);
        }
        pointer.moved += 10;
        return;
      }

      const dx = event.clientX - pointer.lastX;
      const dy = event.clientY - pointer.lastY;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.moved += Math.abs(dx) + Math.abs(dy);

      if (Math.abs(dx) + Math.abs(dy) > 1.5) {
        pointer.dragging = true;
      }

      if (pointer.button === 2) {
        panBy(dx, dy);
      } else {
        state.cam.dTheta -= dx * 0.0052;
        state.cam.dPhi = clamp(state.cam.dPhi - dy * 0.0048, 0.24, 2.86);
      }

      if (pointer.moved > 4) setHover(null);
    });

    function endPointer(event) {
      const pointer = state.pointer;
      pointer.pointers.delete(event.pointerId);
      pointer.pinchStart = 0;

      if (pointer.down && pointer.pointers.size === 0) {
        const moved = pointer.moved;
        const duration = performance.now() - pointer.downTime;
        if (moved < 5 && duration < 900 && pointer.button === 0) {
          const part = pickAt(event.clientX, event.clientY);
          if (part) {
            selectPart(part, { toggle: true, source: 'stage' });
          } else {
            setHover(null);
          }
        }
        pointer.down = false;
        pointer.dragging = false;
        canvas.classList.remove('is-grabbing');
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      }
    }

    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('pointerleave', () => {
      if (!state.pointer.down) setHover(null);
    });

    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      state.userZoomed = true;
      const factor = Math.exp(event.deltaY * 0.0011);
      state.cam.dRadius = clamp(state.cam.dRadius * factor, 13, 72);
    }, { passive: false });

    window.addEventListener('keydown', handleKeyboard);
  }

  function panBy(dx, dy) {
    const cam = state.cam;
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
    const scale = cam.dRadius * 0.0011;
    cam.dTarget.addScaledVector(right, -dx * scale);
    cam.dTarget.addScaledVector(up, dy * scale);
    cam.dTarget.x = clamp(cam.dTarget.x, -15, 16);
    cam.dTarget.y = clamp(cam.dTarget.y, -6, 12);
    cam.dTarget.z = clamp(cam.dTarget.z, -10, 22);
  }

  function handleKeyboard(event) {
    if (event.target && /input|textarea|select/i.test(event.target.tagName)) return;
    const modalOpen = dom.guideModal.classList.contains('is-open');
    if (event.key === 'Escape') {
      closeGuide();
      closeDrawers();
      return;
    }
    if (modalOpen) return;
    if (event.code === 'Space') {
      event.preventDefault();
      if (state.mode === 'assembled') explodeAll();
      else collapseAll();
    } else if (event.key.toLowerCase() === 'a') {
      toggleAutoRotate();
    } else if (event.key.toLowerCase() === 'l') {
      toggleLabels();
    } else if (event.key.toLowerCase() === 'r') {
      resetView();
    } else if (event.key === '?') {
      openGuide();
    }
  }

  /* -----------------------------------------------------------------------
     09 / HOVER + PICKING
     ----------------------------------------------------------------------- */

  function normalizePointer(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  function pickAt(clientX, clientY) {
    if (!raycaster) return null;
    normalizePointer(clientX, clientY);
    raycaster.setFromCamera(pointerNdc, camera);
    const hits = raycaster.intersectObjects(pickMeshes, false);
    for (let i = 0; i < hits.length; i += 1) {
      const object = hits[i].object;
      if (object.visible === false) continue;
      const id = object.userData.partId;
      if (id && byId.has(id)) return byId.get(id);
    }
    return null;
  }

  function hoverAt(clientX, clientY) {
    const part = pickAt(clientX, clientY);
    setHover(part);
  }

  function setHover(part) {
    if (state.hovered === part) return;
    state.hovered = part;
    if (renderer) {
      renderer.domElement.classList.toggle('is-hovering', Boolean(part));
      renderer.domElement.classList.remove('is-grabbing');
      if (state.pointer.down) renderer.domElement.classList.add('is-grabbing');
    }
    $$('.part-item').forEach((item) => {
      item.classList.toggle('is-hover', Boolean(part) && item.dataset.id === part.id);
    });
  }

  /* -----------------------------------------------------------------------
     10 / SELECTION + DETAILS
     ----------------------------------------------------------------------- */

  function selectPart(part, options = {}) {
    if (!part) return;
    const previous = state.selected;
    state.selected = part;

    if (options.toggle) {
      part.target = part.progress > 0.72 ? 0 : 1;
    } else if (part.progress < 0.54) {
      part.target = 1;
    }

    if (part.target === 1 && state.cam.dRadius < 46) {
      state.cam.dRadius = 46;
    }

    if (previous !== part) {
      if (dom.coach) dom.coach.classList.add('is-dismissed');
    }

    updateDetail(part);
    updateSelectionUI();
    if (isMobileLayout()) {
      dom.leftPanel.classList.remove('is-open');
      dom.drawerScrim.classList.add('is-open');
      setTimeout(() => {
        if (isMobileLayout()) dom.rightPanel.classList.add('is-open');
      }, 160);
    }
    if (options.source === 'list') {
      part.group.updateMatrixWorld(true);
    }
  }

  function clearSelection() {
    state.selected = null;
    updateDetail(null);
    updateSelectionUI();
  }

  function updateSelectionUI() {
    const id = state.selected ? state.selected.id : null;
    $$('.part-item').forEach((item) => {
      item.classList.toggle('is-active', item.dataset.id === id);
    });
    $$('.anno').forEach((anno) => {
      anno.classList.toggle('is-selected', anno.dataset.id === id);
    });

    if (!state.selected) {
      dom.selectedStrip.innerHTML = '<span class="strip-index">00</span><span class="strip-name">待选择部件</span><span class="strip-spec">READY</span>';
      dom.detailIndex.textContent = '00 / 17';
      return;
    }
    const part = state.selected;
    dom.selectedStrip.innerHTML = `<span class="strip-index">${part.no}</span><span class="strip-name">${part.name}</span><span class="strip-spec">${part.short}</span>`;
    dom.detailIndex.textContent = `${part.no} / 17`;
  }

  function updateDetail(part) {
    const scroll = $('#detailScroll');
    if (scroll) scroll.scrollTop = 0;
    if (!part) {
      dom.detailContent.innerHTML = `
        <div class="overview">
          <p class="panel-kicker">SYSTEM OVERVIEW / 00</p>
          <h2 class="overview-title">全画幅拆解样本</h2>
          <p class="overview-sub">EOS R8 · RF MOUNT · 24.2 MP</p>
          <div class="hero-orb"><span>24.2<small>MEGAPIXELS</small></span></div>
          <p class="overview-copy">一台把全画幅传感器、DIGIC X 与 RF 卡口压缩进 461 g 机身的轻量专微。选择任意部件，查看它如何被设计、固定与连接。</p>
          <div class="overview-grid">
            <div><span>SENSOR</span><strong>全画幅 CMOS</strong></div>
            <div><span>PROCESSOR</span><strong>DIGIC X</strong></div>
            <div><span>VIDEO</span><strong>4K 60p</strong></div>
            <div><span>AF</span><strong>Dual Pixel II</strong></div>
          </div>
          <div class="overview-note"><b>TIP</b><span>点击机身外壳，让内部结构第一次暴露出来。所有部件都可独立拆解。</span></div>
          <div class="section-label">QUICK ACCESS</div>
          <div class="detail-actions">
            <button class="action-btn primary" data-detail-action="explode-all" type="button">全拆解 <span>↗</span></button>
            <button class="action-btn" data-detail-action="guide" type="button">操作指南 <span>?</span></button>
          </div>
        </div>`;
      dom.detailIndex.textContent = '00 / 17';
      bindDetailActions();
      return;
    }

    const category = CATEGORY[part.category];
    const rows = part.specs.map(([label, value]) => `
      <div class="spec-row"><dt>${label}</dt><dd>${value}</dd></div>
    `).join('');

    dom.detailContent.innerHTML = `
      <div class="detail-watermark">${part.no}</div>
      <div class="detail-head">
        <p class="detail-kicker"><i></i> ${part.kicker}</p>
        <h2 class="detail-title">${part.name}</h2>
        <p class="detail-en">${part.en}</p>
        <div class="tag-row">
          <span class="tag tag-${category.css}">${category.label}</span>
          <span class="tag">${part.group === 'lens' ? 'LENS ASSEMBLY' : 'BODY ASSEMBLY'}</span>
          <span class="tag">${part.no} / 17</span>
        </div>
        <p class="detail-desc">${part.desc}</p>
      </div>
      <div class="section-label">TECHNICAL SPECIFICATION / 参数</div>
      <dl class="spec-list">${rows}</dl>
      <div class="progress-block">
        <div class="progress-head"><span>DISASSEMBLY</span><b id="detailProgressNum">0%</b></div>
        <div class="progress-track"><i id="detailProgress"></i></div>
      </div>
      <div class="detail-actions">
        <button class="action-btn primary" data-detail-action="focus" type="button">聚焦部件 <span>◎</span></button>
        <button class="action-btn" data-detail-action="collapse" type="button">收起部件 <span>↘</span></button>
      </div>`;
    bindDetailActions();
    updateDetailProgress(true);
  }

  function bindDetailActions() {
    $$('[data-detail-action]', dom.detailContent).forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.detailAction;
        if (action === 'focus' && state.selected) focusOnPart(state.selected);
        if (action === 'collapse' && state.selected) {
          state.selected.target = 0;
          showToast(`已收起：${state.selected.name}`);
        }
        if (action === 'explode-all') explodeAll();
        if (action === 'guide') openGuide();
      });
    });
  }

  function updateDetailProgress(force = false) {
    const part = state.selected;
    if (!part) return;
    const fill = $('#detailProgress');
    const number = $('#detailProgressNum');
    if (!fill || !number) return;
    const value = Math.round(part.progress * 100);
    if (force || number.textContent !== `${value}%`) {
      fill.style.width = `${value}%`;
      number.textContent = `${value}%`;
    }
  }

  /* -----------------------------------------------------------------------
     11 / UI: PART LIST, ANNOTATIONS, EVENTS
     ----------------------------------------------------------------------- */

  function buildPartList() {
    const groups = [
      { key: 'body', label: 'BODY / 机身总成' },
      { key: 'lens', label: 'LENS / 镜头总成' }
    ];
    const filtered = PART_DEFS.filter((part) => state.filter === 'all' || part.group === state.filter);
    dom.partCount.textContent = String(filtered.length).padStart(2, '0');
    dom.partList.innerHTML = groups.map((group) => {
      const entries = filtered.filter((part) => part.group === group.key);
      if (!entries.length) return '';
      return `
        <div class="group-label">${group.label}</div>
        ${entries.map((part) => `
          <button class="part-item${state.selected && state.selected.id === part.id ? ' is-active' : ''}" data-id="${part.id}" type="button">
            <span class="item-index">${part.no}</span>
            <span class="item-main">
              <span class="item-name">${part.name}</span>
              <span class="item-en">${part.en}</span>
            </span>
            <span class="item-state">${byId.get(part.id) && byId.get(part.id).progress > 0.7 ? 'OUT' : 'IN'}</span>
          </button>
        `).join('')}
      `;
    }).join('');

    $$('.part-item', dom.partList).forEach((item) => {
      item.addEventListener('click', () => {
        const part = byId.get(item.dataset.id);
        if (!part) return;
        selectPart(part, { source: 'list' });
      });
      item.addEventListener('mouseenter', () => {
        const part = byId.get(item.dataset.id);
        if (part) setHover(part);
      });
      item.addEventListener('mouseleave', () => setHover(null));
    });
  }

  function refreshPartStates() {
    $$('.part-item', dom.partList).forEach((item) => {
      const part = byId.get(item.dataset.id);
      if (!part) return;
      item.classList.toggle('is-exploded', part.progress > 0.7);
      const stateLabel = $('.item-state', item);
      if (stateLabel) stateLabel.textContent = part.progress > 0.7 ? 'OUT' : 'IN';
    });
  }

  function buildAnnotations() {
    dom.annotations.innerHTML = '';
    dom.leaders.innerHTML = '';
    annotationLines = new Map();
    annotationEls = new Map();

    parts.forEach((part) => {
      const element = document.createElement('div');
      element.className = 'anno';
      element.dataset.id = part.id;
      element.dataset.category = part.category;
      element.innerHTML = `
        <span class="anno-dot"></span>
        <span class="anno-card">
          <b>${part.no}</b>
          <span class="anno-text">
            <em>${part.name}</em>
            <small class="anno-spec">${part.short}</small>
          </span>
        </span>
      `;
      dom.annotations.appendChild(element);
      annotationEls.set(part.id, element);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', 'rgba(124,233,255,0.28)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '2 5');
      dom.leaders.appendChild(line);
      annotationLines.set(part.id, line);
    });
  }

  function projectPoint(position) {
    const projected = position.clone().project(camera);
    return {
      x: (projected.x * 0.5 + 0.5) * view.width,
      y: (-projected.y * 0.5 + 0.5) * view.height,
      z: projected.z
    };
  }

  function updateReticle() {
    if (!state.selected) {
      dom.reticle.classList.remove('is-visible');
      return;
    }
    const selectedPoint = projectPoint(state.selected.group.position);
    const onScreen = selectedPoint.z < 1 && selectedPoint.x > -40 && selectedPoint.x < view.width + 40 && selectedPoint.y > 0 && selectedPoint.y < view.height;
    if (!onScreen) {
      dom.reticle.classList.remove('is-visible');
      return;
    }
    const reticleColor = state.selected.category === 'optical' ? '#ff5a3f' : state.selected.category === 'mechanical' ? '#ffb15c' : '#6de8ff';
    dom.reticle.style.left = `${selectedPoint.x}px`;
    dom.reticle.style.top = `${selectedPoint.y}px`;
    dom.reticle.style.setProperty('--reticle-color', reticleColor);
    dom.reticle.classList.add('is-visible');
  }

  function updateAnnotations(time) {
    if (!state.labels) {
      annotationEls.forEach((element) => element.classList.remove('is-visible'));
      annotationLines.forEach((line) => line.setAttribute('stroke-opacity', '0'));
      updateReticle();
      return;
    }

    const mobile = window.innerWidth <= 720;
    const average = parts.reduce((sum, part) => sum + part.progress, 0) / Math.max(1, parts.length);
    const railMode = !mobile && (state.mode === 'exploded' || average > 0.42);
    const candidates = [];

    parts.forEach((part) => {
      const exploded = part.progress > 0.2;
      const isSelected = state.selected === part;
      const isHover = state.hovered === part;
      let visible = exploded || (part.showAssembled && part.progress < 0.2);
      if (isSelected || isHover) visible = true;
      if (mobile) visible = isSelected || isHover;
      if (state.selected && !exploded && !isSelected && !isHover) visible = false;

      const el = annotationEls.get(part.id);
      const line = annotationLines.get(part.id);
      if (!visible) {
        if (el) el.classList.remove('is-visible', 'is-railed');
        if (line) line.setAttribute('stroke-opacity', '0');
        return;
      }

      const anchorPoint = projectPoint(part.group.position);
      if (anchorPoint.z > 1 || anchorPoint.x < -140 || anchorPoint.x > view.width + 140) {
        if (el) el.classList.remove('is-visible', 'is-railed');
        if (line) line.setAttribute('stroke-opacity', '0');
        return;
      }

      candidates.push({
        part,
        x: anchorPoint.x,
        y: anchorPoint.y,
        selected: isSelected,
        hover: isHover
      });
    });

    if (railMode) {
      const topPad = 56;
      const bottomPad = view.height - 58;
      const gap = 38;
      const left = [];
      const right = [];

      candidates.forEach((candidate) => {
        candidate.side = candidate.x < view.width * 0.5 ? 'left' : 'right';
        (candidate.side === 'left' ? left : right).push(candidate);
      });

      // Move a few labels across the centre when one rail is overcrowded.
      const maxPerRail = Math.max(6, Math.ceil(candidates.length / 2));
      const spill = (from, to) => {
        while (from.length > maxPerRail) {
          const moved = from.pop();
          moved.side = moved.side === 'left' ? 'right' : 'left';
          to.push(moved);
        }
      };
      left.sort((a, b) => a.y - b.y);
      right.sort((a, b) => a.y - b.y);
      spill(left, right);
      spill(right, left);
      left.sort((a, b) => a.y - b.y);
      right.sort((a, b) => a.y - b.y);

      [left, right].forEach((rail) => {
        let cursor = topPad;
        rail.forEach((candidate) => {
          const { part, selected } = candidate;
          const cardWidth = selected ? 190 : 116;
          const cardHeight = selected ? 42 : 34;
          const cardX = candidate.side === 'left'
            ? 16 + cardWidth / 2
            : view.width - 16 - cardWidth / 2;
          let cardY = Math.max(clamp(candidate.y, topPad, bottomPad), cursor);
          candidate.cardX = cardX;
          candidate.cardY = cardY;
          candidate.cardWidth = cardWidth;
          candidate.cardHeight = cardHeight;
          cursor = cardY + gap + (selected ? 6 : 0);
        });

        if (rail.length) {
          const overflow = rail[rail.length - 1].cardY - bottomPad;
          if (overflow > 0) {
            rail.forEach((candidate) => { candidate.cardY -= overflow; });
          }
          const underflow = topPad - rail[0].cardY;
          if (underflow > 0) {
            rail.forEach((candidate) => { candidate.cardY += underflow; });
          }
        }
      });
    } else {
      candidates.sort((a, b) => a.y - b.y);
      const placed = [];
      const gap = mobile ? 30 : 21;
      const topPad = 50;
      const bottomPad = 54;

      candidates.forEach((candidate) => {
        const { part, selected } = candidate;
        const dir = part.labelDir || [1, 0];
        const cardWidth = selected ? 190 : 88;
        const cardHeight = selected ? 42 : 22;
        let cardX = candidate.x + dir[0] * (selected ? 100 : 55);
        let cardY = candidate.y + dir[1] * (selected ? 50 : 29);

        cardX = clamp(cardX, 18 + cardWidth / 2, view.width - 18 - cardWidth / 2);
        cardY = clamp(cardY, topPad, view.height - bottomPad);

        for (let attempt = 0; attempt < 14; attempt += 1) {
          const collision = placed.some((rect) => (
            Math.abs(rect.x - cardX) < (rect.w + cardWidth) / 2 + 4 &&
            Math.abs(rect.y - cardY) < (rect.h + cardHeight) / 2 + 3
          ));
          if (!collision) break;
          cardY += gap;
          if (cardY > view.height - bottomPad) {
            cardY = topPad + (attempt * 3) % 100;
          }
        }

        placed.push({ x: cardX, y: cardY, w: cardWidth, h: cardHeight });
        candidate.cardX = cardX;
        candidate.cardY = cardY;
        candidate.cardWidth = cardWidth;
        candidate.cardHeight = cardHeight;
      });
    }

    candidates.forEach((candidate) => {
      const { part, selected, hover, x, y, cardX, cardY } = candidate;
      const el = annotationEls.get(part.id);
      const line = annotationLines.get(part.id);
      if (!el) return;

      el.classList.add('is-visible');
      el.classList.toggle('is-selected', selected);
      el.classList.toggle('is-hover', hover && !selected);
      el.classList.toggle('is-railed', railMode);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      const card = $('.anno-card', el);
      if (card) {
        card.style.left = `${cardX - x}px`;
        card.style.top = `${cardY - y}px`;
        const em = $('em', card);
        if (em) em.textContent = selected ? `${part.name} · ${part.short}` : part.name;
      }

      if (line) {
        line.setAttribute('x1', x.toFixed(1));
        line.setAttribute('y1', y.toFixed(1));
        line.setAttribute('x2', cardX.toFixed(1));
        line.setAttribute('y2', cardY.toFixed(1));
        line.setAttribute('stroke', selected ? 'rgba(255,77,52,0.7)' : hover ? 'rgba(124,233,255,0.65)' : 'rgba(124,233,255,0.28)');
        line.setAttribute('stroke-opacity', railMode && !selected && !hover ? '0.6' : '1');
      }
    });

    updateReticle();
  }

  function bindUI() {
    $$('.seg').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.action === 'explode') explodeAll();
        else collapseAll();
      });
    });

    $$('[data-action]').forEach((button) => {
      const action = button.dataset.action;
      if (action === 'rotate') {
        button.addEventListener('click', toggleAutoRotate);
      } else if (action === 'labels') {
        button.addEventListener('click', toggleLabels);
      } else if (action === 'reset') {
        button.addEventListener('click', resetView);
      } else if (action === 'parts') {
        button.addEventListener('click', () => toggleDrawer(dom.leftPanel));
      } else if (action === 'details') {
        button.addEventListener('click', () => toggleDrawer(dom.rightPanel));
      }
    });

    $$('.filter').forEach((button) => {
      button.addEventListener('click', () => {
        state.filter = button.dataset.filter;
        $$('.filter').forEach((filter) => filter.classList.toggle('is-active', filter === button));
        buildPartList();
      });
    });

    $$('[data-zoom]').forEach((button) => {
      button.addEventListener('click', () => {
        state.userZoomed = true;
        const direction = button.dataset.zoom === 'in' ? 0.82 : 1.22;
        state.cam.dRadius = clamp(state.cam.dRadius * direction, 13, 72);
      });
    });

    $('#guideBtn').addEventListener('click', openGuide);
    $$('[data-close-modal]').forEach((element) => element.addEventListener('click', closeGuide));
    $('#coachClose').addEventListener('click', () => dom.coach.classList.add('is-dismissed'));

    $$('[data-close-drawer]').forEach((button) => {
      button.addEventListener('click', closeDrawers);
    });

    if (dom.drawerScrim) {
      dom.drawerScrim.addEventListener('click', closeDrawers);
    }

    dom.stageWrap.addEventListener('pointerdown', (event) => {
      if (event.target === dom.stageWrap || event.target === dom.stage) closeDrawers();
    });
  }

  function toggleAutoRotate() {
    state.autoRotate = !state.autoRotate;
    const button = $('[data-action="rotate"]');
    if (button) button.classList.toggle('is-on', state.autoRotate);
    showToast(state.autoRotate ? '自动旋转开启' : '自动旋转关闭');
  }

  function toggleLabels() {
    state.labels = !state.labels;
    const button = $('[data-action="labels"]');
    if (button) button.classList.toggle('is-on', state.labels);
    if (!state.labels) {
      $$('.anno').forEach((element) => element.classList.remove('is-visible'));
      $$('line', dom.leaders).forEach((line) => line.setAttribute('stroke-opacity', '0'));
    }
    showToast(state.labels ? '部件标注开启' : '部件标注关闭');
  }

  function openGuide() {
    dom.guideModal.classList.add('is-open');
    dom.guideModal.setAttribute('aria-hidden', 'false');
  }

  function closeGuide() {
    dom.guideModal.classList.remove('is-open');
    dom.guideModal.setAttribute('aria-hidden', 'true');
  }

  function toggleDrawer(panel) {
    const isOpen = panel.classList.contains('is-open');
    closeDrawers();
    if (!isOpen) {
      panel.classList.add('is-open');
      dom.drawerScrim.classList.add('is-open');
    }
  }

  function closeDrawers() {
    dom.leftPanel.classList.remove('is-open');
    dom.rightPanel.classList.remove('is-open');
    dom.drawerScrim.classList.remove('is-open');
  }

  /* -----------------------------------------------------------------------
     12 / ANIMATION LOOP
     ----------------------------------------------------------------------- */

  function updateParts(dt) {
    parts.forEach((part) => {
      const target = part.target;
      if (Math.abs(part.progress - target) < 0.0008) {
        part.progress = target;
      } else {
        part.progress = damp(part.progress, target, 4.4, dt);
      }

      const eased = smoothstep(part.progress);
      part.group.position.copy(part.centerV).addScaledVector(part.explodeV, eased);
      part.group.quaternion.copy(IDENTITY_QUAT).slerp(part.endQuat, eased);
    });
  }

  const IDENTITY_QUAT = new THREE.Quaternion();

  function updateHighlights(time, dt) {
    parts.forEach((part) => {
      const isSelected = state.selected === part;
      const isHover = state.hovered === part;
      const edgeTarget = isSelected ? 0.72 + Math.sin(time * 3.1) * 0.15 : isHover ? 0.38 : part.progress > 0.55 ? 0.14 : 0;
      part.edgeLines.forEach(({ material }) => {
        material.opacity = damp(material.opacity, edgeTarget, 11, dt);
      });

      const pulse = 0;
      part.materials.forEach((material) => {
        if (!material.emissive || !material.userData.baseEmissive) return;
        if (material.transparent) return;
        const base = material.userData.baseEmissive;
        const baseIntensity = material.userData.baseEmissiveIntensity || 0;
        if (pulse > 0.008) {
          if (!material.userData.glowColor) {
            material.userData.glowColor = new THREE.Color(part.glowColor);
          }
          material.userData.glowColor.setHex(part.glowColor);
          material.emissive.copy(base).lerp(material.userData.glowColor, isSelected ? 0.28 : 0.18);
          material.emissiveIntensity = baseIntensity + pulse;
        } else if (material.emissiveIntensity !== baseIntensity || !material.emissive.equals(base)) {
          material.emissive.copy(base);
          material.emissiveIntensity = baseIntensity;
        }
      });

      if (part.glow) {
        const glowTarget = 0;
        part.glow.material.opacity = damp(part.glow.material.opacity, glowTarget, 8, dt);
        if (!part.glow.userData.baseScale) {
          part.glow.userData.baseScale = part.glow.scale.x;
        }
        const glowScale = part.glow.userData.baseScale * (isSelected ? 1.02 + Math.sin(time * 2.6) * 0.035 : 1);
        part.glow.scale.set(glowScale, glowScale, 1);
      }
    });
  }

  function updateStatusUI(avg) {
    const percent = Math.round(avg * 100);
    if (percent !== currentUI.percent) {
      currentUI.percent = percent;
      dom.explodePercent.textContent = formatPercent(avg);
      dom.meterFill.style.width = `${percent}%`;
      updateDetailProgress();
    }
    let label = '整机锁定';
    if (avg > 0.97) label = '全拆解完成';
    else if (avg > 0.06) label = '拆解进行中';
    if (label !== currentUI.state) {
      currentUI.state = label;
      dom.viewState.textContent = label;
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    state.time = clock.elapsedTime;

    updateCamera(dt);
    updateParts(dt);
    scene.updateMatrixWorld(true);
    updateHighlights(state.time, dt);

    if (state.time - lastAnnotationAt > 0.045) {
      updateAnnotations(state.time);
      lastAnnotationAt = state.time;
    }

    const avg = parts.length ? parts.reduce((sum, part) => sum + part.progress, 0) / parts.length : 0;
    updateStatusUI(avg);
    if (state.selected) updateDetailProgress();
    refreshPartStatesThrottled();

    // Slow environment motion.
    const dust = scene.getObjectByName('dust');
    if (dust) dust.rotation.y = state.time * 0.006;
    const halo = scene.getObjectByName('halo');
    if (halo) halo.rotation.z = state.time * 0.025;
    const halo2 = scene.getObjectByName('halo2');
    if (halo2) halo2.rotation.z = 0.5 - state.time * 0.018;

    renderer.render(scene, camera);
  }

  let lastUIStateRefresh = 0;
  function refreshPartStatesThrottled() {
    if (state.time - lastUIStateRefresh < 0.3) return;
    lastUIStateRefresh = state.time;
    refreshPartStates();
    updateSelectionUI();
  }

  function updateContextualHints() {
    const hint = $('.hint-bar');
    if (!hint) return;
    if (window.innerWidth <= 720) {
      hint.innerHTML = '<span class="touch-icon"><i></i></span><span>单指旋转</span><b>·</b><span>双指缩放</span><b>·</b><span>轻点部件</span><b>·</b><span class="accent">查看拆解</span>';
    } else {
      hint.innerHTML = '<span class="mouse-icon"><i></i></span><span>拖动旋转</span><b>·</b><span>滚轮缩放</span><b>·</b><span>右键平移</span><b>·</b><span class="accent">点击部件拆解</span>';
    }
  }

  function resize() {
    if (!renderer) return;
    const width = dom.stage.clientWidth;
    const height = dom.stage.clientHeight;
    if (!width || !height) return;
    view.width = width;
    view.height = height;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    if (!state.userZoomed) {
      const radius = state.mode === 'exploded' ? responsiveExplodedRadius() : responsiveRadius();
      state.cam.radius = radius;
      state.cam.dRadius = radius;
    }

    if (!isMobileLayout()) closeDrawers();
    updateContextualHints();
  }

  /* -----------------------------------------------------------------------
     13 / BOOT
     ----------------------------------------------------------------------- */

  function initBoot() {
    const statuses = [
      'CALIBRATING OPTICAL AXIS',
      'BUILDING PROCEDURAL GEOMETRY',
      'ALIGNING SENSOR PLANE',
      'MAPPING RF CONTACT ARRAY',
      'LAB READY'
    ];
    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(96, progress + 4 + Math.random() * 9);
      dom.bootBar.style.width = `${progress}%`;
      dom.bootStatus.textContent = statuses[Math.min(statuses.length - 1, Math.floor(progress / 24))];
      if (progress >= 96) clearInterval(timer);
    }, 75);

    function finish() {
      clearInterval(timer);
      dom.bootBar.style.width = '100%';
      dom.bootStatus.textContent = 'LAB READY';
      setTimeout(() => {
        document.body.classList.add('ready');
        dom.boot.classList.add('is-hidden');
      }, 520);
    }

    if (document.readyState === 'complete') setTimeout(finish, 700);
    else window.addEventListener('load', () => setTimeout(finish, 500), { once: true });
  }

  /* -----------------------------------------------------------------------
     14 / INIT
     ----------------------------------------------------------------------- */

  function init() {
    raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.1 };
    pointerNdc = new THREE.Vector2();
    initBoot();

    try {
      initScene();
    } catch (error) {
      console.error('[R8 TEARDOWN] initialization failed:', error);
      dom.bootStatus.textContent = 'WEBGL INITIALIZATION ERROR';
      const bootMeta = $('.boot-meta');
      if (bootMeta) bootMeta.innerHTML = '<span>请检查浏览器 WebGL 支持或刷新页面</span><span>LAB OFFLINE</span>';
    }
  }

  init();
})();
