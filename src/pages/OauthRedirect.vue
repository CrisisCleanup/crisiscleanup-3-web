<template>
  <spinner show-quote />
</template>

<script>
import { onMounted } from 'vue';
import { AuthService } from '@/services/auth.service';
import Spinner from '@/components/Spinner.vue';

export default {
  name: 'OauthRedirect',
  components: { Spinner },
  setup() {
    onMounted(() => {
      const authorizationCode = new URLSearchParams(window.location.search).get(
        'code',
      );
      const state = new URLSearchParams(window.location.search).get('state');

      // Exchange the authorization code for an access token
      AuthService.exchangeAuthorizationCode(authorizationCode)
        .then(() => {
          redirectToDesiredPage(state);
        })
        .catch((error) => {
          console.error('OAuth token exchange failed:', error);
          // Handle the error, e.g., display an error message to the user
        });
    });

    const redirectToDesiredPage = (state) => {
      window.location = state || '/dashboard';
    };
  },
};
</script>

<style scoped>
.oauth-redirect {
  margin: 20px;
  text-align: center;
}
</style>
