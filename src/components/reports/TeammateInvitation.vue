<template>
  <div>
    <div class="flex flex-col justify-around">
      <div class="m-5">
        <div class="flex flex-row items-center justify-start">
          <base-text variant="body" weight="700">{{
            $t('~~Teammate Invitation and Activity Report')
          }}</base-text>
          <img src="@/assets/greylockss.jpg" class="h-8 px-3 ml-auto" />
          <!-- <img src="@/assets/yellowstarss.jpg" class="ml-auto h-8" /> -->
        </div>
        <base-text variant="bodysm">
          This is a quick glance at all those you have invited for your
          organization and their activity status
        </base-text>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeammateInvitation',
};
</script>
