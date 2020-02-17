<template>
  <div class="flex items-center justify-center">
    <form ref="fileform" class="w-full h-full">
      <div
        class="relative w-full h-full flex flex-col items-center justify-center"
      >
        <slot>
          <div class="p-2 text-crisiscleanup-grey-700">{{ dragTitle }}</div>
          <div>{{ $t('or') }}</div>
          <div class="p-2 underline text-primary-dark">{{ chooseTitle }}</div>
        </slot>
        <input
          ref="fileinput"
          class="file-input"
          type="file"
          :multiple="multiple"
          :disabled="disabled"
        />
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'DragDrop',
  props: {
    chooseTitle: {
      type: String,
      default: '',
    },
    dragTitle: {
      type: String,
      default: '',
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dragAndDropCapable: false,
    };
  },
  mounted() {
    this.dragAndDropCapable = this.determineDragAndDropCapable();
    if (this.dragAndDropCapable) {
      [
        'drag',
        'dragstart',
        'dragend',
        'dragover',
        'dragenter',
        'dragleave',
        'drop',
      ].forEach(evt => {
        this.$refs.fileform.addEventListener(
          evt,
          e => {
            e.preventDefault();
            e.stopPropagation();
          },
          false,
        );
      });

      const addDragOverClass = () => {
        this.$refs.fileform.classList.add('is-dragover');
      };

      const removeDragOverClass = () => {
        this.$refs.fileform.classList.remove('is-dragover');
      };

      this.$refs.fileform.addEventListener('drop', e => {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          this.$emit('files', e.dataTransfer.files);
        }
        removeDragOverClass();
      });

      this.$refs.fileinput.addEventListener('change', e => {
        for (let i = 0; i < e.target.files.length; i++) {
          this.$emit('files', e.target.files);
        }
      });

      this.$refs.fileform.addEventListener('dragover', addDragOverClass, false);
      this.$refs.fileform.addEventListener(
        'dragenter',
        addDragOverClass,
        false,
      );
      this.$refs.fileform.addEventListener(
        'dragend',
        removeDragOverClass,
        false,
      );
      this.$refs.fileform.addEventListener(
        'dragleave',
        removeDragOverClass,
        false,
      );
    }
  },
  methods: {
    determineDragAndDropCapable() {
      const div = document.createElement('div');
      return (
        ('draggable' in div || ('ondragstart' in div && 'ondrop' in div)) &&
        'FormData' in window
      );
    },
  },
};
</script>

<style>
.file-drop-area {
  position: relative;
  display: flex;
  align-items: center;
  width: 500px;
  max-width: 100%;
  padding: 25px;
  border: 1px dashed black;
  border-radius: 3px;
  transition: 0.2s;
}

.fake-btn {
  flex-shrink: 0;
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  padding: 8px 15px;
  margin-right: 10px;
  font-size: 12px;
  text-transform: uppercase;
}

.file-msg {
  font-size: small;
  font-weight: 300;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-input {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  cursor: pointer;
  opacity: 0;
}

.file-input:focus {
  outline: none;
}

.is-dragover {
  background-color: theme('colors.crisiscleanup-grey.200');
}
</style>
