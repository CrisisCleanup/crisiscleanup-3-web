<template>
  <div>
    <div class="flex flex-col justify-around">
      <div class="m-5">
        <div class="flex flex-row items-center">
          <base-text variant="body" weight="700">{{
            $t(
              '~~Number of open, unassigned worksites claimed for more than 6 days',
            )
          }}</base-text>
          <img src="@/assets/greylockss.jpg" class="h-8 px-3 ml-auto" />
          <!-- <img src="@/assets/outlinestarss.jpg" class="ml-auto h-8" /> -->
        </div>
        <base-text variant="bodysm" class="pt-2">
          This report helps identify items that have been claimed but may not
          have had significant help rendered and reported for a period of more
          than 6 days
        </base-text>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UnnasignedWorksites',
};
</script>
