<template>
  <div>
    <div class="flex flex-col justify-around">
      <div class="m-5">
        <div class="flex flex-row items-center">
          <base-text variant="body" weight="700">{{
            $t('~~Download CSV')
          }}</base-text>
        </div>
        <base-text variant="bodysm" class="pt-1">
          <!-- blank url -->
          <a
            href="crisiscleanup.org"
            class="text-crisiscleanup-yellow-900 underline"
            >Click here</a
          >
          to download CSV report
        </base-text>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DownloadCSV',
};
</script>
