<template>
  <div class="inline-flex items-center flex-row">
    <base-text semi-bold variant="h2" :style="{ color: 'white' }" class="pr-2">
      {{ $t(text) }}
    </base-text>
    <toggle-button
      :value="isOpted"
      sync
      :width="85"
      :font-size="14"
      :labels="{
        checked: $t(translations.labelChecked || '~~Opt Out'),
        unchecked: $t(translations.labelUnchecked || '~~Try it!'),
      }"
      @input="handleToggle"
    />
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import BetaFeature from '@/models/BetaFeature';
import { onMounted, watch, ref } from '@vue/composition-api';
import useUser from '@/use/user/useUser';
import { getErrorMessage } from '@/utils/errors';
import * as Sentry from '@sentry/browser';

export default {
  name: 'BetaBanner',
  props: {
    text: VueTypes.string,
    betaFeature: VueTypes.string,
    translations: VueTypes.shape({
      labelChecked: VueTypes.string,
      labelUnchecked: VueTypes.string,
      onError: VueTypes.string,
    }).loose,
  },
  setup(props, context) {
    const { currentUser } = useUser();
    const isOpted = ref(false);

    watch(
      () => currentUser.value && currentUser.value.beta_features,
      () => {
        isOpted.value = !!(
          currentUser &&
          currentUser.value.beta_features.includes(props.betaFeature)
        );
      },
    );

    onMounted(async () => {
      await BetaFeature.fetchAll();
    });

    const handleToggle = async (value) => {
      const featureQ = await BetaFeature.query().where(
        'name',
        props.betaFeature,
      );
      if (!featureQ.exists()) {
        await context.root.$toasted.error(
          context.root.$t(props.translations.onError || '~~Failed to opt out!'),
        );
        return;
      }
      const feature = featureQ.first();
      try {
        await feature.optIn();
        context.emit('change', value);
        Sentry.addBreadcrumb({
          category: 'user.beta_feature',
          message: `Toggled ${props.betaFeature} beta feature: ${value}`,
          level: Sentry.Severity.Info,
        });
      } catch (e) {
        Sentry.captureException(e);
        await context.root.$toasted.error(getErrorMessage(e));
      }
    };

    return {
      isOpted,
      handleToggle,
    };
  },
};
</script>

<style scoped></style>
