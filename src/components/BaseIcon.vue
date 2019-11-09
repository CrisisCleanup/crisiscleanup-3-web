<template>
    <img v-bind:class="styles" :src="iconMap[type]"/>
</template>

<script>
    const iconMap = {
        dashboard: require('@/assets/icons/dashboard.svg'),
        cases: require('@/assets/icons/cases.svg'),
        print: require('@/assets/icons/share-big.svg'),
        share: require('@/assets/icons/print-big.svg'),
        download: require('@/assets/icons/download.svg'),
        active: require('@/assets/icons/active.svg'),
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
        height: 15px;
        width: 15px;
    }
</style>