<template>
  <spinner show-quote />
</template>

<script lang="ts">
import { AuthService } from '@/services/auth.service';
import Spinner from '@/components/Spinner.vue';

export default defineComponent({
  name: 'Login',
  components: { Spinner },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    if (store.getters['auth/isLoggedIn']) {
      router.push('/dashboard');
    } else {
      AuthService.buildOauthAuthorizationUrl(route.query.from).then((url) => {
        window.location.href = url;
      });
    }
  },
});
</script>

<style scoped></style>
