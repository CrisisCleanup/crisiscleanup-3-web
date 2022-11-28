<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import BaseButton from "./BaseButton.vue";

export default defineComponent({
  components: { BaseButton },
  setup() {
    const store = useStore();

    const loginUser = async () => {
      try {
        const response = await store.dispatch("auth/login", {
          email: "tobi@tobiabiodun.com",
          password: "admin123",
        });
        console.log(response);
      } catch (e) {
        console.log(e);
      }
    };

    const count = ref(0);
    return {
      count,
      loginUser,
    };
  },
});
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <BaseButton
    text="Test"
    variant="solid"
    ccu-icon="trash"
    :action="loginUser"
  ></BaseButton>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
