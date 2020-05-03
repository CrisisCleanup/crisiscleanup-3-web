<template>
  <div>
    <div class="flex flex-col justify-around">
      <div class="m-5">
        <div class="flex flex-row items-center">
          <base-text variant="body" weight="700">{{
            $t('~~Incident Status Dashboard')
          }}</base-text>
          <img src="@/assets/greylockss.jpg" class="h-8 px-3" />
          <!-- <img src="@/assets/yellowstarss.jpg" class="ml-auto h-8" /> -->
        </div>
        <base-text variant="bodysm">
          A summary of the overall health of a given incident including: Number
          of requests for help, breakdown by work-type requested, Completion
          performance, Organizations participating, call center volume by day,
          Activity levels by day
        </base-text>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IncidentStatusReport',
};
</script>
