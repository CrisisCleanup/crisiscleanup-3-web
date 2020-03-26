<template>
  <div>
    <div class="flex flex-row justify-between">
      <!--- media/picture --->
      <div class="flex-col m-3">
        <img src="@/assets/newstrainingss.jpg" alt="PFP" />
      </div>
      <div class="flex-col m-3">
        <!--- body blurb --->
        <base-text variant="bodysm" class="justify-between">
          Then go and tempor incididunt ut labore et dolore magna aliqua.
        </base-text>
        <div class="flex flex-row justify-between">
          <div class="flex-col">
            <!--- Date --->
            <base-text
              variant="bodysm"
              class="justify-between text-crisiscleanup-grey-800 alight-left"
            >
              10 Minutes
            </base-text>
          </div>
          <div class="flex-col">
            <!--- Training Start Button --->
            <div id="Trainingbtn" class="ml-auto m-1">
              <base-button
                class="bg-crisiscleanup-yellow-300 hover:bg-crisiscleanup-yellow-100 text-black align-right px-5 py-1"
                href="https://crisiscleanup.zendesk.com/hc/en-us/articles/360033226251-Mandatory-Phone-System-Training"
              >
                Start
              </base-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- line -->
    <hr class="bg-white" />
  </div>
</template>

<script>
export default {
  name: 'NewsCard',
};
</script>
