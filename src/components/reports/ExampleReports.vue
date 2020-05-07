<template>
  <div class="flex items-center">
    <span>{{ $t('~~Example:') }}</span>
    <div class="flex">
      <font-awesome-icon
        v-for="format in formats"
        :key="format"
        @click.stop="
          () => {
            $emit('download', format);
          }
        "
        class="p-1 cursor-pointer"
        size="3x"
        :icon="`file-${format}`"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: 'ExampleReports',
  props: {
    formats: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
};
</script>
