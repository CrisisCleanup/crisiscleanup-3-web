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
      <img src="" alt="Profile Photo" />
    </div>
    <!---Buttons--->
    <div class="take-callsbtn">
      <button>Take Calls</button>
    </div>
    <div class="return-callsbtn">
      <button>Return Calls</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CallerCard',
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
.take-callsbtn {
  background-color: #ffd700;
  color: #000;
  text-align: center;
  float: left;
  border: none;
  padding: 10px 15px;
  display: grid;
  font-size: 16px;
}
:hover .take-callsbtn {
  opacity: 0.7;
}
.return-callsbtn {
  display: grid;
  background-color: #404040;
  color: #fefefe;
  text-align: center;
  float: right;
  padding: 10px 15px;
  font-size: 16px;
}
:hover .return-callsbtn {
  opacity: 0.7;
}
</style>
