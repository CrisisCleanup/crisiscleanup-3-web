<template>
    <a-select :defaultValue="defaultValue" @change="onSelect" size="large">
        <a-select-option :key="name" v-for="(value, name) in statuses" :value="name">{{value}}</a-select-option>
    </a-select>
</template>

<script>
    const statuses = {
        "open_unassigned": "open_unassigned",
        "open_assigned": "open_assigned",
        "open_partially-completed": "open_partially-completed",
        "open_needs-follow-up": "open_needs-follow-up",
        "open_unresponsive": "open_unresponsive",
        "closed_completed": "closed_completed",
        "closed_partially-completed": "closed_partially-completed",
        "closed_incomplete": "closed_incomplete",
        "closed_out-of-scope": "closed_out-of-scope",
        "closed_done-by-others": "closed_done-by-others",
        "closed_no-help-wanted": "closed_no-help-wanted",
        "closed_rejected": "closed_rejected",
        "closed_duplicate": "closed_duplicate",
        "closed_marked-for-deletion": "closed_marked-for-deletion"
    }
    export default {
        name: "StatusDropDown",
        props: {
            onSelect: Function,
            defaultValue: String,
        },
        data() {
            return {
                statuses
            }
        }
    }
</script>

<style scoped>

</style>