// @flow
/**
 * Table Helpers
 */

import _ from 'lodash';

export type ColumnT = {|
  dataIndex: string,
  key: string,
  title: string,
  width?: string,
|};

const makeColumn = ([name, width = '1fr', title]): ColumnT => ({
  dataIndex: _.snakeCase(name),
  key: _.snakeCase(name),
  title: title || _.startCase(_.replace(name, '_t', '')),
  width,
});

const makeTableColumns = (cols: string[]): ColumnT[] =>
  cols.map((c) => makeColumn(c));

export { makeTableColumns };
