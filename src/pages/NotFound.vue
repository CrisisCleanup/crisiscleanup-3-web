<template>
  <HomeLayout>
    <template #grid-content>
      <div class="grid--main h-screen">
        <div class="cover-image"></div>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout from '@/layouts/Home';
export default {
  name: 'NotFound',
  components: { HomeLayout },
};
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 20% auto;
    grid-template-areas:
      'logo . . . . survivors'
      'main main main main main main'
      'main main main main main main'
      'main main main main main main';
  }

  .cover-image {
    background-image: url(https://source.unsplash.com/random);
    background-size: cover;
    background-repeat: no-repeat;
    @apply w-full h-full;
  }
}
</style>
