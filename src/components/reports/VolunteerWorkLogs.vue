<template>
  <div>
    <div class="flex flex-col justify-around">
      <div class="m-5">
        <div class="flex flex-row items-center">
          <base-text variant="body" weight="700">{{
            $t('~~Detailed Work Logs with Volunteer Hour Reports')
          }}</base-text>
          <img src="@/assets/greylockss.jpg" class="h-8 px-3" />
          <!-- <img src="@/assets/outlinestarss.jpg" class="ml-auto h-8" /> -->
        </div>
        <base-text variant="bodysm">
          This report allows for easy extraction of detailed work logs filtered
          by a variety of options including state, county, city, geo-fenced
          boundaries, etc.
        </base-text>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VolunteerWorkLogs',
};
</script>
