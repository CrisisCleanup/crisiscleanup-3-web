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
    import { getStatusBadge } from '@/filters';
    export default {
        name: "StatusDropDown",
        components: {BaseSelect},
        props: {
            onSelect: Function,
            defaultValue: String,
        },
        data() {
          return {
              getStatusBadge
          }
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
        }
    }
</script>

<style scoped>

</style>