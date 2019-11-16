<template>
    <div class="table bg-white w-full">
        <div class="header text-gray-600" :style="gridStyleHeader">
            <div class="flex items-center p-2 border-b">
                <a-checkbox></a-checkbox>
            </div>
            <div class="p-2 border-b flex items-center" v-for="column of columns" :key="column.title">{{column.title}}</div>
            <div class="flex items-center p-2 border-b">
                <div class="flex items-center justify-center mx-1" style="width: 27px; height: 27px;background-color: #f5f5f5;">
                    <font-awesome-icon class="cursor-pointer" icon="caret-left"/>
                </div>
                <div class="flex items-center justify-center mx-1" style="width: 27px; height: 27px;background-color: #f5f5f5;">
                    <font-awesome-icon class="cursor-pointer" icon="caret-right"/>
                </div>
            </div>
        </div>
        <a-spin tip="Loading..." :spinning="loading">
            <div class="body" :style="gridStyleBody">
                <template v-for="item of data">
                    <div class="flex items-center p-2 border-b">
                        <a-checkbox></a-checkbox>
                    </div>
                    <div class="flex items-center p-2 border-b cursor-pointer" v-for="column of columns" @click="rowClick(item)">
                        <slot :name="column.key" v-bind:item="item">
                            {{item[column.key]}}
                        </slot>
                    </div>
                    <div class="flex items-center p-2 border-b">

                    </div>
                </template>
            </div>
        </a-spin>
        <div class="footer flex items-center justify-between p-2">
            <div>
                Number per page
                <BaseSelect :defaultValue="pagination.pageSize" :change="onSelectPageSize" size="small">
                    <template v-slot:options>
                        <a-select-option :key="size" v-for="size in pageSizes" :value="size">
                            {{size}}
                        </a-select-option>
                    </template>
                </BaseSelect>
            </div>
            <div>
                <div class="flex">
                    <BaseButton
                            :disabled="isPreviousButtonDisabled"
                            :action="() => { pageChangeHandle('previous') }"
                            title="Prev"
                            icon="caret-left"
                            class="mx-2"
                    >

                    </BaseButton>
                    <div>
                        <span :key="trigger" class="cursor-pointer px-2" v-for="trigger in paginationTriggers" @click="() => { pageChangeHandle(trigger) }">
                            {{ trigger }}
                        </span>
                    </div>
                    <BaseButton
                            :disabled="isNextButtonDisabled"
                            :action="() => { pageChangeHandle('next') }"
                            title="Next"
                            suffixIcon="caret-right"
                    >
                    </BaseButton>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import BaseSelect from "@/components/BaseSelect";
    import BaseButton from "@/components/BaseButton";
    export default {
        name: "Table",
        components: {BaseSelect, BaseButton},
        props: {
            columns: Array,
            data: Array,
            pagination: Object,
            loading: Boolean,
        },
        mounted() {

        },
        data() {
            return {
                pageSizes: [5, 10, 20, 100, 1000],
                visiblePagesCount: 5
            }
        },
        methods: {
            pageChangeHandle(value) {
                let newPage;
                switch (value) {
                    case 'next':
                        newPage = this.pagination.current + 1
                        break
                    case 'previous':
                        newPage = this.pagination.current -= 1
                        break
                    default:
                        newPage = value
                }

                let pagination = {
                    ...this.pagination,
                    current: newPage,
                    page: newPage,
                }
                let filter = {

                }
                let sorter = {

                }
                this.$emit('change', { pagination, filter, sorter})
            },
            onSelectPageSize(pageSize) {
                let pagination = {
                    ...this.pagination,
                    current: 1,
                    pageSize
                }
                let filter = {
                    
                }
                let sorter = {
                    
                }
                this.$emit('change', { pagination, filter, sorter})
            },
            rowClick(item) {
                this.$emit('rowClick', item)
            }
        },
        computed: {
            pageCount() {
                return Math.ceil(
                    (this.pagination.total || 1) / this.pagination.pageSize
                )
            },
            isPreviousButtonDisabled() {
                return this.pagination.current === 1
            },
            isNextButtonDisabled() {
                return this.pagination.current === this.pageCount
            },
            paginationTriggers() {
                const currentPage = this.pagination.current
                const pageCount = this.pageCount
                const visiblePagesCount = this.visiblePagesCount
                const visiblePagesThreshold = (visiblePagesCount - 1) / 2
                const pagintationTriggersArray = Array(this.visiblePagesCount - 1).fill(0)

                if (pageCount < visiblePagesCount) {
                    return Array(pageCount).fill(0).map((_, index) => index + 1)
                }

                if (currentPage <= visiblePagesThreshold + 1) {
                    pagintationTriggersArray[0] = 1
                    const pagintationTriggers = pagintationTriggersArray.map(
                        (paginationTrigger, index) => {
                            return pagintationTriggersArray[0] + index
                        }
                    )
                    pagintationTriggers.push(pageCount)
                    return pagintationTriggers
                }

                if (currentPage >= pageCount - visiblePagesThreshold + 1) {
                    const pagintationTriggers = pagintationTriggersArray.map(
                        (paginationTrigger, index) => {
                            return pageCount - index
                        }
                    )
                    pagintationTriggers.reverse().unshift(1)
                    return pagintationTriggers
                }

                pagintationTriggersArray[0] = currentPage - visiblePagesThreshold + 1
                const pagintationTriggers = pagintationTriggersArray.map(
                    (paginationTrigger, index) => {
                        return pagintationTriggersArray[0] + index
                    }
                )
                pagintationTriggers.unshift(1);
                pagintationTriggers[pagintationTriggers.length - 1] = pageCount
                return pagintationTriggers
            },
            gridTemplate() {
                let columnWidths = this.columns.map(column => column.width || '1fr');
                columnWidths.unshift('35px');
                columnWidths.push('90px');
                return columnWidths.join(' ')
            },
            gridStyleHeader() {
                return {
                    display: 'grid',
                    'grid-template-columns': this.gridTemplate
                }
            },
            gridStyleBody() {
                return {
                    display: 'grid',
                    'grid-template-columns': this.gridTemplate,
                    'max-height': '500px',
                    overflow: 'auto'
                }
            }
        }
    }
</script>

<style scoped>

</style>