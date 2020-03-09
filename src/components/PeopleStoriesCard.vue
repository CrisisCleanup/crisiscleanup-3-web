<template>
  <div>
    <!--Header-->
    <p
      class="text-md text-crisiscleanup-dark-400 justify-between font-bold m-1 p-3"
    >
      Stories from people you helped
    </p>
    <!--line-->
    <hr class="bg-white" />
    <!--Individual Stories Card-->
    <div class="stories">
      <i-story />
    </div>
  </div>
</template>

<script>
import IndividualStoriesCard from './IndividualStoriesCard.vue';
export default {
  name: 'PeopleStoriesCard',
  components: {
    'i-story': IndividualStoriesCard,
  },
};
</script>
