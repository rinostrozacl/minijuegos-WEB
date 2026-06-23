<script setup lang="ts">
import { GAME_IFRAME_ALLOW } from "~/utils/gamePlayUrl";
import { getGameIframeContainerStyle } from "~/utils/gameResolution";

const props = withDefaults(
  defineProps<{
    src: string;
    canvasWidth?: number | null;
    canvasHeight?: number | null;
    maxHeightVh?: number;
    title?: string;
    iframeKey?: string | number;
  }>(),
  {
    maxHeightVh: 70,
    title: "Juego",
  }
);

const emit = defineEmits<{
  load: [];
  error: [];
}>();

const containerStyle = computed(() =>
  getGameIframeContainerStyle(
    props.canvasWidth,
    props.canvasHeight,
    props.maxHeightVh
  )
);

const iframeEl = ref<HTMLIFrameElement | null>(null);

defineExpose({
  iframeEl,
  requestFullscreen: () => iframeEl.value?.requestFullscreen?.(),
  webkitRequestFullscreen: () =>
    (iframeEl.value as HTMLIFrameElement & { webkitRequestFullscreen?: () => void })
      ?.webkitRequestFullscreen?.(),
  msRequestFullscreen: () =>
    (iframeEl.value as HTMLIFrameElement & { msRequestFullscreen?: () => void })
      ?.msRequestFullscreen?.(),
});
</script>

<template>
  <div class="bg-gray-900 w-full flex justify-center items-start">
    <div class="w-full" :style="containerStyle">
      <iframe
        ref="iframeEl"
        :key="iframeKey ?? src"
        :src="src"
        class="block w-full h-full min-h-[200px] border-0"
        :allow="GAME_IFRAME_ALLOW"
        allowfullscreen
        :title="title"
        @load="emit('load')"
        @error="emit('error')"
      />
    </div>
  </div>
</template>
