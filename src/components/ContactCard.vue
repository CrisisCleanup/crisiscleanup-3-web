<template>
  <div>
    <div class="name-mobile-position">
      <!------Name------>
      <div class="user_name"><h1>full name</h1></div>
      <!---Mobile--->
      <div class="mobile-number">(601) 123-4567</div>
    </div>
    <!---Profile Photo--->
    <div class="profile-photo">
      <img src="" alt="PFP" />
    </div>
    <!---More Info--->
    <div class="more-infobtn">
      <button onclick="myFunction()">more info</button>
    </div>
    <!---info card--->
    <div id="info-card">
      <more-info></more-info>
    </div>
  </div>
</template>

<script>
import ContactMoreInfo from './ContactMoreInfo.vue';

export default {
  name: 'CallerCard',
  components: {
    'more-info': ContactMoreInfo,
  },
};
</script>

<style>
.name-mobile-position {
  float: right;
  padding-bottom: 20px;
}
.user_name {
  font-size: 20px;
  font-weight: bold;
  text-align: left;
}
.mobile-number {
  font-size: 18px;
  text-align: left;
}
.profile-photo {
  float: left;
  padding-bottom: 20px;
}
.more-infobtn {
  color: blue;
  padding-left: 50px;
}
</style>
