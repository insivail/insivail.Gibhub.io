/* =========================================================================
   CANON EOS 6D — DATA LAYER
   Part metadata, material definitions and hierarchical explosion windows.
   All coordinates are in centimetres: 1 unit = 10 mm.
   Front of the camera faces +Z, up is +Y, the grip side is +X.
   ========================================================================= */
(function () {
  'use strict';

  const GROUPS = [
    {
      id: 'mount',
      no: 'A',
      name: '镜头卡口',
      en: 'LENS MOUNT',
      color: '#d9e1ea',
      desc: '最先卸下的外部光学接口'
    },
    {
      id: 'shell',
      no: 'B',
      name: '外部机壳',
      en: 'EXTERIOR SHELL',
      color: '#93a3b5',
      desc: '前后、顶部、底部外壳与手柄'
    },
    {
      id: 'frame',
      no: 'C',
      name: '内部骨架',
      en: 'MAGNESIUM FRAME',
      color: '#c8d3df',
      desc: '承托光学与电子模块的镁合金框架'
    },
    {
      id: 'optics',
      no: 'D',
      name: '光学反射系统',
      en: 'OPTICAL REFLEX',
      color: '#9c8cff',
      desc: '反光镜、对焦屏与五棱镜'
    },
    {
      id: 'shutter',
      no: 'E',
      name: '快门机构',
      en: 'SHUTTER UNIT',
      color: '#8d9caf',
      desc: '焦平面帘幕、驱动马达与齿轮组'
    },
    {
      id: 'electronics',
      no: 'F',
      name: '电子组件',
      en: 'ELECTRONICS',
      color: '#3ddbb0',
      desc: 'CMOS 感光组件与主电路板'
    },
    {
      id: 'fasteners',
      no: 'G',
      name: '紧固件',
      en: 'FASTENERS',
      color: '#c2ccd8',
      desc: '不锈钢螺钉与接地紧固件'
    }
  ];

  const MATERIALS = {
    shell: {
      name: '哑光黑色工程塑料',
      en: 'MATTE ENGINEERING POLYMER',
      swatch: '#11151a',
      sheen: 'linear-gradient(135deg,#2b3138 0%,#0b0e12 45%,#1c2229 100%)',
      metalness: 0.08,
      roughness: 0.78,
      note: 'PC/ABS 工程塑料，细砂纹模具表面，低反射避免取景时产生杂光。'
    },
    rubber: {
      name: '防滑橡胶蒙皮',
      en: 'TEXTURED ELASTOMER',
      swatch: '#14181c',
      sheen: 'linear-gradient(135deg,#31373d 0%,#101316 55%,#252b30 100%)',
      metalness: 0.02,
      roughness: 0.94,
      note: '手柄与拇指区使用高摩擦弹性体，表面为细密荔枝纹。'
    },
    magnesium: {
      name: '银灰色镁合金',
      en: 'MAGNESIUM ALLOY',
      swatch: '#aeb7c1',
      sheen: 'linear-gradient(135deg,#e5ebf1 0%,#8e98a3 48%,#c4cdd7 100%)',
      metalness: 0.92,
      roughness: 0.36,
      note: '压铸镁合金骨架，喷砂与导电氧化处理，兼作电磁屏蔽与接地路径。'
    },
    steel: {
      name: '拉丝不锈钢',
      en: 'BRUSHED STAINLESS STEEL',
      swatch: '#c9d2dc',
      sheen: 'linear-gradient(135deg,#f3f7fb 0%,#9ea9b5 52%,#dbe3ec 100%)',
      metalness: 1.0,
      roughness: 0.24,
      note: '卡口、齿轮与紧固件使用 304 系不锈钢，表面为细直纹拉丝。'
    },
    darkSteel: {
      name: '发黑合金钢',
      en: 'BLACKENED ALLOY STEEL',
      swatch: '#4b545f',
      sheen: 'linear-gradient(135deg,#78838f 0%,#262c33 55%,#59636e 100%)',
      metalness: 0.9,
      roughness: 0.4,
      note: '反光镜支架、快门框体与传动臂使用发黑处理合金钢。'
    },
    optical: {
      name: '蓝紫镀膜光学玻璃',
      en: 'MULTI-COATED OPTICAL GLASS',
      swatch: '#8f8cff',
      sheen: 'linear-gradient(135deg,#d9d4ff 0%,#6f67e8 32%,#3ec9ff 68%,#a79bff 100%)',
      metalness: 0.15,
      roughness: 0.04,
      note: '多层增透/反射镀膜，在斜射光下呈现蓝紫与青色干涉色。'
    },
    mirror: {
      name: '镀银反光镜面',
      en: 'SILVERED MIRROR COATING',
      swatch: '#cfd8ff',
      sheen: 'linear-gradient(135deg,#ffffff 0%,#9fb7ff 35%,#6f63d9 70%,#d9e6ff 100%)',
      metalness: 1.0,
      roughness: 0.03,
      note: '45° 快速回位主反光镜，表面镀银并覆蓝紫增反膜。'
    },
    shutter: {
      name: '深灰超薄金属帘幕',
      en: 'THIN METAL FOCAL-PLANE CURTAIN',
      swatch: '#3b424b',
      sheen: 'linear-gradient(135deg,#6b747f 0%,#252a31 50%,#4a525c 100%)',
      metalness: 0.82,
      roughness: 0.32,
      note: '碳纤维/铝合金复合帘幕，厚度不足 0.1 mm，表面做消光发黑。'
    },
    pcb: {
      name: '深绿色 PCB',
      en: 'DARK GREEN FR-4 PCB',
      swatch: '#0f5c3f',
      sheen: 'linear-gradient(135deg,#1b8a61 0%,#083d29 55%,#0e6b49 100%)',
      metalness: 0.12,
      roughness: 0.58,
      note: '八层 FR-4 主板，深绿阻焊、沉金焊盘与白色丝印。'
    },
    silicon: {
      name: '黑色封装芯片',
      en: 'EPOXY-SEALED SILICON',
      swatch: '#171b20',
      sheen: 'linear-gradient(135deg,#3a4149 0%,#0c0f12 55%,#252b31 100%)',
      metalness: 0.08,
      roughness: 0.52,
      note: 'DIGIC 5+ 与外围控制器采用黑色环氧封装，顶部丝印型号。'
    },
    copper: {
      name: '镀金触点与铜箔',
      en: 'GOLD PLATING / COPPER',
      swatch: '#c9a24a',
      sheen: 'linear-gradient(135deg,#ffe9a6 0%,#a9791f 55%,#f2cf77 100%)',
      metalness: 1.0,
      roughness: 0.22,
      note: '镜头通讯触点、接地弹片与 PCB 焊盘采用硬金/沉金工艺。'
    },
    cmos: {
      name: 'CMOS 感光晶圆',
      en: 'CMOS IMAGING DIE',
      swatch: '#2a316e',
      sheen: 'linear-gradient(135deg,#8b96ff 0%,#20265c 42%,#4d76ff 75%,#9fb4ff 100%)',
      metalness: 0.35,
      roughness: 0.16,
      note: '35.8 × 23.9 mm 全画幅 CMOS，表面为微透镜阵列与蓝紫增透覆盖层。'
    },
    glass: {
      name: '光学取景玻璃',
      en: 'VIEWFINDER GLASS',
      swatch: '#9fd8ff',
      sheen: 'linear-gradient(135deg,#e6fbff 0%,#5fb6e8 45%,#b9ecff 100%)',
      metalness: 0.05,
      roughness: 0.05,
      note: '取景器目镜与对焦屏基材，低色散玻璃并做边缘消光。'
    }
  };

  const PARTS = [
    {
      id: 'mount',
      no: '01',
      group: 'mount',
      name: '镜头卡口',
      en: 'EF LENS MOUNT',
      short: '54 mm 内径 · 3 卡爪 · 8 触点',
      desc: 'EF 卡口是机身与镜头之间的机械、电子与光学接口。三枚不锈钢卡爪承担镜头重量，8 个镀金触点传输光圈、对焦与防抖数据，内侧消光螺纹抑制镜后杂光。',
      center: [0.9, 0.25, 4.05],
      explode: [0.2, 0.3, 7.2],
      explodeRot: [0, 0.14, 0],
      baseRot: [0, 0, 0],
      stage: [0.0, 0.14],
      labelDir: [1, -0.2],
      anchor: [0, 0, 0.45],
      pans: true,
      mats: ['steel', 'copper'],
      specs: [
        ['卡口系统', 'Canon EF'],
        ['内径 / 法兰距', '54 mm / 44 mm'],
        ['卡爪', '3 枚不锈钢卡爪'],
        ['电子触点', '8 pin 镀金'],
        ['释放机构', '机械按键 + 弹簧锁销']
      ]
    },
    {
      id: 'frontShell',
      no: '02',
      group: 'shell',
      name: '前外壳',
      en: 'FRONT COVER',
      short: '哑光工程塑料 · 卡口开孔',
      desc: '前外壳包覆卡口四周与机身正面，内侧贴有导电屏蔽箔与防尘密封条。左侧保留自动对焦辅助灯与镜头释放按钮，底部为手柄前缘的承力过渡区。',
      center: [0, 0, 3.36],
      explode: [0, 0.9, 5.2],
      explodeRot: [0.02, -0.07, 0],
      baseRot: [0, 0, 0],
      stage: [0.09, 0.3],
      labelDir: [-1, -0.15],
      anchor: [-4.2, 2.4, 0.2],
      mats: ['shell', 'glass'],
      specs: [
        ['外形尺寸', '144.5 × 110.5 × 71.2 mm'],
        ['材质', 'PC/ABS 工程塑料'],
        ['表面', '细砂纹哑光黑'],
        ['开孔', 'EF 卡口 / AF 辅助灯 / 释放键'],
        ['屏蔽', '内侧导电箔 + 接地弹片']
      ]
    },
    {
      id: 'backShell',
      no: '03',
      group: 'shell',
      name: '后外壳',
      en: 'REAR COVER',
      short: '3.0" 屏幕 · 取景目镜 · 按键区',
      desc: '后外壳集成 3.0 英寸约 104 万点 LCD、光学取景目镜、主控拨盘与右侧按键群。内侧的金属簧片把后盖接地到镁合金骨架，同时压紧屏幕排线。',
      center: [0, 0, -3.38],
      explode: [0, -0.5, -9.2],
      explodeRot: [-0.03, 0.06, 0],
      baseRot: [0, 0, 0],
      stage: [0.12, 0.33],
      labelDir: [1, -0.25],
      anchor: [3.4, 1.9, -0.3],
      mats: ['shell', 'glass', 'rubber'],
      specs: [
        ['显示屏', '3.0" / 约 104 万点'],
        ['取景目镜', '21 mm 眼点 / 可调屈光度'],
        ['按键', '9 键 + 主控拨盘 + 多功能摇杆'],
        ['存储', '单 SD 卡槽（侧门）'],
        ['接地', '金属簧片 + 导电泡棉']
      ]
    },
    {
      id: 'topShell',
      no: '04',
      group: 'shell',
      name: '顶部外壳',
      en: 'TOP COVER',
      short: '五棱镜罩 · 模式盘 · 热靴',
      desc: '顶部外壳包覆五棱镜与取景光路，集成快门按钮、主拨盘、模式转盘、热靴与顶部单色 LCD。内部贴有镁合金屏蔽层，并为麦克风预留拾音孔。',
      center: [0.6, 5.95, -0.2],
      explode: [0.3, 9.4, -0.2],
      explodeRot: [0, 0.04, 0],
      baseRot: [0, 0, 0],
      stage: [0.15, 0.36],
      labelDir: [0.2, 1],
      anchor: [0, 0.85, 0],
      mats: ['shell', 'rubber', 'glass'],
      specs: [
        ['取景覆盖率', '约 97% / 0.71×'],
        ['拨盘', '模式转盘 + 电子主拨盘'],
        ['热靴', '标准 ISO 热靴'],
        ['顶部 LCD', '单色参数面板'],
        ['结构', '上盖 + 五棱镜罩一体式']
      ]
    },
    {
      id: 'bottomShell',
      no: '05',
      group: 'shell',
      name: '底部外壳',
      en: 'BOTTOM COVER',
      short: '三脚架孔 · 电池仓门',
      desc: '底部外壳承担三脚架与快装板的全部载荷，内嵌 1/4 英寸不锈钢螺纹套与加强板。手柄下方是 LP-E6 电池仓门，带防水密封圈与机械锁扣。',
      center: [0.4, -5.35, 0.1],
      explode: [-0.3, -5.8, 0.3],
      explodeRot: [0, -0.05, 0],
      baseRot: [0, 0, 0],
      stage: [0.18, 0.39],
      labelDir: [0.3, -1],
      anchor: [0, -0.35, 1.8],
      mats: ['shell', 'steel', 'rubber'],
      specs: [
        ['三脚架孔', '1/4"-20 不锈钢螺纹套'],
        ['电池', 'LP-E6 / LP-E6N'],
        ['电池仓门', '铰链 + 机械锁扣 + 密封圈'],
        ['加强结构', '冲压钢片 + 镁合金底框'],
        ['脚垫', '四点橡胶脚垫']
      ]
    },
    {
      id: 'grip',
      no: '06',
      group: 'shell',
      name: '手柄',
      en: 'ERGONOMIC GRIP',
      short: '深握持 · 橡胶蒙皮 · 电池仓',
      desc: '手柄通过三段式曲面把握持力导向机身骨架，前缘三条指槽与背面拇指托构成稳定的单手持握。内部同时容纳 LP-E6 电池、SD 卡槽与 Wi-Fi/GPS 天线。',
      center: [6.15, -1.2, 2.35],
      explode: [6.8, 0.8, 2.6],
      explodeRot: [0, 0.18, 0.12],
      baseRot: [0, 0, 0],
      stage: [0.21, 0.42],
      labelDir: [1, 0.25],
      anchor: [0, 1.8, 0.8],
      mats: ['shell', 'rubber'],
      specs: [
        ['握持深度', '约 71.2 mm（含手柄）'],
        ['表面', '荔枝纹防滑橡胶'],
        ['指槽', '三段式前缘曲面'],
        ['内置', 'LP-E6 / SD 卡 / 天线'],
        ['固定', '4 颗 M2 螺钉 + 卡扣']
      ]
    },
    {
      id: 'chassis',
      no: '07',
      group: 'frame',
      name: '镁合金骨架',
      en: 'MAGNESIUM CHASSIS',
      short: '压铸镁合金 · 镜箱 · 卡口承力',
      desc: '镁合金压铸骨架是全机的结构基准：前端定位 EF 卡口与反光镜箱，中部承托五棱镜与对焦屏，后端固定快门、CMOS 与主板。侧壁的减重孔在保持扭转刚度的同时降低重量。',
      center: [0.6, 0.05, 0.1],
      explode: [0.1, 1.1, 0.1],
      explodeRot: [0, 0, 0],
      baseRot: [0, 0, 0],
      stage: [0.36, 0.54],
      labelDir: [-1, 0.35],
      anchor: [-5.2, 1.4, 1.2],
      mats: ['magnesium', 'darkSteel'],
      specs: [
        ['材质', '压铸镁合金'],
        ['表面', '喷砂 + 导电氧化'],
        ['结构', '卡口座 / 镜箱 / 主板座一体'],
        ['减重', '侧壁圆形与长圆减重孔'],
        ['整机重量', '约 755 g（含电池与卡）']
      ]
    },
    {
      id: 'mirror',
      no: '08',
      group: 'optics',
      name: '反光镜',
      en: 'QUICK-RETURN MIRROR',
      short: '45° 镀银主镜 · 快速回位',
      desc: '主反光镜以 45° 安置在镜箱中，把镜头光线折向对焦屏与五棱镜。拍摄瞬间由电磁释放机构抬起，曝光结束后以弹簧快速回位；镜面镀银层上覆蓝紫增反膜。',
      center: [0.9, 0.25, 1.8],
      explode: [-10.9, 2.55, 1.2],
      explodeRot: [0, 0.32, 0.08],
      baseRot: [-Math.PI / 4, 0, 0],
      stage: [0.48, 0.64],
      labelDir: [-1, 0.15],
      anchor: [0, 0, 0],
      mats: ['mirror', 'optical', 'darkSteel'],
      specs: [
        ['尺寸', '约 36 × 24 mm 全画幅'],
        ['角度', '45° 固定安装'],
        ['镀膜', '银 + 蓝紫增反膜'],
        ['驱动', '电磁释放 / 弹簧回位'],
        ['功能', '取景 / 测光 / 自动对焦分光']
      ]
    },
    {
      id: 'pentaprism',
      no: '09',
      group: 'optics',
      name: '五棱镜',
      en: 'ROOF PENTAPRISM',
      short: '屋脊五棱镜 · 97% 视野',
      desc: '屋脊五棱镜把对焦屏上的左右颠倒、上下正立的影像再次翻转，使光学取景器呈现与肉眼一致的画面。三个反射面镀银并覆蓝紫保护膜，外框为镁合金遮光罩。',
      center: [0.9, 4.35, -0.55],
      explode: [0.2, 6.1, -0.8],
      explodeRot: [0, 0.15, 0],
      baseRot: [0, 0, 0],
      stage: [0.53, 0.7],
      labelDir: [0.9, 0.8],
      anchor: [0, 0, 0],
      mats: ['optical', 'mirror', 'magnesium'],
      specs: [
        ['类型', '屋脊五棱镜'],
        ['取景覆盖率', '约 97%'],
        ['放大倍率', '约 0.71×（50 mm）'],
        ['眼点', '约 21 mm'],
        ['镀膜', '银反射 + 蓝紫保护膜']
      ]
    },
    {
      id: 'focusingScreen',
      no: '10',
      group: 'optics',
      name: '对焦屏',
      en: 'FOCUSING SCREEN',
      short: '磨砂菲涅尔 · 11 点对焦',
      desc: '对焦屏位于反光镜上方，把镜面反射来的光线漫射成可观察的影像。表面刻有 11 个自动对焦框与中央精细磨砂区，外框由金属簧片压紧并定位焦平面。',
      center: [0.9, 2.95, 1.65],
      explode: [-9.9, 3.55, 1.85],
      explodeRot: [-0.18, 0, 0],
      baseRot: [0, 0, 0],
      stage: [0.5, 0.66],
      labelDir: [-1, 0.5],
      anchor: [0, 0, 0],
      mats: ['glass', 'darkSteel'],
      specs: [
        ['类型', '固定式磨砂菲涅尔屏'],
        ['对焦框', '11 点（中央十字）'],
        ['尺寸', '约 36 × 24 mm'],
        ['表面', '激光磨砂 + 精细蚀刻'],
        ['定位', '金属框 + 簧片压紧']
      ]
    },
    {
      id: 'shutterCurtains',
      no: '11',
      group: 'shutter',
      name: '快门帘幕',
      en: 'FOCAL-PLANE CURTAINS',
      short: '纵走金属帘幕 · 1/4000 s',
      desc: '两组纵走式超薄金属帘幕在 CMOS 前方形成狭缝曝光。前帘先释放，后帘按设定快门速度追随，狭缝宽度决定 1/4000 s 至 30 s 的有效曝光时间。',
      center: [0.9, 0.25, 0.24],
      explode: [7.1, 3.95, 1.76],
      explodeRot: [0, 0.1, 0],
      baseRot: [0, 0, 0],
      stage: [0.64, 0.79],
      labelDir: [1, -0.6],
      anchor: [0, 0, 0.12],
      mats: ['shutter', 'darkSteel'],
      specs: [
        ['类型', '纵走式焦平面快门'],
        ['速度范围', '1/4000 – 30 s + B'],
        ['闪光同步', '1/180 s'],
        ['帘幕', '超薄金属/复合材料'],
        ['寿命', '约 100,000 次']
      ]
    },
    {
      id: 'shutterDrive',
      no: '12',
      group: 'shutter',
      name: '快门驱动机构',
      en: 'SHUTTER DRIVE UNIT',
      short: '马达 · 齿轮组 · 释放凸轮',
      desc: '核心马达经三级减速齿轮驱动凸轮与释放杠杆，完成前帘释放、后帘追随与弹簧上弦。铜线圈与拉丝钢齿轮把电脉冲转换为毫秒级的机械时序。',
      center: [4.35, -0.45, 0.6],
      explode: [6.15, -1.05, 2.9],
      explodeRot: [0, 0.2, 0],
      baseRot: [0, 0, 0],
      stage: [0.67, 0.82],
      labelDir: [1, -0.15],
      anchor: [0.4, 0, 0],
      mats: ['steel', 'copper', 'darkSteel'],
      specs: [
        ['驱动', '核心马达 + 三级齿轮'],
        ['连拍', '最高约 4.5 fps'],
        ['时序', '机械凸轮 + 电磁释放'],
        ['齿轮', '拉丝钢 / 铜合金'],
        ['反馈', '光电时序传感器']
      ]
    },
    {
      id: 'mainboard',
      no: '13',
      group: 'electronics',
      name: '内部电路板',
      en: 'MAIN PCB',
      short: 'DIGIC 5+ · 8 层板 · 沉金',
      desc: '深绿色八层主板集中了 DIGIC 5+ 影像处理器、DDR 缓存、AF 驱动、Wi-Fi/GPS 模块与卡接口。板边通过柔性排线连接顶部控制板、快门组件与 CMOS 子板。',
      center: [0.5, -0.35, -2.35],
      explode: [0.4, -3.8, -8.0],
      explodeRot: [0, -0.12, 0],
      baseRot: [0, 0, 0],
      stage: [0.8, 0.95],
      labelDir: [0.8, -0.7],
      anchor: [3.2, 2.0, -0.1],
      mats: ['pcb', 'silicon', 'copper', 'steel'],
      specs: [
        ['处理器', 'DIGIC 5+'],
        ['板层', '8 层 FR-4 / 沉金'],
        ['接口', 'SD / 快门 / 顶板 / CMOS'],
        ['无线', 'Wi-Fi + GPS 模块'],
        ['供电', 'LP-E6 / 7.2 V']
      ]
    },
    {
      id: 'sensor',
      no: '14',
      group: 'electronics',
      name: 'CMOS 感光组件',
      en: 'CMOS SENSOR ASSEMBLY',
      short: '35.8 × 23.9 mm · 2020 万像素',
      desc: '全画幅 CMOS 固定在镁合金传感器座上，前方依次是红外截止滤镜、低通滤镜与压电除尘层。传感器四周的镀金焊盘通过柔性排线把 14 位影像数据送往主板。',
      center: [0.9, 0.25, -0.06],
      explode: [6.1, -5.75, 3.86],
      explodeRot: [0, 0.18, 0],
      baseRot: [0, 0, 0],
      stage: [0.78, 0.91],
      labelDir: [-1, -0.55],
      anchor: [0, 0, 0.1],
      mats: ['cmos', 'glass', 'steel', 'copper'],
      specs: [
        ['有效像素', '约 2020 万'],
        ['传感器尺寸', '35.8 × 23.9 mm'],
        ['像素间距', '约 6.55 µm'],
        ['ISO', '100–25600（扩展 50–102400）'],
        ['色彩深度', '14-bit RAW']
      ]
    },
    {
      id: 'screws',
      no: '15',
      group: 'fasteners',
      name: '螺丝连接件',
      en: 'FASTENER SET',
      short: '26 颗不锈钢螺钉',
      desc: '全机 26 颗不锈钢紧固件按功能区分布：卡口 6 颗、顶盖 4 颗、底盖 4 颗、后盖 4 颗、骨架侧壁 4 颗、主板 4 颗。拆解动画中每颗螺钉沿自身法线方向旋出并扩散。',
      center: [0.6, 0, 0.1],
      explode: [0, 0, 0],
      explodeRot: [0, 0, 0],
      baseRot: [0, 0, 0],
      stage: [0.03, 0.22],
      labelDir: [0.4, 0.9],
      anchor: [0, 3.2, 0],
      mats: ['steel'],
      specs: [
        ['总数', '26 颗'],
        ['规格', 'M1.7 / M2.0 不锈钢'],
        ['头部', '十字槽盘头 / 沉头'],
        ['防松', '预涂微胶囊螺纹胶'],
        ['接地', '卡口与骨架使用导电垫圈']
      ]
    }
  ];

  const STAGE_LABELS = [
    { at: 0.0, name: '完整装配', en: 'ASSEMBLED' },
    { at: 0.18, name: '外壳释放', en: 'SHELL RELEASE' },
    { at: 0.38, name: '骨架展开', en: 'FRAME EXPOSED' },
    { at: 0.56, name: '光学分离', en: 'OPTICS SPLIT' },
    { at: 0.74, name: '快门下潜', en: 'SHUTTER BANK' },
    { at: 0.9, name: '电子展开', en: 'ELECTRONICS' },
    { at: 1.0, name: '完全分解', en: 'FULL TEARDOWN' }
  ];

  window.CAM6D_DATA = {
    GROUPS,
    MATERIALS,
    PARTS,
    STAGE_LABELS,
    VERSION: '1.0.0',
    MODEL: 'Canon EOS 6D (2012)'
  };
})();


