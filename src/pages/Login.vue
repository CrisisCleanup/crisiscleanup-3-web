<template>
  <div class="grid-container">
    <div class="backdrop bg-crisiscleanup-light-grey" />
    <div class="logo my-8">
      <img src="@/assets/ccu-logo-black-500w.png" />
    </div>
    <div class="nav--container py-16 my-20">
      <a
        v-for="item in navigation"
        :key="item.text"
        :href="item.route || '#'"
        class="font-h1 font-display text-h1 text-crisiscleanup-dark-500"
      >
        {{ item.text }}
      </a>
    </div>
    <div class="actions--container">
      <p
        class="font-display text-h2 font-weight-light text-crisiscleanup-dark-500"
      >
        Relief Organizations Only
      </p>
      <base-button
        text="Register"
        type="primary"
        class="px-6 py-3 font-h2 text-h1 font-display text-crisiscleanup-dark-500"
      />
    </div>
    <div class="grid--main">
      <div>
        <p class="font-display font-h1 text-5xl text-crisiscleanup-dark-500">
          Login
        </p>
        <p
          class="font-display font-weight-light text-2xl text-crisiscleanup-dark-500"
        >
          Sign in to your account
        </p>
      </div>
      <div class="main-inputs">
        <base-input placeholder="Email" size="xlarge" type="email" />
        <base-input placeholder="Password" size="xlarge" type="password" />
      </div>
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
.grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: 20% auto;
  grid-template-areas:
    'logo . . . . .'
    'nav . main main . .'
    'nav . main main . .'
    'actions actions . . . .';

  height: 100%;
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.backdrop {
  grid-row: 1 / span 4;
  grid-column: 1 / span 3;
}

.logo {
  grid-area: logo;
  max-width: 200px;
  margin-left: 2.8rem;
}

.nav--container {
  grid-area: nav;
  display: grid;
  align-items: center;
  margin-left: 2.8rem;
}

.actions--container {
  display: grid;
  grid-area: actions;
  margin-left: 2.8rem;
  align-content: center;
  letter-spacing: 0.35px;
  justify-content: start;
  grid-gap: 1rem;
}

.grid--main {
  grid-area: main;
  display: grid;
  grid-gap: 4rem;
}

.grid--main:last-child {
  align-self: start;
}

.main-inputs > div {
  margin-top: 1rem;
}
</style>
