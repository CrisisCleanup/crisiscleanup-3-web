<template>
  <div class="container">
    <div class="backdrop bg-crisiscleanup-light-grey" />
    <div class="logo my-8">
      <img src="@/assets/ccu-logo-black-500w.png" />
    </div>
    <div class="nav--container my-8 py-10 flex flex-col justify-around">
      <a
        v-for="item in navigation"
        :key="item.text"
        :href="item.route || '#'"
        class="font-h1 font-display text-h1 text-crisiscleanup-dark-500"
      >
        {{ item.text }}
      </a>
    </div>
    <div class="actions--container my-16 mr-8 flex flex-col justify-center">
      <p class="font-display text-h1 font-body text-crisiscleanup-dark-400">
        Relief Organizations Only
      </p>
      <base-button
        text="Register"
        type="primary"
        class="px-6 py-3 font-h1 text-h1 text-crisiscleanup-dark-500"
      />
    </div>
  </div>
</template>

<script>
export const HomeNavigation = [
  {
    text: 'Home',
  },
  {
    text: 'About Us',
  },
  {
    text: 'Blog',
  },
  {
    text: 'Map',
  },
  {
    text: 'Training',
  },
  {
    text: 'Contact',
  },
];

export default {
  name: 'LoginPage',
  data() {
    return {
      navigation: HomeNavigation,
    };
  },
};
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 1fr 1.5fr;
  grid-template-rows: 1fr 2fr 1fr;
  height: 100%;
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
}
.backdrop {
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row: 1 / 4;
}

.logo {
  justify-self: start;
  max-width: 200px;
  grid-row: 1 / 1;
  grid-column: 2;
}

.nav--container {
  grid-row: 2;
  grid-column: 2;
}

.actions--container {
  grid-row: 3;
  grid-column: 2;
  justify-content: space-around;
}
</style>
