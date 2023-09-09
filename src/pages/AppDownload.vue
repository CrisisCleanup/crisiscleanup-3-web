<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseText from '@/components/BaseText.vue';
const { t } = useI18n();
</script>

<template>
  <div class="h-full flex flex-col">
    <div id="top" class="logo flex justify-center p-3 border border-b">
      <img
        id="header"
        data-testid="testCcuLogoIcon"
        src="@/assets/ccu-logo-black-500w.png"
        style="height: 100px"
      />
    </div>
    <div class="download-links">
      <a
        href="https://apps.apple.com/us/app/crisis-cleanup/id6463570192"
        target="_blank"
        class="download-link"
      >
        <img
          data-testid="testDownloadIosLink"
          :alt="t('nav.ccu_ios')"
          src="@/assets/icons/download-appstore-badge.svg"
          class="download-icon"
          width="350"
        />
        <!-- <ccu-icon -->
        <!--   data-testid="testDownloadIosLink" -->
        <!--   :alt="t('nav.ccu_ios')" -->
        <!--   size="xl" -->
        <!--   type="download-appstore-badge" -->
        <!--   class="download-icon" -->
        <!--   linked -->
        <!-- /> -->
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=com.crisiscleanup.prod"
        target="_blank"
        class="download-link"
      >
        <img
          data-testid="testDownloadAndroidLink"
          :alt="t('nav.ccu_android')"
          src="@/assets/icons/download-playstore-badge.svg"
          class="download-icon"
          width="350"
        />
        <!-- <ccu-icon -->
        <!--   data-testid="testDownloadAndroidLink" -->
        <!--   :alt="t('nav.ccu_android')" -->
        <!--   size="xl" -->
        <!--   type="download-playstore-badge" -->
        <!--   class="download-icon" -->
        <!--   linked -->
        <!-- /> -->
      </a>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.download-links {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 1em;
}

.download-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1em;
}

.download-link ccu-icon {
  margin-bottom: 0.5em;
}

.download-icon {
  padding: 1rem;
}
</style>
