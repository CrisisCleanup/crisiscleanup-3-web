<template>
  <div>
    <header>
      <base-text variant="h1" weight="900">Create New Team</base-text>
    </header>
    <base-input>Team Name</base-input>
    <base-button variant="underline">
      <base-text variant="bodysm">+ Chooose the name for me</base-text>
    </base-button>
    <div class="flex flex-col justify-between">
      <!-- Team Members -->
      <div class="flex flex-row justify-between">
        <div class="flex-col">
          <base-text variant="bodysm" class="text-crisiscleanup-dark-300">
            Team Members
          </base-text>
        </div>
        <div class="flex-col">
          <base-button variant="underline">
            <base-text variant="bodysm">
              + Add team Members
            </base-text>
          </base-button>
        </div>
      </div>
      <!-- Cases -->
      <div class="flex flex-row justify-between">
        <div class="flex-col">
          <base-text variant="bodysm" class="text-crisiscleanup-dark-300">
            Cases
          </base-text>
        </div>
        <div class="flex-col">
          <base-button variant="underline">
            <base-text variant="bodysm">
              + Assign Case to Team
            </base-text>
          </base-button>
        </div>
      </div>
    </div>
    <!-- Assets -->
    <div class="flex flex-row justify-between">
      <div class="flex-col">
        <base-text variant="bodysm" class="text-crisiscleanup-dark-300">
          Assets
        </base-text>
      </div>
      <div class="flex-col">
        <base-button variant="underline">
          <base-text variant="bodysm">
            + Add Assets
          </base-text>
        </base-button>
      </div>
    </div>
    <!-- Notes -->
    <base-text variant="bodysm" class="text-crisiscleanup-dark-300">
      Notes
    </base-text>
    <base-input variant="underline">
      text
    </base-input>
    <!-- Create New Team Button -->
    <div class="flex flex-row">
      <base-button variant="solid" class="w-full">Create Team</base-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateNewTeam',
};
</script>
