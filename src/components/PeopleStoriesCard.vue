<template>
  <div>
    <!--Header-->
    <p class="text-lg text-crisiscleanup-dark-400 justify-between">Stories from people you helped</p>
    <!--line-->
    <hr class="bg-white" />
    <!--Individual Stories Card-->
    <div class="stories">
      <i-story />
    </div>
    </div>
  </div>
</template>

<script>
import IndividualStoriesCard from './IndividualStoriesCard.vue';
export default {
  name: 'PeopleStoriesCard',
  components: {
    'i-story': IndividualStoriesCard,
  }
}
</script>
