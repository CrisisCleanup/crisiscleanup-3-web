<template>
    <a-select v-bind="$attrs" @change="change" v-decorator="decorator">
        <slot name="options"></slot>
        <template slot="suffixIcon">
            <font-awesome-icon size="sm" :icon="icon || 'sort'" />
        </template>
    </a-select>
</template>

<script>
    export default {
        name: "BaseSelect",
        props: {
            change: {
                type: Function,
                default: () => {
                },
            },
            icon: String,
            decorator: Array
        },
    }
</script>

<style scoped>

</style>