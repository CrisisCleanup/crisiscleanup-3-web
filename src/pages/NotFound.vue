<template>
  <HomeLayout>
    <div class="text-2xl text-center mb-3">{{ t('~~404_not_found') }}</div>
    <div class="cover-image"></div>
  </HomeLayout>
</template>

<script lang="ts">
import HomeLayout from '@/layouts/Home.vue';

export default defineComponent({
  name: 'NotFound',
  components: { HomeLayout },
  setup() {
    const { t } = useI18n();
    return {
      t,
    };
  },
});
</script>

<style scoped lang="scss">
.cover-image {
  background-image: url('https://source.unsplash.com/random');
  background-size: cover;
  background-repeat: no-repeat;
  @apply w-full h-full;
}
</style>
