<template>
  <div>
    <div class="flex flex-col justify-around">
      <div class="m-5">
        <div class="flex flex-row items-center">
          <base-text variant="body" weight="700"
            >Call Center Flow Report</base-text
          >
          <img src="@/assets/greylockss.jpg" class="h-8 px-3" />
          <!-- <img src="@/assets/yellowstarss.jpg" class="ml-auto h-8" /> -->
        </div>
        <base-text variant="bodysm">
          {{
            $t(
              '~~This is an overview of the number of calls coming into the call center each day broken down by new or follow up calls, return call rates, and volunteer operator performance.',
            )
          }}
        </base-text>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CallCenterFlow',
};
</script>
