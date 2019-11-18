<template>
    <div>
        <img v-bind:class="styles" :src="iconMap[type]"/>
    </div>
</template>

<script>
    const iconMap = {
        dashboard: require('@/assets/icons/dashboard.svg'),
        cases: require('@/assets/icons/cases.svg'),
        print: require('@/assets/icons/print-big.svg'),
        share: require('@/assets/icons/share-big.svg'),
        download: require('@/assets/icons/download.svg'),
        active: require('@/assets/icons/active.svg'),
        edit: require('@/assets/icons/edit.svg'),
        search: require('@/assets/icons/search.svg'),
        table: require('@/assets/icons/table.svg'),
        map: require('@/assets/icons/notactive.svg'),
        info: require('@/assets/icons/inform.svg'),
    };
    export default {
        name: "BaseIcon",
        props: {
            type: String,
            size: String
        },
        data() {
            return {
                iconMap,
                styles: {
                    'ccu-icon': true,
                    'cursor-pointer': true,
                    'large': this.size === 'large',
                    'medium': this.size === 'medium',
                    small: this.size === 'small',
                }
            }
        }
    }
</script>

<style scoped>
    .ccu-icon {
        height: 30px;
        width: 30px;
    }
    .ccu-icon.medium {
        height: 20px;
        width: 20px;
    }
    .ccu-icon.small {
        height: 16px;
        width: 16px;
    }
    .filter-gray {
        filter: invert(84%) sepia(0%) saturate(30%) hue-rotate(209deg) brightness(107%) contrast(90%);
    }
    .filter-yellow {
        filter: invert(92%) sepia(21%) saturate(3995%) hue-rotate(346deg) brightness(98%) contrast(106%);
    }
</style>