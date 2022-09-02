import moment from 'moment';

/**
 * Group objects by property.
 * `nestGroupsBy` helper method.
 *
 * @param {String} property
 * @param {Object[]} conversions
 * @returns {Object}
 */
function groupBy(conversions, property) {
  return conversions.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

function nestGroupsBy(arr, properties) {
  const props = Array.from(properties);
  if (props.length === 1) {
    return groupBy(arr, Array.from(props)[0]);
  }
  const property = props.shift();
  const grouped = groupBy(arr, property);
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(grouped)) {
    grouped[key] = nestGroupsBy(grouped[key], Array.from(props));
  }
  return grouped;
}

export function transformWidgetData(graphValue) {
  let data = {};
  if (graphValue.definition.type === 'pie') {
    const value1 = nestGroupsBy(
      graphValue.data,
      graphValue.definition.group_by,
    );
    const result = {};
    if (graphValue.data.length > 0) {
      Object.entries(value1).forEach(([wt, d]) => {
        result[wt] = [];
        Object.entries(d as any).forEach(([key, state_value]: any) => {
          const obj = state_value[0];

          Object.keys(obj).forEach((k) => {
            if (!graphValue.definition.group_by.includes(k)) {
              result[wt].push({
                name: `${key}_${k}`,
                value: obj[k],
              });
            }
          });
        });
      });
    }

    data = {
      data: result,
      group_by: graphValue.definition.group_by[0],
      type: graphValue.definition.type,
      display_options: graphValue.display_options,
    };
  } else if (graphValue.definition.type === 'multiline') {
    data = {
      data: graphValue.data,
      group_by: graphValue.definition.group_by[0],
      display_options: graphValue.display_options,
      type: graphValue.definition.type,
    };
  } else if (graphValue.definition.type === 'barstack') {
    data = {
      data: graphValue.data.map((entry) => {
        return {
          ...entry,
          [graphValue.definition.group_by[0]]: moment(
            entry[graphValue.definition.group_by[0]],
          ).toDate(),
        };
      }),
      group_by: graphValue.definition.group_by[0],
      type: graphValue.definition.type,
      display_options: graphValue.display_options,
    };
  }
  return data;
}

export function transformGraphData(rawGraphData) {
  const transformedGraphData = {};
  if (rawGraphData) {
    rawGraphData.forEach(([graphKey, graphValue]) => {
      transformedGraphData[graphKey] = transformWidgetData(graphValue);
    });
  }
  return transformedGraphData;
}
