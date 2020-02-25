<template>
  <div>
    <hr class="line" />
    <div class="info">
      <table>
        <tr>
          <th class="base">Languages</th>
          <th class="lang">eng</th>
        </tr>
        <tr>
          <th class="base">Counties</th>
          <th class="counties">Texas, Louisiana</th>
        </tr>
        <tr>
          <th class="base">My Availability</th>
          <th class="show-btn">
            <button>Show</button>
          </th>
        </tr>
      </table>
    </div>
    <hr class="line" />
    <!---Buttons--->
    <div class="btnplacement">
    <div class="availabilitybtn">
      <button>Unavailable</button>
    </div>
    <div class="dialer-btn">
      <button>DP</button>
    </div>
    </div>
  </div>
</template>

<style>
.info {
  width: 100%;
  padding-bottom: 10px;
  padding-top: 10px;
  line-height: 1.6;
}
.base {
  color: #c0c0c0;
  text-align: left;
  font-size: 13px;
}
.lang {
  text-align: left;
  font-size: 13px;
  padding-left: 10px;
}
.counties {
  text-align: left;
  color: #696969;
  padding-left: 10px;
  font-size: 15px;
}
.show-btn {
  color: orange;
  text-align: left;
  text-decoration: underline;
  font-size: 13px;
  padding-left: 10px;
}
.line {
  background-color: #DCDCDC;
  color: #DCDCDC;
}
.btnplacement {
  padding-top: 10px;
}
.availabilitybtn {
  background-color: #DC143C;
  color: white;
  text-align: center;
  float: left;
  border: none;
  padding: 10px 40px;
  display: grid;
  font-size: 16px;
  font-weight: bold;
}
:hover .take-callsbtn {
  opacity: 0.7;
}
.dialer-btn {
  display: grid;
  background-color: #404040;
  color: #fefefe;
  text-align: center;
  float: right;
  padding: 10px 15px;
  font-size: 16px;
}
:hover .dialer-btn {
  opacity: 0.7;
}
</style>
