<template>
  <div class="role-selector-grid">
    <label class="role-selector-field">
      <span>岗位大类</span>
      <el-select v-model="familyCode" aria-label="选择岗位大类" @change="handleFamilyChange">
        <el-option v-for="family in system.taxonomy?.families ?? []" :key="family.family_code" :label="family.family_name" :value="family.family_code" />
      </el-select>
    </label>
    <label class="role-selector-field">
      <span>岗位小类 / 方向</span>
      <el-select v-model="directionCode" aria-label="选择岗位小类或方向" @change="handleDirectionChange">
        <el-option v-for="direction in selectedFamily?.directions ?? []" :key="direction.direction_code" :label="direction.direction_name" :value="direction.direction_code" />
      </el-select>
    </label>
    <label class="role-selector-field role-selector-field--role">
      <span>标准岗位</span>
      <el-select :model-value="modelValue" filterable aria-label="选择标准岗位" placeholder="选择标准岗位" @update:model-value="handleRoleChange">
        <el-option v-for="role in selectedDirection?.roles ?? []" :key="role.role_code" :label="role.role_name" :value="role.role_code" />
      </el-select>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useSystemStore } from "@/stores/system";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (event: "update:modelValue", value: string): void; (event: "change", value: string): void }>();
const system = useSystemStore();
const familyCode = ref("P1");
const directionCode = ref("P1.1");
const selectedFamily = computed(() => system.taxonomy?.families.find((family) => family.family_code === familyCode.value));
const selectedDirection = computed(() => selectedFamily.value?.directions.find((direction) => direction.direction_code === directionCode.value));

function firstRole(family = selectedFamily.value, direction = selectedDirection.value) {
  return direction?.roles[0]?.role_code ?? family?.directions[0]?.roles[0]?.role_code ?? "P1.1.1";
}
function syncFromRole(code: string) {
  const role = system.roles.find((item) => item.role_code === code);
  if (!role) return;
  familyCode.value = role.role_code.split(".")[0] ?? "P1";
  directionCode.value = role.role_code.split(".").slice(0, 2).join(".") || "P1.1";
}
function commit(code: string) {
  emit("update:modelValue", code);
  emit("change", code);
}
function handleFamilyChange(code: string) {
  familyCode.value = code;
  const direction = selectedFamily.value?.directions[0];
  directionCode.value = direction?.direction_code ?? "P1.1";
  commit(firstRole(selectedFamily.value, direction));
}
function handleDirectionChange(code: string) {
  directionCode.value = code;
  commit(firstRole(selectedFamily.value, selectedDirection.value));
}
function handleRoleChange(code: string) {
  syncFromRole(code);
  commit(code);
}
watch(() => props.modelValue, (code) => { if (code) syncFromRole(code); }, { immediate: true });
watch(() => system.roles.length, (count) => { if (count && props.modelValue) syncFromRole(props.modelValue); });
onMounted(() => {
  if (!props.modelValue) commit("P1.1.1");
});
</script>
