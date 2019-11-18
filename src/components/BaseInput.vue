<template>
    <div class="flex items-center justify-start">
        <input v-bind:class="classes" type="text" ref="input" :value="value" @input="update" :disabled="disabled" :placeholder="placeholder" :required="required"/>
        <div class="icon-container flex items-center justify-center" v-if="icon">
            <ccu-icon :type="icon" size="small"></ccu-icon>
        </div>
    </div>
</template>

<script>
    export default {
        name: "BaseInput",
        props: ['size', 'icon', 'value', 'disabled', 'placeholder', 'required'],
        data() {
            return {
                classes: {
                    'flex-grow': true,
                    'large': this.size === 'large',
                    'base': this.size !== 'large',
                    'has-icon': Boolean(this.icon),
                }
            }
        },
        methods: {
            update(e) {
                this.$emit('input', e.target.value)
            }
        }
    }
</script>

<style scoped>
    input:disabled {
        background-color: #f7f7f7;
    }

    .large {
        outline: none;
        width: 300px;
        height: 50px;
        border-radius: 0;
        border: solid 1px #dadada;
        padding: 10px;
    }

    .large.has-icon {
        width: 250px;
    }

    .icon-container {
        width: 50px;
        height: 50px;
        border: solid 1px #dadada;
        border-left: 0;
        background-color: #f7f7f7;
    }
</style>