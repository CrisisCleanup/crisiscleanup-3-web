<template>
  <div>
    <div class="flex flex-row">
      <!-- Checkbox -->
      <div class="flex-col w-1/5">
        <base-checkbox />
      </div>
      <!-- Case Content -->
      <div class="flex-col w-4/5">
        <!-- Row of Icons -->
        <div class="flex flex-row">
          icons
        </div>
        <!-- Name / Location / Phone # -->
        <div class="flex flex-row justify-start">
          <div class="flex-col">
            <!-- Name -->
            <div class="flex flex-row">
              <ccu-icon />
              <base-text
                variant="bodysm"
                weight="300"
                class="text-crisiscleanup-dark-400"
              >
                Milton R. Thurman
              </base-text>
            </div>
            <!-- Location -->
            <div class="flex flex-row">
              <ccu-icon />
              <base-text
                variant="bodysm"
                weight="300"
                class="text-crisiscleanup-dark-400"
              >
                1439 Lesiure Lane, Goleta, CA 93117
              </base-text>
            </div>
            <!-- Phone # -->
            <div class="flex flex-row">
              <ccu-icon />
              <base-text
                variant="bodysm"
                weight="300"
                class="text-crisiscleanup-dark-400"
              >
                (732) 258-3730
              </base-text>
            </div>
          </div>
        </div>
      </div>
      <!-- Activity -->
      <div class="flex-row">
        <base-text
          variant="bodysm"
          weight="300"
          class="text-crisiscleanup-blue"
        >
          Claimed by 2 organizations ∙ Assigned to 2 teams
        </base-text>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CaseOverview',
};
</script>
