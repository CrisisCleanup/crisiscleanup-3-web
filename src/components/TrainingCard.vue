<template>
  <div>
    <b-card>
      <b-tabs pills card>
        <b-tab title="News" class="news-tab" active>
          this is the news tab
        </b-tab>
        <b-tab title="Training" class="training-tab" active>
          <!---media/picture--->
          <div class="flex-col m-3">
            <img src="" alt="PFP" />
          </div>
          <!---body blurb--->
          <base-text variant="bodysm" class="justify-between">
            Then go and tempor incididunt ut labore et dolore magna aliqua.
          </base-text>
          <!--- Training Start Button --->
          <div id="Trainingbtn">
            <base-button
              class="bg-crisis-cleanup-yellow-900 hover:bg-crisiscleanup-yellow-500 text-black align-right"
              href="https://crisiscleanup.zendesk.com/hc/en-us/articles/360033226251-Mandatory-Phone-System-Training"
            >
              Start
            </base-button>
          </div>
          <!---Date--->
          <base-text
            variant="bodysm"
            class="justify-between text-crisiscleanup-grey-500 alight-left"
          >
            10 Minutes
          </base-text>
          <!--- See All Button --->
          <div id="See-All-btn">
            <base-button class="text-crisis-cleanup-yellow-900 align-right">
              See All
            </base-button>
          </div>
        </b-tab>
      </b-tabs>
    </b-card>
    <!--line-->
    <hr class="bg-white" />
  </div>
</template>

<script>
export default {
  name: 'TrainingCard',
};
</script>

<style scoped>
/* tab selection colors */
.news-tab {
  border-width: thick;
}
.news-tab:focus {
  border-bottom: #f79820;
  border-width: thick;
}
.training-tab {
  border-width: thick;
}
.training-tab:focus {
  border-bottom: #f79820;
  border-width: thick;
}
</style>
