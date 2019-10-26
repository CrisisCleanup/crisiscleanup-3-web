<template>
    <div class="p-6">
        <div class="flex">
            <a-card class="w-1/4 m-4">
                <div>My Claimed Cases</div>
                <div>4</div>
            </a-card>
            <a-card class="w-1/4 m-4">
                <div>Total Claimed</div>
                <div>323 (95%)</div>
            </a-card>
            <a-card class="w-1/4 m-4">
                <div>In Progress</div>
                <div>12 (11%)</div>
            </a-card>
            <a-card class="w-1/4 m-4">
                <div>Closed</div>
                <div>272 (84.2%)</div>
            </a-card>
        </div>
        <div class="flex">
            <a-card title="My Cases" class="w-1/2 m-4">
                <div>My Claimed Cases</div>
                <div>4</div>
            </a-card>
            <a-card class="w-1/2 m-4">
                <div>Total Claimed</div>
                <div>323 (95%)</div>
            </a-card>
        </div>
    </div>
</template>


<script>
    export default {
        name: "Dashboard"
    }
</script>

<style scoped>

</style>