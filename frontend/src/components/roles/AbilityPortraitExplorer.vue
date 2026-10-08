<template>
  <section class="portrait-explorer" aria-label="岗位能力与微能力要求">
    <div class="portrait-visuals">
      <section class="portrait-map" :class="{ 'is-dense': nodes.length > 6 }" aria-labelledby="portrait-map-title">
        <header class="portrait-section-head">
          <div><h2 id="portrait-map-title">岗位能力卫星图</h2><span>{{ nodes.length }} 个能力单元 / {{ microCount }} 项微能力</span></div>
          <el-tooltip :content="moving ? '暂停轨道动画' : '播放轨道动画'">
            <button class="portrait-icon-button" :aria-label="moving ? '暂停轨道动画' : '播放轨道动画'" :aria-pressed="moving" @click="moving = !moving"><component :is="moving ? Pause : Play" :size="16" /></button>
          </el-tooltip>
        </header>
        <div class="portrait-orbit" :class="{ 'is-moving': moving }">
          <svg class="portrait-orbit-svg" viewBox="0 0 960 640" aria-hidden="true">
            <ellipse cx="480" cy="320" rx="335" ry="250" class="portrait-orbit-track" />
            <ellipse cx="480" cy="320" rx="224" ry="147" class="portrait-orbit-track portrait-orbit-track--inner" />
            <ellipse cx="480" cy="320" rx="116" ry="90" class="portrait-orbit-track portrait-orbit-track--core" />
            <g v-for="node in nodes" :key="node.ability_unit_code" :style="{ '--node-color': node.color }">
              <line x1="480" y1="320" :x2="node.x" :y2="node.y" class="portrait-orbit-link" :class="{ 'is-selected': node.ability_unit_code === selectedAbility.ability_unit_code }" />
              <circle :cx="node.x" :cy="node.y" r="29" class="portrait-weight-track" />
              <circle :cx="node.x" :cy="node.y" r="29" class="portrait-weight-ring" :stroke-dasharray="`${bounded(node.support_weight) * ringLength} ${ringLength}`" :transform="`rotate(-90 ${node.x} ${node.y})`" />
              <circle v-for="dot in node.dots" :key="dot.code" :cx="dot.x" :cy="dot.y" r="4.5" class="portrait-micro-dot" :class="{ 'is-selected': dot.code === selectedMicro?.micro_ability_code }" />
              <circle v-if="node.ability_unit_code === selectedAbility.ability_unit_code" :cx="node.x" :cy="node.y" r="47" class="portrait-selected-ring" />
            </g>
          </svg>
          <div class="portrait-orbit-core"><Radar :size="24" /><strong>{{ profile.role.role_name }}</strong><span>岗位目标</span></div>
          <button v-for="node in nodes" :key="node.ability_unit_code" class="portrait-orbit-node" :class="{ 'is-selected': node.ability_unit_code === selectedAbility.ability_unit_code }" :style="{ left: `${node.x / 9.6}%`, top: `${node.y / 6.4}%`, '--node-color': node.color }" :aria-label="`${node.ability_unit_name}，支撑权重 W ${node.support_weight}，${node.micro_abilities.length} 项微能力`" :aria-pressed="node.ability_unit_code === selectedAbility.ability_unit_code" @click="selectAbility(node.ability_unit_code)">
            <span class="portrait-node-icon"><component :is="node.icon" :size="21" /></span>
            <strong>{{ node.ability_unit_name }}</strong><small>W {{ node.support_weight.toFixed(1) }} / {{ node.micro_abilities.length }} 项微能力</small>
          </button>
        </div>
        <footer class="portrait-orbit-key"><span><i style="background: #fa8b9d" />岗位定义性核心</span><span><i style="background: #f2cc73" />高度重要</span><span><i style="background: #78b6f5" />重要支撑</span></footer>
      </section>

      <section class="portrait-priorities" aria-labelledby="portrait-priority-title">
        <header class="portrait-section-head"><div><h2 id="portrait-priority-title">岗位支撑权重</h2><span>W / 能力单元对岗位的支撑程度</span></div><ChartNoAxesColumnIncreasing :size="18" /></header>
        <div class="portrait-weight-list">
          <button v-for="node in nodes" :key="node.ability_unit_code" :style="{ '--node-color': node.color }" :class="{ 'is-selected': node.ability_unit_code === selectedAbility.ability_unit_code }" :aria-pressed="node.ability_unit_code === selectedAbility.ability_unit_code" @click="selectAbility(node.ability_unit_code)">
            <span><component :is="node.icon" :size="16" /><strong>{{ node.ability_unit_name }}</strong><b>{{ node.support_weight.toFixed(1) }}</b></span>
            <i class="portrait-meter"><em :style="{ width: `${bounded(node.support_weight) * 100}%` }" /></i>
            <small>{{ node.weight_label }} · {{ node.micro_abilities.length }} 项微能力</small>
          </button>
        </div>
        <div class="portrait-focus-summary"><span>当前能力单元</span><h3>{{ selectedAbility.ability_unit_name }}</h3><p>{{ selectedAbility.definition }}</p><div><span>支撑权重 <b>W {{ selectedAbility.support_weight.toFixed(1) }}</b></span><span>微能力 <b>{{ selectedAbility.micro_abilities.length }} 项</b></span></div></div>
      </section>
    </div>

    <section class="portrait-micro-section" aria-labelledby="portrait-micro-title">
      <header class="portrait-section-head portrait-micro-heading"><div><h2 id="portrait-micro-title">微能力要求</h2><span>{{ selectedAbility.ability_unit_name }} / {{ selectedAbility.micro_abilities.length }} 项</span></div><el-button :icon="Route" @click="emit('learning', selectedAbility.ability_unit_code)">查看关联学习路径</el-button></header>
      <div v-if="selectedMicro" class="portrait-micro-layout">
        <nav class="portrait-micro-nav" aria-label="选择微能力">
          <button v-for="(micro, index) in selectedAbility.micro_abilities" :key="micro.micro_ability_code" :aria-pressed="micro.micro_ability_code === selectedMicro.micro_ability_code" :class="{ 'is-selected': micro.micro_ability_code === selectedMicro.micro_ability_code }" @click="selectedMicroCode = micro.micro_ability_code">
            <span class="portrait-micro-number">{{ String(index + 1).padStart(2, '0') }}</span><span><strong>{{ micro.micro_ability_name }}</strong><small>{{ micro.definition }}</small></span><ChevronRight :size="16" />
          </button>
        </nav>
        <article class="portrait-micro-detail" aria-live="polite">
          <header><div><span class="portrait-detail-code">{{ selectedMicro.micro_ability_code }}</span><h3>{{ selectedMicro.micro_ability_name }}</h3><p>{{ selectedMicro.definition }}</p></div><ScanLine :size="25" /></header>
          <template v-if="guidance">
            <div class="portrait-scenario"><Target :size="19" /><div><span>岗位实践参考</span><p>{{ guidance.scenario }}</p></div></div>
            <div class="portrait-evidence-flow" aria-label="实践证据链"><span><Workflow :size="20" />工程场景</span><ArrowRight :size="17" /><span><Code2 :size="20" />具体实践</span><ArrowRight :size="17" /><span><FileCheck2 :size="20" />验收证据</span></div>
            <div class="portrait-detail-columns">
              <section><h4><ListChecks :size="17" />具体实践动作</h4><ol><li v-for="action in guidance.actions" :key="action">{{ action }}</li></ol></section>
              <section><h4><ClipboardCheck :size="17" />建议验收证据</h4><p class="portrait-evidence-output">{{ guidance.evidence }}</p><ul><li v-for="criterion in guidance.criteria" :key="criterion"><Check :size="15" /><span>{{ criterion }}</span></li></ul></section>
            </div>
            <div v-if="guidanceTools.length" class="portrait-guidance-tools"><Wrench :size="16" /><span>实践工具</span><b v-for="tool in guidanceTools" :key="tool.tool_code">{{ tool.standard_name }}</b></div>
          </template>
          <p v-else class="portrait-guidance-empty">该微能力的实践场景与验收参考尚待补充，当前展示岗位标准定义。</p>
        </article>
      </div>
      <p v-else class="portrait-guidance-empty">当前能力单元暂无微能力数据。</p>
    </section>

    <section class="portrait-task-section" aria-labelledby="portrait-task-title">
      <header class="portrait-section-head"><div><h2 id="portrait-task-title">{{ hasMicroTasks ? '微能力关联任务' : '能力单元关联任务' }}</h2><span>{{ tasks.length }} 项 / {{ hasMicroTasks ? 'T 训练贡献' : '实践映射参考' }}</span></div><GitBranch :size="18" /></header>
      <div v-if="tasks.length" class="portrait-task-grid">
        <button v-for="task in tasks" :key="task.task_code" @click="emit('learning', selectedAbility.ability_unit_code)"><span class="portrait-stage-badge" :class="`is-${task.stage_code.toLowerCase()}`">{{ task.stage_code }}</span><span><strong>{{ task.task_name }}</strong><small>T {{ task.training_value.toFixed(1) }} / 训练贡献{{ hasMicroTasks ? '' : '参考' }}</small><i class="portrait-meter"><em :style="{ width: `${bounded(task.training_value) * 100}%` }" /></i></span><ArrowUpRight :size="18" /></button>
      </div>
      <p v-else class="portrait-guidance-empty">暂无该能力的关联任务数据。</p>
    </section>

    <section class="portrait-tool-section" aria-labelledby="portrait-tool-title">
      <header class="portrait-section-head"><div><h2 id="portrait-tool-title">技术工具要求</h2><span>R / 岗位要求度 · {{ profile.tools.length }} 项</span></div><Wrench :size="18" /></header>
      <div class="portrait-tool-grid"><div v-for="tool in profile.tools" :key="tool.tool_code" :class="{ 'is-related': guidanceTools.some(item => item.tool_code === tool.tool_code) }"><span><strong>{{ tool.standard_name }}</strong><b>R {{ tool.requirement_value.toFixed(1) }}</b></span><i class="portrait-meter"><em :style="{ width: `${bounded(tool.requirement_value) * 100}%` }" /></i><small>{{ tool.requirement_label }}</small></div></div>
      <p v-if="!profile.tools.length" class="portrait-guidance-empty">当前岗位暂无技术工具要求数据。</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ArrowRight, ArrowUpRight, BrainCircuit, ChartNoAxesColumnIncreasing, Check, ChevronRight, ClipboardCheck, Code2, Cpu, FileCheck2, GitBranch, ListChecks, Network, Pause, Play, Radar, Route, ScanLine, Target, Workflow, Wrench } from "lucide-vue-next";
import { wirelessAbilityTasks, wirelessPracticeGuidance } from "@/data/rolePortrait";
import type { RoleProfileData } from "@/types/api";

const props = defineProps<{ profile: RoleProfileData; initialAbility?: string }>();
const emit = defineEmits<{ learning: [ability: string] }>();
const selectedAbilityCode = ref("");
const selectedMicroCode = ref("");
const moving = ref(false);
const ringLength = 2 * Math.PI * 29;
const bounded = (value: number) => Math.max(0, Math.min(1, value));
const selectedAbility = computed(() => props.profile.ability_groups.find(item => item.ability_unit_code === selectedAbilityCode.value) ?? props.profile.ability_groups[0] ?? { ability_unit_code: "", ability_unit_name: "暂无能力数据", definition: "", support_weight: 0, weight_label: "", micro_abilities: [] });
const selectedMicro = computed(() => selectedAbility.value.micro_abilities.find(item => item.micro_ability_code === selectedMicroCode.value) ?? selectedAbility.value.micro_abilities[0]);
const microCount = computed(() => props.profile.ability_groups.reduce((sum, ability) => sum + ability.micro_abilities.length, 0));
const guidance = computed(() => props.profile.role.role_code === "P1.1.1" && selectedMicro.value ? wirelessPracticeGuidance[selectedMicro.value.micro_ability_code] : undefined);
const guidanceTools = computed(() => props.profile.tools.filter(tool => guidance.value?.tools.includes(tool.standard_name)));
const hasMicroTasks = computed(() => Boolean(selectedMicro.value?.learning_tasks?.length));
const tasks = computed(() => selectedMicro.value?.learning_tasks?.length ? selectedMicro.value.learning_tasks : props.profile.role.role_code === "P1.1.1" ? wirelessAbilityTasks[selectedAbility.value.ability_unit_code] ?? [] : []);
const icons: Record<string, typeof BrainCircuit> = { "A1-02": Network, "A2-01": Code2, "A5-04": ClipboardCheck, "A8-04": Cpu, "B1-06": Radar };
const nodes = computed(() => props.profile.ability_groups.map((ability, index, all) => {
  const angle = -Math.PI / 2 + index * 2 * Math.PI / all.length;
  const x = 480 + 335 * Math.cos(angle);
  const y = 320 + 250 * Math.sin(angle);
  const dots = ability.micro_abilities.map((micro, microIndex, micros) => {
    const microAngle = -Math.PI / 2 + microIndex * 2 * Math.PI / micros.length;
    return { code: micro.micro_ability_code, x: x + 41 * Math.cos(microAngle), y: y + 41 * Math.sin(microAngle) };
  });
  return { ...ability, x, y, dots, icon: icons[ability.ability_unit_code] ?? BrainCircuit, color: ability.support_weight >= 1 ? "#fa8b9d" : ability.support_weight >= 0.8 ? "#f2cc73" : "#78b6f5" };
}));
function selectAbility(code: string) { selectedAbilityCode.value = code; selectedMicroCode.value = ""; }
watch(() => [props.profile, props.initialAbility] as const, () => {
  const ability = props.profile.ability_groups.find(item => item.ability_unit_code === props.initialAbility || item.micro_abilities.some(micro => micro.micro_ability_code === props.initialAbility)) ?? props.profile.ability_groups[0];
  selectedAbilityCode.value = ability?.ability_unit_code ?? "";
  selectedMicroCode.value = ability?.micro_abilities.find(micro => micro.micro_ability_code === props.initialAbility)?.micro_ability_code ?? "";
}, { immediate: true });
</script>

<style scoped lang="scss">
.portrait-explorer { position: relative; z-index: 1; --portrait-line: #26444d; --portrait-muted: #a5bfc4; --portrait-accent: #58dccb; color: #e8f5f4; letter-spacing: 0; }
.portrait-explorer * { box-sizing: border-box; letter-spacing: 0; }
.portrait-explorer button { font: inherit; cursor: pointer; }
.portrait-explorer button:focus-visible { outline: 2px solid #a4f8ea; outline-offset: 3px; }
.portrait-visuals { display: grid; grid-template-columns: minmax(0, 1.85fr) minmax(260px, 1fr); gap: 24px; }
.portrait-section-head { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin-bottom: 18px; }
.portrait-section-head h2 { font-size: 16px; font-weight: 650; color: #eaf8f6; line-height: 1.45; }
.portrait-section-head span { display: block; margin-top: 4px; color: var(--portrait-muted); font-size: 12px; line-height: 1.5; }
.portrait-section-head > svg { flex-shrink: 0; color: var(--portrait-accent); }
.portrait-icon-button { display: grid; place-items: center; width: 36px; height: 36px; flex-shrink: 0; color: #c7e6e0; border: 1px solid var(--portrait-line); background: #10272e; border-radius: 4px; }
.portrait-map { min-width: 0; }
.portrait-orbit { position: relative; width: 100%; aspect-ratio: 1.5; min-width: 0; }
.portrait-orbit-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.portrait-orbit-track { fill: none; stroke: #355862; stroke-width: 1; stroke-dasharray: 4 7; }
.portrait-orbit-track--inner { stroke: #28434e; stroke-dasharray: 0; }
.portrait-orbit-track--core { stroke: #356963; stroke-dasharray: 3 5; }
.portrait-orbit-link { stroke: var(--node-color); stroke-width: 1; opacity: .28; stroke-dasharray: 5 7; }
.portrait-orbit-link.is-selected { stroke-width: 2; opacity: .85; stroke-dasharray: 7 8; }
.is-moving .portrait-orbit-link.is-selected { animation: portrait-signal 3s linear infinite; }
.portrait-weight-track { fill: #0b2028; stroke: #28434b; stroke-width: 4; }
.portrait-weight-ring { fill: none; stroke: var(--node-color); stroke-width: 4; stroke-linecap: round; }
.portrait-micro-dot { fill: #49636b; stroke: #0b1c23; stroke-width: 2; }
.portrait-micro-dot.is-selected { fill: #b6fff0; stroke: #58dccb; }
.portrait-selected-ring { fill: none; stroke: #58dccb; stroke-width: 1.3; }
.portrait-orbit-core { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: grid; justify-items: center; align-content: center; gap: 7px; width: 29%; min-height: 30%; text-align: center; background: #0b222a; border: 1px solid #2c6b65; border-radius: 6px; padding: 12px; }
.portrait-orbit-core svg { color: #58dccb; }
.portrait-orbit-core strong { color: #f3fffa; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.portrait-orbit-core span { color: var(--portrait-muted); font-size: 11px; }
.portrait-orbit-node { position: absolute; width: 25%; display: flex; flex-direction: column; align-items: center; padding: 0; color: var(--node-color); background: transparent; border: 0; transform: translate(-50%, -21px); }
.portrait-node-icon { display: grid; place-items: center; width: 42px; height: 42px; }
.portrait-orbit-node strong { width: 100%; min-height: 36px; margin-top: 14px; padding: 0 5px; color: #bcd2d4; font-size: 12px; line-height: 1.5; text-align: center; overflow-wrap: anywhere; }
.portrait-orbit-node small { margin-top: 3px; padding: 2px 4px; background: #0a1d25; font-size: 10px; line-height: 1.5; white-space: nowrap; }
.portrait-orbit-node:hover strong, .portrait-orbit-node.is-selected strong { color: #f3fffc; }
.portrait-orbit-node:focus-visible { outline-offset: 33px; }
.portrait-orbit-key { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; color: var(--portrait-muted); font-size: 11px; }
.portrait-orbit-key span { display: flex; align-items: center; gap: 6px; }
.portrait-orbit-key i { width: 7px; height: 7px; border-radius: 50%; }
.portrait-priorities { min-width: 0; padding-left: 22px; border-left: 1px solid var(--portrait-line); }
.portrait-weight-list { display: grid; gap: 3px; }
.portrait-weight-list button { padding: 10px; border: 1px solid transparent; border-radius: 4px; color: #d0e0e1; background: transparent; text-align: left; }
.portrait-weight-list button:hover, .portrait-weight-list button.is-selected { background: #102a32; border-color: #355962; }
.portrait-weight-list button > span { display: flex; align-items: center; gap: 9px; }
.portrait-weight-list strong { min-width: 0; flex: 1; font-size: 12px; line-height: 1.5; }
.portrait-weight-list svg, .portrait-weight-list b { flex-shrink: 0; color: var(--node-color); }
.portrait-weight-list b { font: 600 13px ui-monospace, monospace; }
.portrait-meter { display: block; height: 4px; margin: 9px 0 6px; background: #243e47; border-radius: 2px; overflow: hidden; }
.portrait-meter em { display: block; height: 100%; background: var(--node-color, #58dccb); border-radius: inherit; }
.portrait-weight-list small { color: var(--portrait-muted); font-size: 11px; }
.portrait-focus-summary { margin-top: 17px; padding-top: 17px; border-top: 1px solid var(--portrait-line); }
.portrait-focus-summary > span { color: #58dccb; font-size: 11px; }
.portrait-focus-summary h3 { margin: 6px 0; font-size: 14px; line-height: 1.5; }
.portrait-focus-summary p { color: var(--portrait-muted); font-size: 12px; line-height: 1.7; }
.portrait-focus-summary > div { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; font-size: 11px; color: var(--portrait-muted); }
.portrait-focus-summary b { color: #f2cc73; margin-left: 4px; }
.portrait-micro-section, .portrait-task-section, .portrait-tool-section { margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--portrait-line); }
.portrait-micro-heading .el-button { flex-shrink: 0; color: #8ff0de; border-color: #375b61; background: #0c252d; min-height: 40px; }
.portrait-micro-layout { display: grid; grid-template-columns: minmax(210px, .85fr) minmax(0, 2fr); gap: 24px; }
.portrait-micro-nav { display: grid; gap: 6px; align-content: start; }
.portrait-micro-nav button { display: flex; align-items: flex-start; gap: 10px; min-height: 82px; padding: 12px; text-align: left; color: #aec5cb; background: transparent; border: 1px solid #28434b; border-radius: 4px; }
.portrait-micro-nav button.is-selected { background: #113039; border-color: #58dccb; }
.portrait-micro-nav button:hover { background: #102930; }
.portrait-micro-number { flex-shrink: 0; color: #83b6bf; font: 600 12px ui-monospace, monospace; padding-top: 3px; }
.portrait-micro-nav button > span:nth-child(2) { flex: 1; min-width: 0; }
.portrait-micro-nav strong { display: block; color: #e3eeed; font-size: 12px; line-height: 1.6; }
.portrait-micro-nav small { display: block; margin-top: 4px; color: var(--portrait-muted); font-size: 11px; line-height: 1.65; }
.portrait-micro-nav svg { flex-shrink: 0; margin-top: 2px; }
.portrait-micro-nav .is-selected .portrait-micro-number, .portrait-micro-nav .is-selected svg { color: #58dccb; }
.portrait-micro-detail { min-width: 0; }
.portrait-micro-detail > header { display: flex; justify-content: space-between; gap: 15px; }
.portrait-micro-detail > header > svg { color: #58dccb; flex-shrink: 0; }
.portrait-detail-code { color: #94bbbf; font: 500 11px ui-monospace, monospace; }
.portrait-micro-detail h3 { margin: 7px 0 6px; font-size: 20px; line-height: 1.5; color: #f1fffb; }
.portrait-micro-detail p { font-size: 12px; line-height: 1.8; color: #b2c9cc; }
.portrait-scenario { display: flex; gap: 12px; margin-top: 20px; padding: 14px 0 14px 14px; border-left: 2px solid #f2cc73; background: #13272e; }
.portrait-scenario > svg { flex-shrink: 0; margin-top: 2px; color: #f2cc73; }
.portrait-scenario span { color: #f2cc73; font-size: 11px; }
.portrait-scenario p { margin-top: 4px; padding-right: 12px; color: #e5f0ef; }
.portrait-evidence-flow { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 22px 0; }
.portrait-evidence-flow > span { display: flex; align-items: center; gap: 8px; padding: 10px 12px; color: #cee6e4; background: #122b33; border: 1px solid #2b4650; border-radius: 4px; font-size: 12px; }
.portrait-evidence-flow svg { flex-shrink: 0; color: #79b6f5; }
.portrait-evidence-flow > span:last-child svg { color: #58dccb; }
.portrait-detail-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.portrait-detail-columns h4 { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; }
.portrait-detail-columns h4 svg { color: #86b9e9; }
.portrait-detail-columns ol { padding-left: 18px; margin-top: 12px; }
.portrait-detail-columns li { padding: 0 0 10px 3px; color: #b4cbcd; font-size: 12px; line-height: 1.85; }
.portrait-detail-columns li::marker { color: #79b6f5; }
.portrait-evidence-output { margin: 12px 0; color: #e1efec !important; }
.portrait-detail-columns ul { list-style: none; padding: 0; }
.portrait-detail-columns ul li { display: flex; align-items: flex-start; gap: 7px; padding-left: 0; }
.portrait-detail-columns ul svg { flex-shrink: 0; color: #58dccb; margin-top: 3px; }
.portrait-guidance-tools { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 16px; padding-top: 13px; border-top: 1px solid #263f48; font-size: 11px; color: var(--portrait-muted); }
.portrait-guidance-tools b { font-weight: 500; padding: 4px 8px; color: #a4d6f9; border: 1px solid #345466; border-radius: 3px; }
.portrait-guidance-empty { margin-top: 14px; color: var(--portrait-muted); font-size: 12px; line-height: 1.8; }
.portrait-task-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.portrait-task-grid button { display: flex; align-items: flex-start; gap: 12px; padding: 15px; min-width: 0; color: #d1e5e3; text-align: left; background: #10262e; border: 1px solid #2c4b54; border-radius: 4px; }
.portrait-task-grid button:hover { border-color: #58dccb; }
.portrait-task-grid button > span:nth-child(2) { flex: 1; min-width: 0; }
.portrait-task-grid strong { font-size: 12px; line-height: 1.6; display: block; }
.portrait-task-grid small { display: block; margin-top: 8px; color: var(--portrait-muted); font-size: 11px; }
.portrait-task-grid button > svg { flex-shrink: 0; color: #a5bfc4; }
.portrait-stage-badge { display: grid; place-items: center; width: 29px; height: 29px; flex-shrink: 0; color: #08171f; background: #f2cc73; font: 650 10px ui-monospace, monospace; border-radius: 3px; }
.portrait-stage-badge.is-pb { background: #79b6f5; }.portrait-stage-badge.is-pf { background: #58dccb; }.portrait-stage-badge.is-cp { background: #fa8b9d; }
.portrait-tool-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px 20px; }
.portrait-tool-grid > div { padding: 10px 0; border-bottom: 1px solid #29414b; min-width: 0; }
.portrait-tool-grid > div.is-related { --node-color: #79b6f5; }
.portrait-tool-grid > div > span { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
.portrait-tool-grid strong { font-size: 12px; overflow-wrap: anywhere; font-weight: 600; }
.portrait-tool-grid b { color: #a1c6ce; flex-shrink: 0; font: 600 11px ui-monospace, monospace; }
.portrait-tool-grid small { color: var(--portrait-muted); font-size: 11px; }
.is-dense .portrait-orbit { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; aspect-ratio: auto; }
.is-dense .portrait-orbit-svg { display: none; }
.is-dense .portrait-orbit-core { position: static; width: auto; transform: none; grid-column: 1 / -1; }
.is-dense .portrait-orbit-node { position: static; transform: none; width: 100%; height: auto; padding: 10px; border: 1px solid #34515a; }
.is-dense .portrait-node-icon { position: static; transform: none; }
.is-dense .portrait-orbit-node strong { margin-top: 5px; }
@keyframes portrait-signal { to { stroke-dashoffset: -30; } }
@media (max-width: 1250px) { .portrait-visuals { grid-template-columns: 1fr; gap: 28px; }.portrait-orbit { max-width: 780px; margin-inline: auto; }.portrait-priorities { border-left: 0; padding-left: 0; }.portrait-weight-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }.portrait-focus-summary { display: none; }.portrait-tool-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (max-width: 720px) { .portrait-section-head { align-items: flex-start; }.portrait-micro-heading { flex-wrap: wrap; }.portrait-micro-layout { grid-template-columns: 1fr; gap: 22px; }.portrait-micro-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }.portrait-micro-nav button { padding: 10px; gap: 7px; }.portrait-micro-nav small { display: none; }.portrait-micro-nav svg { display: none; }.portrait-micro-nav button { min-height: 62px; }.portrait-micro-detail h3 { font-size: 18px; }.portrait-detail-columns { grid-template-columns: 1fr; gap: 8px; }.portrait-task-grid { grid-template-columns: 1fr; }.portrait-tool-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    /* Replace desktop orbit coordinates with a stable touch-friendly map on phones. */
    .portrait-orbit { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; aspect-ratio: auto; min-height: 0; padding: 8px; background: #091d25; border: 1px solid #26444d; }
    .portrait-orbit-svg { display: none; }
    .portrait-orbit-core { position: static; grid-column: 1 / -1; width: auto; min-height: 88px; transform: none; padding: 9px; }
    .portrait-orbit-core strong { max-width: 100%; font-size: 12px; line-height: 1.35; }
    .portrait-orbit-core svg { width: 18px; height: 18px; }
    .portrait-orbit-core span { display: block; font-size: 10px; }
    .portrait-orbit-node { position: static; left: auto !important; top: auto !important; width: 100%; min-height: 82px; padding: 8px 6px; transform: none !important; background: #102930; border: 1px solid #34515a; }
    .portrait-orbit-node:hover, .portrait-orbit-node:focus-visible, .portrait-orbit-node.is-selected { transform: none !important; }
    .portrait-node-icon { width: 30px; height: 30px; }
    .portrait-node-icon svg { width: 17px; height: 17px; }
    .portrait-orbit-node strong { min-height: 0; margin-top: 4px; padding: 0; font-size: 11px; line-height: 1.35; }
    .portrait-orbit-node small { margin-top: 3px; padding: 0; font-size: 9px; line-height: 1.35; white-space: normal; }
    .portrait-orbit-key { margin-top: 12px; gap: 8px; font-size: 10px; }
    .portrait-weight-list { grid-template-columns: 1fr; }.portrait-evidence-flow > span { flex-direction: column; padding: 8px; gap: 5px; flex: 1; font-size: 11px; }.portrait-micro-heading .el-button { width: 100%; } }
@media (prefers-reduced-motion: reduce) { .is-moving .portrait-orbit-link.is-selected { animation: none; } }
</style>
