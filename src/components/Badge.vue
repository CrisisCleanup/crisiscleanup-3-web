<template>
    <div class="badge" :style="{'backgroundColor': color}" />
</template>

<script>
    export default {
        name: "Badge",
        props: ['color']
    }
</script>

<style scoped>
    .badge {
        width: 10px;
        height: 10px;
        display: inline-block;
        border-radius: 50%;
        vertical-align: middle;
        position: relative;
        top: -1px;
    }
</style>