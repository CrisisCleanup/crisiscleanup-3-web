<template>
    <div class="flex items-center justify-start w-full autocomplete">
        <vue-autosuggest
                v-bind="$attrs"
                :suggestions="[{data: suggestions}]"
                :get-suggestion-value="getSuggestionValue"
                :input-props="{id:'autosuggest__input', placeholder, required, autocomplete: 'off', type: 'search'}"
                @input="onInputChange"
                @selected="onSelected"
                :class="classes"
        >
            <template slot-scope="{suggestion}">
                <span class="my-suggestion-item"></span>
                <slot name="result" :suggestion="suggestion">
                    {{suggestion.item[displayProperty]}}
                </slot>
            </template>
        </vue-autosuggest>
        <div v-if="loading" class="icon-container flex items-center justify-center" :class="iconClasses">
            <font-awesome-icon icon="spinner" spin />
        </div>
        <div class="icon-container flex items-center justify-center" v-if="(icon || tooltip) && !loading" :class="iconClasses">
            <ccu-icon :type="tooltip ? 'info': icon" size="small"></ccu-icon>
        </div>
    </div>
</template>

<script>
    export default {
        name: "autocomplete",
        props: ['suggestions', 'displayProperty', 'icon', 'placeholder', 'required', 'size', 'tooltip', 'full', 'loading'],
        data() {
            return {
                selected: '',
                filteredOptions: [],
                inputProps: {
                    id: "autosuggest__input",
                    onInputChange: this.onInputChange,
                    placeholder: "Type 'e'"
                },
                classes: {
                    'flex-grow': true,
                    'relative': true,
                    'text-base': true,
                    'font-light': true,
                    'large': this.size === 'large',
                    'base': this.size !== 'large',
                    'has-icon': Boolean(this.icon),
                    'has-tooltip': Boolean(this.tooltip),
                    'full': Boolean(this.full),
                },
                iconClasses: {
                    'large': this.size === 'large',
                    'base': this.size !== 'large',
                    'has-tooltip': Boolean(this.tooltip),
                }
            };
        },
        methods: {
            onSelected(option) {
                this.selected = option.item;
                this.$emit('selected', option.item);
            },
            getSuggestionValue(suggestion) {
                return suggestion.item[this.displayProperty];
            },
            onInputChange(text) {
                if (text === '' || text === undefined) {
                    return;
                }
                this.$emit('search', text);
            }
        }
    };
</script>

<style>
    #autosuggest__input {
        outline: none;
        width: 300px;
        height: 32px;
        border-radius: 0;
        border: solid 1px #dadada;
        padding: 10px;
        position: relative;
    }

    .large #autosuggest__input {
        height: 50px;
    }

    .has-icon #autosuggest__input {
        width: 100%;
        border-right: 0;
    }

    .has-tooltip #autosuggest__input {
        width: 100%;
    }

    .autosuggest__results {
        font-weight: 300;
        /*width: 100%;*/
        position: absolute;
        z-index: 10000001;
        border: 1px solid #e0e0e0;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        background: white;
        padding: 0px;
        overflow: auto;
        max-height: 200px;
    }

    .full .autosuggest__results {
        width: max-content;
    }

    .autocomplete .icon-container {
        width: 32px;
        height: 32px;
        border: solid 1px #dadada;
        border-left: 0;
    }

    .autocomplete .has-tooltip.icon-container {
        background-color: #f7f7f7;
    }

    .autocomplete .large.icon-container {
        width: 50px;
        height: 50px;
    }

    .autosuggest__results ul {
        list-style: none;
        padding-left: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
    }

    .autosuggest__results .autosuggest__results_item {
        cursor: pointer;
        padding: 15px;
    }

    #autosuggest ul:nth-child(1) > .autosuggest__results_title {
        border-top: none;
    }

    .autosuggest__results .autosuggest__results_title {
        color: gray;
        font-size: 11px;
        margin-left: 0;
        padding: 15px 13px 5px;
        border-top: 1px solid lightgray;
    }

    .autosuggest__results .autosuggest__results_item:active,
    .autosuggest__results .autosuggest__results_item:hover,
    .autosuggest__results .autosuggest__results_item:focus,
    .autosuggest__results .autosuggest__results_item.autosuggest__results_item-highlighted {
        background-color: red;
    }

</style>