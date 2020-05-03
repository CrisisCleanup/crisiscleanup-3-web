<template>
  <div>
    <div class="flex flex-col justify-around">
      <div class="m-5">
        <div class="flex flex-row items-center">
          <base-text variant="body" weight="700"
            >Completion Rates Summary</base-text
          >
          <img src="@/assets/greylockss.jpg" class="h-8 px-3" />
          <!-- <img src="@/assets/yellowstarss.jpg" class="ml-auto h-8" /> -->
        </div>
        <base-text variant="bodysm">
          {{
            $t(
              '~~This report breaks down the completion rate numbers by Shortest, Average, and Longest wait times for completion over all, and by county.',
            )
          }}
        </base-text>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CompletionSummary',
};
</script>
