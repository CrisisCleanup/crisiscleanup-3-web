<template>
<div>
    <!--line-->
    <hr class="bg-white" />
    <!--Individual Stories Card-->
    <div class="info">
      <i-story />
    </div>
    <!--line-->
    <hr class="bg-white" />
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

<style scoped>

</style>
