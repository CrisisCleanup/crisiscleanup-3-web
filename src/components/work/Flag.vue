<template>
  <tag
    class="text-center text-white rounded-full px-2"
    :style="{
      backgroundColor: getColor(flagReason),
      color: 'white',
    }"
    :closeable="removable"
    @closed="onRemove"
  >
    {{ $t(flagReason) }}
  </tag>
</template>

<script lang="ts">
const colorsDicts = {
  'flag.worksite_high_priority': '#367bc3',
  'flag.worksite_upset_client': '#00b3bf',
  'flag.worksite_mark_for_deletion': '#000000',
  'flag.worksite_abuse': '#d79425',
  'flag.duplicate': '#000000',
  'flag.worksite_wrong_location': '#f77020',
  'flag.worksite_wrong_incident': '#c457e7',
};

export default defineComponent({
  name: 'Flag',
  props: {
    flagReason: {
      type: String,
      default: '',
    },
    removable: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    function getColor() {
      return colorsDicts[props.flagReason];
    }
    function onRemove() {
      emit('onRemove');
    }

    return {
      getColor,
      onRemove,
    };
  },
});
</script>
