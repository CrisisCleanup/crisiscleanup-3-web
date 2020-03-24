<template>
  <div>
    <div class="flex flex-col justify-content">
      <base-text variant="h1" class="py-2">A sample script would be:</base-text>
      <base-text variant="body" class="py-2"
        >"Crisis Cleanup Hotline, My name is Carl {{ name }}. How may I help
        you?"</base-text
      >
      <!--- Do Not Show Again Checkbox
      <div class="ml-auto m-3">
        <base-checkbox>
          <base-text variant="bodysm" class="text-crisiscleanup-grey-300"
            >do not show this again</base-text
          >
        </base-checkbox>
      </div>
      --->
    </div>
  </div>
</template>

<script>
export default {
  name: 'SampleScript',
};
</script>
