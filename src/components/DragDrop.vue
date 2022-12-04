<template>
  <div class="flex items-center justify-center">
    <form ref="fileform" class="w-full h-full">
      <div
        class="relative w-full h-full flex"
        :class="containerClass || defaultClasses"
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

<script lang="ts">
import { ref, defineComponent, onMounted } from 'vue';

export default defineComponent({
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
    containerClass: {
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

  setup(props, context) {
    const dragAndDropCapable = ref(false);
    const fileform = ref<HTMLFormElement | null>(null);
    const fileinput = ref<HTMLInputElement | null>(null);
    const defaultClasses = ref(
      'items-center justify-center relative w-full h-full flex flex-col',
    );

    function determineDragAndDropCapable() {
      const div = document.createElement('div');
      return (
        ('draggable' in div || ('ondragstart' in div && 'ondrop' in div)) &&
        'FormData' in window
      );
    }

    onMounted(async () => {
      dragAndDropCapable.value = determineDragAndDropCapable();
      if (dragAndDropCapable.value && fileform.value) {
        [
          'drag',
          'dragstart',
          'dragend',
          'dragover',
          'dragenter',
          'dragleave',
          'drop',
        ].forEach((evt) => {
          if (fileform.value) {
            fileform.value.addEventListener(
              evt,
              (e) => {
                e.preventDefault();
                e.stopPropagation();
              },
              false,
            );
          }
        });

        const addDragOverClass = () => {
          if (fileform.value) {
            fileform.value.classList.add('is-dragover');
          }
        };

        const removeDragOverClass = () => {
          if (fileform.value) {
            fileform.value.classList.remove('is-dragover');
          }
        };

        fileform.value.addEventListener('drop', (e) => {
          if (e.dataTransfer?.files) {
            for (let i = 0; i < e.dataTransfer.files.length; i++) {
              context.emit('files', [e.dataTransfer.files[i]]);
            }
            removeDragOverClass();
          }
        });

        if (fileinput.value) {
          fileinput.value.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (target?.files) {
              for (let i = 0; i < target.files.length; i++) {
                context.emit('files', [target.files[i]]);
              }
            }
          });
        }

        fileform.value.addEventListener('dragover', addDragOverClass, false);
        fileform.value.addEventListener('dragenter', addDragOverClass, false);
        fileform.value.addEventListener('dragend', removeDragOverClass, false);
        fileform.value.addEventListener(
          'dragleave',
          removeDragOverClass,
          false,
        );
      }
    });

    return {
      defaultClasses,
      fileform,
      fileinput,
    };
  },
});
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
