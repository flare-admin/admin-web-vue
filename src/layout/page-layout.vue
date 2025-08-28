<template>
  <!-- <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in" appear>
      <component :is="Component" v-if="route.meta.ignoreCache" :key="route.fullPath" />
      <keep-alive v-else :include="cacheList" :max="20">
        <component :is="Component" :key="route.fullPath" />
      </keep-alive>
    </transition>
  </router-view> -->
  <router-view v-slot="{ Component, route }">
    <component :is="Component" v-if="route.meta.ignoreCache" :key="route.fullPath" />
    <keep-alive v-else :include="cacheList" :max="20">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useTabBarStore } from '@/store';

const tabBarStore = useTabBarStore();

// 缓存列表，限制最大缓存数量为20
const cacheList = computed(() => tabBarStore.getCacheList);
</script>

<style scoped lang="less">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
