<template>
  <div>
    <div v-if="showModal" class="modal flex">
      <font-awesome-icon
        @click="showModal = false"
        icon="times"
        class="
          text-white
          h-7
          w-7
          absolute
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
          absolute
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
          absolute
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
          absolute
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
          class="modal-content"
          id="modal-content"
          :style="`transform: scale(${scale}) rotate(${numClicks * 90}deg)`"
        />
      </slot>
    </div>
    <slot name="image">
      <div class="relative image-container w-24 h-24 mb-2">
        <img
          class="image-box w-20 h-20 mx-2 cursor-pointer"
          :src="imgSrc"
          @click="
            () => {
              $emit('image-click');
              showModal = true;
            }
          "
        />
        test
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
  },
  data() {
    return {
      showModal: false,
      numClicks: 0,
      scale: 1,
    };
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
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.9);
}

.modal-content {
  margin: auto;
  display: block;
  width: 80%;
  max-width: 700px;
}
</style>
