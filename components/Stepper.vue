<template>
  <div class="stepper">
    <div class="flex justify-between">
      <div
        v-for="(step, index) in steps"
        :key="`step-${index}`"
        class="flex flex-col items-center"
        :class="{
          'w-full': index < steps.length - 1,
          'w-auto': index === steps.length - 1,
        }"
      >
        <div class="relative flex items-center justify-center">
          <div
            class="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
            :class="{
              'bg-primary-500': modelValue > index,
              'border-2 border-primary-500 text-primary-500 bg-white':
                modelValue === index,
              'border-2 border-gray-300 text-gray-400 bg-white':
                modelValue < index,
            }"
          >
            <span v-if="modelValue <= index">{{ index + 1 }}</span>
            <UIcon v-else name="i-heroicons-check" class="h-5 w-5" />
          </div>
          <div
            v-if="index < steps.length - 1"
            class="absolute w-full h-0.5 top-5 left-0 z-0"
            :class="{
              'bg-primary-500': modelValue > index,
              'bg-gray-200': modelValue <= index,
            }"
            style="left: 50%"
          ></div>
        </div>
        <div class="text-center mt-2">
          <p class="text-sm font-medium">{{ step.title }}</p>
          <p class="text-xs text-gray-500">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Number,
    default: 1,
  },
  steps: {
    type: Array,
    required: true,
    default: () => [],
  },
});
</script>
