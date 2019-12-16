export const groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {});

export const buildForm = (key, dict, array) => {
    for (let item of dict[key]) {
        if (item.label_t) {
            array.push(item)
        }
        if (item['field_key'] in dict) {
            buildForm(item['field_key'], dict, array)
        }
    }
}