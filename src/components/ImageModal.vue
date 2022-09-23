<template>
  <div>
    <div v-show="showModal" class="modal">
      <div id="modal-content" class="modal-content">
        <font-awesome-icon
          @click="
            () => {
              $emit('onClose');
              showModal = false;
            }
          "
          icon="times"
          class="
            text-white
            h-7
            w-7
            fixed
            top-3
            right-7
            cursor-pointer
            hover:text-primary-dark
            z-50
          "
        />
        <font-awesome-icon
          class="
            text-white
            w-7
            h-7
            fixed
            right-7
            top-12
            hover:text-primary-dark
            cursor-pointer
            z-50
          "
          icon="fa-solid fa-rotate"
          @click="numClicks++"
        />
        <font-awesome-icon
          class="
            text-white
            w-7
            h-7
            fixed
            right-7
            top-24
            hover:text-primary-dark
            cursor-pointer
            z-50
          "
          icon="fa-solid fa-plus"
          @click="scale += 0.25"
        />
        <font-awesome-icon
          class="
            text-white
            w-7
            h-7
            fixed
            right-7
            top-32
            hover:text-primary-dark
            cursor-pointer
            z-50
          "
          icon="fa-solid fa-minus"
          @click="scale -= 0.25"
        />
        <slot name="modal-content">
          <img
            :src="modalImg ? modalImg : imgSrc"
            :style="`transform: scale(${scale}) rotate(${numClicks * 90}deg)`"
          />
        </slot>
      </div>
    </div>
    <slot name="image">
      <div class="relative image-container w-24 h-24 mb-2">
        <img
          class="w-20 h-20 mx-2 cursor-pointer"
          :src="imgSrc"
          @click="appearModal"
        />
        <ccu-icon
          :alt="$t('actions.delete')"
          size="xs"
          type="trash"
          class="absolute right-0 top-0 m-1 mr-3 p-1 image-close bg-white"
          @click.native="$emit('removeImage')"
        />
      </div>
    </slot>
  </div>
</template>
<script>
export default {
  name: 'ImageModal',
  props: {
    imgSrc: {
      type: String,
      required: true,
    },
    modalImg: {
      type: String,
      default: null,
    },
    disableModal: {
      type: Boolean,
      default: false,
    },
    imgIndex: {
      type: Number,
      default: -1,
    },
    imgListLength: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      showModal: false,
      numClicks: 0,
      scale: 1,
    };
  },
  methods: {
    appearModal() {
      this.$emit('image-click');
      if (!this.disableModal) {
        this.showModal = true;
        document.getElementById('top').scrollIntoView();
      }
    },
  },
};
</script>
<style scoped>
.image-container:hover .image-close {
  display: flex;
}
.image-close {
  display: none;
}
.modal {
  @apply relative;
  z-index: 10000;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.9);
}

.modal-content {
  @apply w-full flex items-center justify-center mt-80;
}
</style>
