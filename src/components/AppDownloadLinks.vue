<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseText from '@/components/BaseText.vue';

const { t } = useI18n();
</script>

<template>
  <div class="flex items-center p-1">
    <BaseText> {{ t('nav.download_app') }}</BaseText>
    <a
      href="https://apps.apple.com/us/app/crisis-cleanup/id6463570192"
      target="_blank"
    >
      <ccu-icon
        data-testid="testDownloadIosLink"
        :alt="t('nav.ccu_ios')"
        size="large"
        class="p-1 py-2"
        type="apple-app-store"
        linked
      />
    </a>
    <a
      href="https://play.google.com/store/apps/details?id=com.crisiscleanup.prod"
      target="_blank"
    >
      <ccu-icon
        data-testid="testDownloadAndroidLink"
        :alt="t('nav.ccu_android')"
        size="large"
        class="p-1 py-2"
        type="google-play-store"
        linked
      />
    </a>
  </div>
</template>

<style scoped></style>
