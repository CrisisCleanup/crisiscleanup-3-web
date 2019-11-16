<template>
    <BaseSelect :defaultValue="defaultValue" :change="onSelect" size="small">
        <template v-slot:options>
            <a-select-option :key="status.status" v-for="status in statuses" :value="status.status">
                <div class="badge-holder flex items-center">
                    <a-badge :status="getStatusBadge(status.status)" />
                    {{status.status_name_t}}
                </div>
            </a-select-option>
        </template>
    </BaseSelect>
</template>

<script>
    import BaseSelect from "@/components/BaseSelect";
    import Status from "@/models/Status";
    export default {
        name: "StatusDropDown",
        components: {BaseSelect},
        props: {
            onSelect: Function,
            defaultValue: String,
        },
        computed: {
            statuses () {
                return Status.all()
            },
            dropdownStyle() {
                return {
                   'background-color': 'red'
                }
            }
        },
        methods: {
            getStatusBadge(status) {
                const status_dict = {
                    "open_unassigned": "error",
                    "open_assigned":"processing",
                    "open_partially-completed":"processing",
                    "open_needs-follow-up":"processing",
                    "open_unresponsive":"default",
                    "closed_completed":"success",
                    "closed_partially-completed":"success",
                    "closed_incomplete":"default",
                    "closed_out-of-scope":"default",
                    "closed_done-by-others":"success",
                    "closed_no-help-wanted":"default",
                    "closed_rejected":"default",
                    "closed_duplicate":"default",
                    "closed_marked-for-deletion":"default"
                };
                return status_dict[status];
            },
        }
    }
</script>

<style scoped>

</style>