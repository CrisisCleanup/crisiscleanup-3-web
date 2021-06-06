<template>
  <div>
    <div class="w-6/12 bg-white p-2 shadow rounded z-1">
      <div name="info" class="flex flex-col">
        <div class="flex flex-row justify-between pb-2">
          <div class="mr-2">
            <div class="font-bold">Triston Lewis</div>
            <div>Triston@arroyodev.com</div>
          </div>
          <div
            class="flex text-center items-center rounded h-2/12 w-2/12 justify-center text-md flex-wrap"
            :class="status"
          >
            {{ status }}
          </div>
        </div>

        <hr />
        <div class="font-bold">Created on 3/05/2021</div>
        <div>
          I really don’t know what is going on with the phone system at the
          moment. My calls keep Disconnecting every other minute.
        </div>
        <hr />
        <div class="flex flex-row justify-between">
          <div>
            <div>picture</div>
            <div>assigned to: arron titus</div>
          </div>
          <div>
            <base-button text="Login" variant="solid" class="m-2" />
            <base-button text="Launch" variant="solid" class="m-2" />
          </div>
        </div>
      </div>
      <div v-if="!dropDownState" @click="changeDropDownState" class="arrow">
        <div class="arrow-top"></div>
        <div class="arrow-bottom"></div>
      </div>

      <div v-show="dropDownState" class="h-62">
        <div class="flex flex-row justify-between">
          <div>Organization Name:</div>
          <div>Southeast Baptist Helpers</div>
        </div>

        <div class="flex flex-row justify-between">
          <div>Login Activity:</div>
          <div>Southeast Baptist Helpers</div>
        </div>

        <div class="flex flex-row justify-between">
          <div>Browser Type:</div>
          <div>Southeast Baptist Helpers</div>
        </div>

        <div class="flex flex-row justify-between">
          <div>Operating System:</div>
          <div>Southeast Baptist Helpers</div>
        </div>

        <div v-if="dropDownState" @click="changeDropDownState" class="arrow-up">
          <div class="arrow-top"></div>
          <div class="arrow-bottom"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TicketCards',
  props: {
    status: {
      type: String,
      default: null,
    },
    ticketData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      dropDownState: false,
    };
  },
  methods: {
    changeDropDownState() {
      this.dropDownState = !this.dropDownState;
    },
  },
};
</script>

<style scoped>
.New {
  color: #c19700;
  background: #fff59c;
}

.Open {
  color: #0042ed;
  background: #9cb8ff;
}

.Pending {
  color: #f21b1b;
  background: #ffa296;
}

.Solved {
  color: #6b6b6b;
  background: #e8e4e4;
}

.arrow {
  cursor: pointer;
  height: 20px;
  left: 50%;
  position: relative;
  top: 50%;
  transform: translateX(-45%) translateY(270%) rotate(90deg);

  transition: transform 0.1s;
  width: 80px;

  $transition-time: 0.15 s;
  ,
  &-top,
  &-bottom {
    background-color: #666;
    height: 4px;
    left: -5px;
    position: absolute;
    top: 50%;
    width: 20%;

    &:after {
      background-color: gold;
      content: '';
      height: 100%;
      position: absolute;
      top: 0;
      transition: all $transition-time;
    }
  }

  &-top {
    transform: rotate(45deg);
    transform-origin: bottom right;

    &:after {
      left: 100%;
      right: 0;
      transition-delay: 0s;
    }
  }

  &-bottom {
    transform: rotate(-45deg);
    transform-origin: top right;

    &:after {
      left: 0;
      right: 100%;
      transition-delay: $transition-time;
    }
  }

  &:hover & {
    &-top:after {
      left: 0;
      transition-delay: $transition-time;
    }

    &-bottom:after {
      right: 0;
      transition-delay: 0s;
    }
  }
}

.arrow-up {
  cursor: pointer;
  height: 20px;
  left: 50%;
  position: relative;
  top: 50%;
  transform: translateX(-62%) translateY(-50%) rotate(-90deg);

  transition: transform 0.1s;
  width: 80px;

  $transition-time: 0.15 s;
  ,
  &-top,
  &-bottom {
    background-color: #666;
    height: 4px;
    left: -5px;
    position: absolute;
    top: 50%;
    width: 20%;

    &:after {
      background-color: gold;
      content: '';
      height: 100%;
      position: absolute;
      top: 0;
      transition: all $transition-time;
    }
  }

  &-top {
    transform: rotate(45deg);
    transform-origin: bottom right;

    &:after {
      left: 100%;
      right: 0;
      transition-delay: 0s;
    }
  }

  &-bottom {
    transform: rotate(-45deg);
    transform-origin: top right;

    &:after {
      left: 0;
      right: 100%;
      transition-delay: $transition-time;
    }
  }

  &:hover & {
    &-top:after {
      left: 0;
      transition-delay: $transition-time;
    }

    &-bottom:after {
      right: 0;
      transition-delay: 0s;
    }
  }
}
</style>
