<template>
  <div>
    <div class="flex flex-row">
      <!-- Checkbox -->
      <div class="flex-col w-2/7">
        <base-checkbox class="w-full" />
      </div>
      <!-- Case Content -->
      <div class="flex-col w-5/7">
        <!-- Row of Icons -->
        <div class="flex flex-row">
          <!-- these are all temp -->
          <img src="@/assets/tempflag.jpg" class="h-6" />
          <img src="@/assets/tempcasenumbericon.jpg" class="h-6" />
          <img src="@/assets/redlobster.jpg" class="h-6" />
          <img src="@/assets/yellowboot.jpg" class="h-6" />
          <img src="@/assets/greenflame.jpg" class="h-6" />
        </div>
        <!-- Name / Location / Phone # -->
        <div class="flex flex-row justify-start mt-3">
          <div class="flex-col">
            <!-- Name -->
            <div class="flex flex-row">
              <!-- <ccu-icon /> -->
              <img src="@/assets/littleperson.jpg" class="h-5" />
              <base-text
                variant="bodysm"
                weight="300"
                class="text-crisiscleanup-dark-400 ml-3"
              >
                Milton R. Thurman
              </base-text>
            </div>
            <!-- Location -->
            <div class="flex flex-row">
              <!-- <ccu-icon /> -->
              <img src="@/assets/littlemap.jpg" class="h-5" />
              <base-text
                variant="bodysm"
                weight="300"
                class="text-crisiscleanup-dark-400 ml-2"
              >
                1439 Lesiure Lane, Goleta, CA 93117
              </base-text>
            </div>
            <!-- Phone # -->
            <div class="flex flex-row">
              <!-- <ccu-icon /> -->
              <img src="@/assets/littlephone.jpg" class="h-5" />
              <base-text
                variant="bodysm"
                weight="300"
                class="text-crisiscleanup-dark-400 ml-3"
              >
                (732) 258-3730
              </base-text>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Activity -->
    <div class="flex-row">
      <base-text
        variant="bodysm"
        weight="300"
        class="text-crisiscleanup-dark-blue mt-3"
      >
        Claimed by 2 organizations ∙ Assigned to 2 teams
      </base-text>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CaseOverview',
};
</script>
