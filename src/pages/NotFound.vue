<template>
  <HomeLayout>
    <template #grid-content>
      <div class="grid--main h-screen">
        <newspost
          class="text-white w-2/12"
          is-user-post
          :user-info="userInfo"
          avatar-icon="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png"
          image="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png"
        >
          <template #header>Hello</template>
          <template #corner>5 min ago</template>
          <template #content
            >Description massa eget egestas purus viverra accumsan in nisl nisi.
            Ac tincidunt vitae semper quis lectus nulla at.
          </template>
        </newspost>
        <div class="cover-image"></div>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout from '@/layouts/Home';
import Newspost from '@/components/Newspost.vue';
export default {
  name: 'NotFound',
  components: { HomeLayout, Newspost },
  data() {
    return {
      userInfo: {
        name: 'Angelo Pablo',
        organization:
          'A Really long Organization Name for no reason just as to test truncating a string',
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
