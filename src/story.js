/** 断讯 · 文泽序章 — story graph (no US-origin spoilers) */

export const GAME = {
  title: "断讯",
  subtitle: "文泽序章",
  tagline: "江北省文泽市。信号还在，秩序已经断了。",
};

/**
 * flags:
 * - flashlight, medkit, water, keys, quiet, scratched
 */
export const nodes = {
  title: {
    type: "title",
  },

  intro: {
    type: "scene",
    label: "00:17 · 文泽西郊 · 租房",
    bg: "room",
    bgm: "horror",
    sfx: null,
    text: [
      "你叫周衡，二十九岁，在文泽做仓储调度。今晚本该睡死，手机却像被谁踢醒了似的，一串红点往上冒。",
      "群聊里全是截图：高速口堵死、医院急诊爆满、有人说街上有人“见人就咬”。官方账号只回了一句——请市民减少外出，等待进一步通知。",
      "楼道感应灯坏了两天。窗外的文泽像被人拧暗了一档，远处警笛拖得很长，又突然断了。",
    ],
    choices: [
      { text: "先把门锁死，把能挡的东西都推过来", next: "barricade", set: { quiet: true } },
      { text: "给住在文泽城区的姐姐打电话", next: "call_sister" },
      { text: "下楼去便利店看看——冰箱空了", next: "store_rush" },
    ],
  },

  barricade: {
    type: "scene",
    label: "00:31 · 门后",
    bg: "room",
    bgm: "tension",
    sfx: "door",
    text: [
      "你把鞋柜、折叠椅和装书的纸箱顶上门。铁门发出沉闷的一声，像把夜色关在外面。",
      "走廊里有人跑步，拖鞋拍地的声音乱成一片。有人骂街，有人哭，有人反复按电梯——电梯始终没有来。",
      "你透过猫眼，看见对门王姨手里攥着一把菜刀。她看见猫眼里的光，嘴唇动了动，像是在说：别开。",
    ],
    choices: [
      { text: "轻敲两下，问她要不要进来", next: "neighbor_help" },
      { text: "装作没看见，继续加固窗户", next: "window_watch", set: { flashlight: true } },
    ],
  },

  call_sister: {
    type: "scene",
    label: "00:28 · 通话",
    bg: "room",
    bgm: "ambient",
    text: [
      "姐姐的号码转了很久。接通时，背景里是玻璃碎裂和某种潮湿的喘息。",
      "「别回城。」她压着嗓子说，「文泽中心已经乱了。我……我在屋顶。楼下有东西在撞门。」",
      "你还想问清楚，信号忽然变成忙音。再拨，只剩机械女声：您拨打的用户暂时无法接通。",
    ],
    choices: [
      { text: "立刻下楼，开车往城区接她", next: "drive_city_death" },
      { text: "按她说的，把门封死，等天亮", next: "barricade" },
      { text: "收拾应急包，准备撤离西郊", next: "pack_bag" },
    ],
  },

  store_rush: {
    type: "scene",
    label: "00:40 · 巷口便利店",
    bg: "zombieStore",
    bgm: "tension",
    sfx: "doorOpen",
    text: [
      "便利店灯还亮着，玻璃门却半开着，冷气混着血腥气往外涌。货架倒了一排，矿泉水滚得到处都是。",
      "收银台后面趴着人。你走近两步，看见他的后颈缺了一块肉，血把工服染成发黑的红。他忽然抽动了一下——不是活着的那种抽动。",
      "你胃里翻了一下。门外，街上传来拖步声，越来越近。",
    ],
    choices: [
      { text: "抓两箱水和面包就跑", next: "store_escape", set: { water: true } },
      { text: "想办法帮他包扎", next: "store_help_death" },
      { text: "躲进冷柜后面，等外面安静", next: "store_hide" },
    ],
  },

  store_help_death: {
    type: "ending",
    ending: "death",
    title: "善意的代价",
    bg: "cgDeathStore",
    overlay: true,
    bgm: "sad",
    sfx: ["zombie", "hit"],
    heartbeat: "fast",
    text: [
      "你撕开自己的外套去压伤口。那具身体猛地弹起，牙齿磕在你的小臂上，像老虎钳。",
      "痛意晚半拍才到。你听见自己的肉被撕开的声音，温热的血顺着袖管灌进手心。门外的拖步声瞬间变成冲刺。",
      "它们把你按在货架上。金属架倒下，罐头砸在你脸上。最后一口空气里全是铁锈和腐肉。",
      "你死在灯火通明的便利店里——货架上的面包还没过期。",
    ],
  },

  store_hide: {
    type: "scene",
    label: "00:47 · 冷柜后",
    bg: "zombieStore",
    bgm: false,
    sfx: "heartbeat",
    heartbeat: true,
    text: [
      "你缩在冷柜阴影里，听着外面的东西撞倒货架，啃咬什么湿软的物体。时间被拉得很长。",
      "它们终于离开。你手指冻得发木，摸到一把手电筒——店员落在地上的。",
    ],
    choices: [
      { text: "拿上手电和水，溜回出租屋", next: "back_home", set: { flashlight: true, water: true } },
    ],
  },

  store_escape: {
    type: "scene",
    label: "00:43 · 逃回",
    bg: "alone",
    bgm: "tension",
    sfx: "slam",
    text: [
      "你抱着两箱水冲进夜色。街灯下，有人四肢着地爬过斑马线，脖子拧成不自然的角度。",
      "你不敢看第二眼。钥匙在口袋里发烫，直到铁门在身后合上，你才发现自己一直在喘气。",
    ],
    choices: [
      { text: "把水放下，开始封门", next: "barricade", set: { water: true } },
      { text: "继续收拾，准备连夜撤离", next: "pack_bag", set: { water: true } },
    ],
  },

  neighbor_help: {
    type: "scene",
    label: "00:36 · 对门",
    bg: "hallway",
    bgm: "tension",
    sfx: "doorOpen",
    text: [
      "你把门开一条缝。王姨挤进来，菜刀还在抖。她说楼下保安被咬了，现在正撞一楼的玻璃门。",
      "「我儿子在文泽火车站……联系不上。」她突然抓住你的手腕，「你有车吗？」",
    ],
    choices: [
      { text: "答应带她一起走", next: "with_neighbor" },
      { text: "让她留下，你自己想办法", next: "refuse_neighbor" },
      {
        text: "先给她止血——她袖口在渗血",
        next: "neighbor_bite_death",
        requireAny: null,
      },
    ],
  },

  neighbor_bite_death: {
    type: "ending",
    ending: "death",
    title: "袖口下的齿痕",
    bg: "cgDeathHallway",
    overlay: true,
    bgm: "sad",
    sfx: ["growl", "impact"],
    heartbeat: "fast",
    text: [
      "你卷起她的袖子。小臂内侧有一圈深深的齿痕，边缘发青，已经不流血了——像被什么东西吸干过。",
      "王姨的眼睛忽然失焦。她喉咙里滚出一句不像人话的咕哝，菜刀落下，砍进你的肩窝。",
      "你倒在自己堆起的纸箱上。她扑上来时，牙齿先碰到的是你的喉结。",
      "走廊感应灯终于亮了一次。光里，你们的血混在一起，慢慢爬向电梯门缝。",
    ],
  },

  refuse_neighbor: {
    type: "scene",
    label: "00:39 · 独自",
    bg: "room",
    bgm: "horror",
    sfx: "door",
    text: [
      "你把门重新顶死。外面王姨骂了一句，脚步声远去，随后是楼梯间传来的尖叫——短促，被什么东西掐断。",
      "你靠着墙坐下来，手心全是汗。活着的感觉突然变得很具体：心跳、耳鸣、嘴里的铁锈味。",
    ],
    choices: [
      { text: "从窗户观察楼下情况", next: "window_watch", set: { flashlight: true } },
      { text: "收拾东西，趁乱离开小区", next: "pack_bag" },
    ],
  },

  with_neighbor: {
    type: "scene",
    label: "01:05 · 地库",
    bg: "corridor",
    bgm: "tension",
    sfx: "doorOpen",
    text: [
      "你们摸黑下到地库。应急灯把混凝土照成病态的黄。你的车还在，挡风玻璃上却多了一道血手印。",
      "王姨坚持要去火车站。你知道城区已经失控，可她的眼睛红得吓人。",
    ],
    choices: [
      { text: "强行开车往西郊高速撤离", next: "highway_choice", set: { keys: true } },
      { text: "顺着她的意思往文泽城开", next: "drive_city_death", set: { keys: true } },
    ],
  },

  window_watch: {
    type: "scene",
    label: "01:12 · 窗边",
    bg: "city",
    bgm: "ambient",
    text: [
      "楼下花园里，保安亭的门开着，灯还亮。有个人影一顿一顿地走，像关节里灌了沙子。",
      "远处文泽方向，天际线泛着不该有的红——不是朝霞，是火。手机推送终于更新：江北省启动重大突发公共卫生事件响应。措辞很冷静，冷静得像在说别人的事。",
      "你抽屉里有一只旧手电，还有半盒创可贴。不够，但总比没有强。",
    ],
    choices: [
      { text: "带上手电，撤离", next: "pack_bag", set: { flashlight: true } },
      { text: "继续留守，等待救援", next: "wait_rescue" },
    ],
  },

  wait_rescue: {
    type: "scene",
    label: "03:40 · 等待",
    bg: "zombieHallway",
    bgm: false,
    heartbeat: true,
    text: [
      "救援没有来。敲门声来了。",
      "门外有人用普通话喊：「消防排查！请开门！」声音很标准，标准得像录音。猫眼里，两张脸贴得极近，眼睛里没有焦点，嘴角还挂着黑红的丝。",
    ],
    choices: [
      { text: "开门配合检查", next: "fake_rescue_death" },
      { text: "绝对不开，改从消防通道撤", next: "pack_bag" },
    ],
  },

  fake_rescue_death: {
    type: "ending",
    ending: "death",
    title: "标准的嗓音",
    bg: "cgDeathDoor",
    overlay: true,
    bgm: "sad",
    sfx: ["zombie", "slam", "hit"],
    heartbeat: "fast",
    text: [
      "你刚拧开门锁，身体就被撞退两步。它们不是“人潮”，是一堵带牙齿的墙。",
      "第一个咬穿了你的脸颊。第二个扯掉你的耳朵。你想喊，口腔里却只剩血泡沫。",
      "铁门在身后缓缓合上，把撕咬声关进这间六十四平的出租屋。窗外，文泽的火光还在跳。",
    ],
  },

  pack_bag: {
    type: "scene",
    label: "撤离准备",
    bg: "room",
    bgm: false,
    text: [
      "你把身份证、车钥匙、充电宝塞进背包。厨房里还剩半袋面包和一瓶矿泉水。药箱里有碘伏和绷带——你犹豫了一秒，还是带走了。",
      "楼道里不知何时安静下来。安静得更可怕。",
    ],
    set: { keys: true, medkit: true },
    choices: [
      { text: "走消防通道下地库取车", next: "stair_choice" },
      { text: "从一楼大门冲出去", next: "front_gate" },
    ],
  },

  back_home: {
    type: "scene",
    label: "01:02 · 返回",
    bg: "hallway",
    bgm: "horror",
    sfx: "door",
    text: [
      "你摸回出租屋，手电光扫过墙面时，看见有人用指甲在粉刷层上抓出了长痕。痕迹在你家门口停住，又折向下楼。",
      "门还好。你还好。今晚的“好”只意味着：暂时没死。",
    ],
    choices: [
      { text: "封门观察", next: "window_watch" },
      { text: "立刻撤离", next: "pack_bag" },
    ],
  },

  stair_choice: {
    type: "scene",
    label: "消防通道",
    bg: "hallway",
    bgm: false,
    sfx: "heartbeat",
    heartbeat: true,
    text: [
      "水泥楼梯转角积着一滩发黑的液体。手电光里，能看见里面漂着一小片工牌——小区物业的。",
      "下方有呼吸声。很重，带着痰。上方，天台门虚掩着，夜风灌进来，带着烟味。",
    ],
    choices: [
      { text: "继续下楼去地库", next: "garage" },
      { text: "先上天台看路况", next: "rooftop" },
      {
        text: "用碘伏和布条把呼吸声的来源……处理掉",
        next: "stair_fight",
        require: "medkit",
        hint: "需要医药包",
      },
    ],
  },

  stair_fight: {
    type: "scene",
    label: "转角",
    bg: "zombieHallway",
    bgm: "tension",
    sfx: ["growl", "hit"],
    text: [
      "你鼓起勇气探出头。一个穿保安服的东西正趴在台阶上啃自己的手臂，像在完成某种错误的作业。",
      "你用折叠椅砸中它的后脑。它倒下，又抽搐着爬起来。你没有再给它机会——碘伏瓶碎在它眼睛上，你掉头就跑。",
      "胳膊被它的指甲刮开一道口子，火辣辣地疼。你顾不上包扎。",
    ],
    set: { scratched: true },
    choices: [{ text: "冲向地库", next: "garage" }],
  },

  rooftop: {
    type: "scene",
    label: "天台",
    bg: "city",
    bgm: "ambient",
    text: [
      "文泽方向像一块正在碳化的铁。西郊的公路上有车灯在挪动，也很慢，像一列发光的虫子。",
      "广播车的喇叭断断续续：「……非必要勿进城……高速入口实行分流……」后半句被电流吃掉。",
    ],
    choices: [
      { text: "下楼取车，走西郊公路", next: "garage" },
      { text: "沿着天台连廊去隔壁楼——听说那边有辆未上锁的面包车", next: "alley_shortcut_death" },
    ],
  },

  alley_shortcut_death: {
    type: "ending",
    ending: "death",
    title: "捷径",
    bg: "cgDeathGarage",
    overlay: true,
    bgm: "sad",
    sfx: ["zombie", "impact"],
    heartbeat: "fast",
    text: [
      "连廊的铁丝网被人剪开。你钻过去时，脚下踩到软的东西——一截还戴着婚戒的手指。",
      "面包车确实在。车门也确实开着。车里挤满了身体，它们同时转过头。",
      "你甚至没来得及把背包扔掉。牙齿从后颈进来，像开罐器。视野里最后的画面，是文泽天上那块发红的云。",
    ],
  },

  front_gate: {
    type: "scene",
    label: "小区大门",
    bg: "alley",
    bgm: "tension",
    sfx: "slam",
    text: [
      "电动门卡在半开。外面停着一辆侧翻的外卖车，箱子里的餐洒了一地，热气早就散了。",
      "左侧通往地库坡道，右侧是一条抄近路的窄巷，能更快到公路——如果巷子是空的。",
    ],
    choices: [
      { text: "走地库坡道取车", next: "garage" },
      { text: "抄窄巷抢时间", next: "alley_shortcut_death" },
    ],
  },

  garage: {
    type: "scene",
    label: "地库",
    bg: "zombieGarage",
    bgm: "horror",
    sfx: "doorOpen",
    text: [
      "车还在。你坐进驾驶座，关上车门，世界忽然小了一圈，安全也像幻觉。",
      "油量还有半箱。导航加载失败。你只能凭记忆往西郊公路开。",
      "出口闸机抬着。闸机旁躺着收费员，工牌朝上，照片里的人还在笑。",
    ],
    choices: [
      { text: "冲出闸机，上公路", next: "highway_choice" },
      { text: "下车确认他还有没有救", next: "garage_mercy_death" },
    ],
  },

  garage_mercy_death: {
    type: "ending",
    ending: "death",
    title: "工牌上的笑",
    bg: "cgDeathGarage",
    overlay: true,
    bgm: "sad",
    sfx: ["growl", "hit", "slam"],
    heartbeat: "fast",
    text: [
      "你蹲下去探他的鼻息。他的手抓住你的衣领，力气大得不像尸体。",
      "牙齿陷入你的锁骨。你听见自己肩胛骨附近的筋膜被扯断的脆响，像湿木头。",
      "车灯还亮着，照着你慢慢被拖进地库的阴影。引擎怠速声平稳得像什么都没发生。",
    ],
  },

  highway_choice: {
    type: "scene",
    label: "西郊公路",
    bg: "city",
    bgm: "tension",
    stopHeartbeat: true,
    text: [
      "公路上弃车越来越多。有人挥手拦你，脸上有伤；有人趴在引擎盖上，已经不怎么动了。",
      "前方岔路：左边进服务区（灯还亮），右边继续西行，通往江北省边缘的山区县——地图上叫「青埠」。",
      "电台里只剩杂音，偶尔蹦出半句：「……文泽……封锁……不要返城……」",
    ],
    choices: [
      { text: "进服务区补给", next: "service_area" },
      { text: "不停车，直接往青埠开", next: "survive_end" },
      {
        text: "停车救助路边那个挥手的人",
        next: "roadside_death",
      },
    ],
  },

  roadside_death: {
    type: "ending",
    ending: "death",
    title: "挥手的人",
    bg: "cgDeathRoad",
    overlay: true,
    bgm: "sad",
    sfx: ["zombie", "impact"],
    heartbeat: "fast",
    text: [
      "你减速，摇下一点车窗。那人扑上来，不是求救——是把半张脸伸进窗缝。",
      "玻璃夹住他的头，也夹住你的小臂。他的牙在你皮肤上犁出两道深沟，血喷在中控台上，像被打翻的墨。",
      "后座方向又响起撞击声。你这才发现，后备箱不知何时开了条缝——有东西一直跟着你的车。",
      "车停在路肩上，双闪还在眨。像在对黑夜打招呼。",
    ],
  },

  service_area: {
    type: "scene",
    label: "服务区",
    bg: "alley",
    bgm: "ambient",
    text: [
      "服务区便利店的卷帘门拉到一半。里面有人用货架堵门，朝你比了一个“安静”的手势，又竖起两根手指：只要两瓶水。",
      "洗手间方向传来撞击声，门板在抖。",
    ],
    choices: [
      {
        text: "把水从门缝塞进去，换信息",
        next: "service_info",
        require: "water",
        hint: "需要瓶装水",
        fallback: "service_no_water",
      },
      { text: "不停留，立刻离开", next: "survive_end" },
      { text: "去洗手间查看撞击声", next: "service_toilet_death" },
    ],
  },

  service_no_water: {
    type: "scene",
    label: "服务区",
    bg: "alley",
    bgm: "ambient",
    text: [
      "你摊开空手。门后的人愣了一下，低声说：「西边青埠还有临时安置点，别进城。文泽……回不去了。」",
      "撞击声更响了。他做了个快走的口型。",
    ],
    choices: [{ text: "上车离开", next: "survive_end" }],
  },

  service_info: {
    type: "scene",
    label: "门缝",
    bg: "alley",
    bgm: "ambient",
    sfx: "click",
    text: [
      "水被拖进去。一个女人压着嗓子说：「青埠中学在收车。别听回城的广播，那是旧循环。」",
      "「还有——被抓伤的也要隔离。有人口口声声说自己没事。」她顿了顿，「别相信任何看起来太正常的人。」",
      "你点头，退回夜色里。油表还够。",
    ],
    choices: [{ text: "驶向青埠", next: "survive_end" }],
  },

  service_toilet_death: {
    type: "ending",
    ending: "death",
    title: "隔间",
    bg: "cgDeathToilet",
    overlay: true,
    bgm: "sad",
    sfx: ["growl", "slam", "hit"],
    heartbeat: "fast",
    text: [
      "洗手间的门被撞得松动。你刚伸手，门板爆开，三具身体叠着挤出来，把你压进瓷砖墙。",
      "后脑磕上洗手台，视线裂成两半。你感觉得到牙齿在你腹部开孔，温热的东西从破口涌出，溅在你自己的鞋上。",
      "灯管滋滋作响。你数着闪烁的次数，数到第七下，世界黑下去。",
    ],
  },

  drive_city_death: {
    type: "ending",
    ending: "death",
    title: "返城",
    bg: "cgDeathCity",
    overlay: true,
    bgm: "sad",
    sfx: ["zombie", "impact", "hit"],
    heartbeat: "fast",
    text: [
      "你往文泽开。越靠近城区，路越像屠宰场的排水沟——湿、滑、反光。",
      "高架桥入口被卡车堵死。有人砸你的车窗。你倒车时撞上隔离墩，安全气囊炸开，把你的鼻子打断。",
      "血的气味是召示。它们从挡风玻璃的裂口伸进手来，把你从气囊的白雾里拖出去。",
      "姐姐在屋顶等的人，不会再来了。",
    ],
  },

  survive_end: {
    type: "ending",
    ending: "survive",
    title: "驶离文泽",
    bg: "city",
    bgm: "sad",
    sfx: "click",
    stopHeartbeat: true,
    text: [
      "后视镜里，文泽的灯火一块块熄灭，又有新的火升起。你不敢再看。",
      "公路指向青埠。电台终于挤出一句完整的话：「……请幸存车辆前往青埠中学临时接收点……重复……」",
      "你的手臂还在抖。包里的水碰出细碎声响。夜风灌进车窗，带着土和烟，没有腐肉——至少现在没有。",
      "你还活着。这不是胜利，只是序章的结尾。",
      "——《断讯》序章结束。第一章，未至。",
    ],
  },
};

export const BG = {
  room: "/images/bg-room.jpg",
  hallway: "/images/bg-hallway.jpg",
  corridor: "/images/bg-corridor.jpg",
  city: "/images/bg-city-night.jpg",
  alley: "/images/bg-alley.jpg",
  alone: "/images/bg-alone-street.jpg",
  zombieStore: "/images/bg-zombie-store.jpg",
  zombieHallway: "/images/bg-zombie-hallway.jpg",
  zombieGarage: "/images/bg-zombie-garage.jpg",
  cgDeathStore: "/images/cg-death-store.jpg",
  cgDeathHallway: "/images/cg-death-hallway.jpg",
  cgDeathDoor: "/images/cg-death-door.jpg",
  cgDeathGarage: "/images/cg-death-garage.jpg",
  cgDeathToilet: "/images/cg-death-toilet.jpg",
  cgDeathCity: "/images/cg-death-city.jpg",
  cgDeathRoad: "/images/cg-death-road.jpg",
  blood1: "/images/bg-blood-1.jpg",
  blood2: "/images/bg-blood-2.jpg",
  blood3: "/images/bg-blood-3.jpg",
  deathBlood: "/images/death-blood.jpg",
  deathOverlay: "/images/death-overlay.jpg",
};
