<template>
  <HomeLayout>
    <template #grid-content>
      <div class="grid--main h-screen">
        <OrganizationActivity :organization-info="test" />
        <div class="cover-image"></div>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout from '@/layouts/Home';
import OrganizationActivity from '@/pages/unauthenticated/OrganizationActivity.vue';
export default {
  name: 'NotFound',
  components: { HomeLayout, OrganizationActivity },
  data() {
    return {
      test: {
        name: 'Southeastern WI COAD',
        orgType: 'Humanitarian Service',
        availability: 'Works in all 50 States',
      },
    };
  },
};
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
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
