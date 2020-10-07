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
        checked: 'Opt Out',
        unchecked: 'Try it!',
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

export default {
  name: 'BetaBanner',
  props: {
    text: VueTypes.string,
    betaFeature: VueTypes.string,
  },
  setup(props, context) {
    const { currentUser } = useUser();
    const isOpted = ref(false);

    watch(
      () => currentUser.value && currentUser.value.beta_features,
      () => {
        if (currentUser.value.beta_features.includes(props.betaFeature)) {
          isOpted.value = true;
        } else {
          isOpted.value = false;
        }
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
          context.root.$t('info.error_unable_switch_phone_system'),
        );
        return;
      }
      const feature = featureQ.first();
      try {
        await feature.optIn();
        context.emit('change', value);
      } catch (e) {
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
