<template>
  <div class="state-panel" :class="{ 'state-panel--compact': compact }">
    <LoaderCircle v-if="loading" class="state-panel__spinner" :size="26" />
    <CircleAlert v-else-if="error" :size="28" />
    <Inbox v-else :size="28" />
    <strong>{{ loading ? "正在加载数据" : error ? "数据加载失败" : "暂无数据" }}</strong>
    <p v-if="error">{{ error }}</p>
    <el-button v-if="error" size="small" @click="$emit('retry')">重新加载</el-button>
  </div>
</template>

<script setup lang="ts">
import { CircleAlert, Inbox, LoaderCircle } from "lucide-vue-next";
defineProps<{ loading?: boolean; error?: string; compact?: boolean }>();
defineEmits<{ retry: [] }>();
</script>
