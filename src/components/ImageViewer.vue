<template>
  <div id="modal-content" class="modal-content">
    <font-awesome-icon
      @click="
        () => {
          $emit('onClose');
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
    <font-awesome-icon
      class="
        text-white
        w-7
        h-7
        fixed
        right-7
        top-108
        hover:text-primary-dark
        cursor-pointer
        z-50
      "
      icon="fa-solid fa-chevron-right"
      @click="moveImage(1)"
    />
    <font-awesome-icon
      v-if="imageIndex > 0"
      class="
        text-white
        w-7
        h-7
        fixed
        left-7
        top-108
        hover:text-primary-dark
        cursor-pointer
        z-50
      "
      icon="fa-solid fa-chevron-left"
      @click="moveImage(-1)"
    />
    <slot name="modal-content">
      <img
        :src="selectedImage.large_thumbnail_url"
        :style="`transform: scale(${scale}) rotate(${numClicks * 90}deg)`"
      />
    </slot>
  </div>
</template>
<script>
export default {
  name: 'ImageViewer',
  props: {
    selectedImage: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      numClicks: 0,
      scale: 1,
      imageIndex: -1,
    };
  },
  methods: {
    moveImage(updateAmount) {
      this.$emit('changeImage', updateAmount);
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
