import moment from 'moment';

export function transformWidgetData(graphValue) {
  let data = {};
  if (graphValue.definition.type === 'pie') {
    const result = {};
    graphValue.data.forEach((graph) => {
      result[graph[graphValue.definition.group_by[0]]] = [];

      Object.keys(graph).forEach((key) => {
        if (key !== graphValue.definition.group_by[0]) {
          result[graph[graphValue.definition.group_by[0]]].push({
            name: key,
            value: graph[key],
          });
        }
      });
    });
    data = {
      data: result,
      group_by: graphValue.definition.group_by[0],
      type: graphValue.definition.type,
    };
  } else if (graphValue.definition.type === 'multiline') {
    data = {
      data: graphValue.data,
      group_by: graphValue.definition.group_by[0],
      type: graphValue.definition.type,
    };
  } else if (graphValue.definition.type === 'barstack') {
    data = {
      data: graphValue.data.map((entry) => {
        return {
          key: moment(entry[graphValue.definition.group_by[0]]).toDate(),
          values: Object.keys(entry)
            .filter((key) => key !== graphValue.definition.group_by[0])
            .map((key) => {
              return {
                grpName: key,
                grpValue: entry[key],
              };
            }),
        };
      }),
      group_by: graphValue.definition.group_by[0],
      type: graphValue.definition.type,
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
