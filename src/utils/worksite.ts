import moment from 'moment';
import axios from 'axios';
import { DbService } from '../services/db.service';

const loadCases = async (query) => {
  const response = await axios.get(
    `${import.meta.env.VITE_APP_API_BASE_URL}/worksites_all`,
    {
      params: {
        ...query,
      },
    },
  );
  return response.data;
};

const loadCasesCached = async (query) => {
  const hashCode = (string_) =>
    string_
      .split('')
      // eslint-disable-next-line no-bitwise
      .reduce((s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0, 0);
  const queryHash = hashCode(JSON.stringify(query));
  const cachedCases = await DbService.getItem(`cachedCases:${queryHash}`);
  const casesUpdated = await DbService.getItem(`casesUpdated:${queryHash}`);
  const casesReconciled =
    (await DbService.getItem(`casesReconciled:${queryHash}`)) ||
    moment().toISOString();
  if (cachedCases) {
    const [response, reconciliationResponse] = await Promise.all([
      axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/worksites_all`, {
        params: {
          ...query,
          updated_at__gt: casesUpdated,
        },
      }),
      axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/worksites_all`, {
        params: {
          updated_at__gt: casesReconciled,
          fields: 'id,incident',
        },
      }),
    ]);

    for (const element of reconciliationResponse.data.results) {
      const itemIndex = cachedCases.results.findIndex(
        (o) => o.id === element.id,
      );
      if (
        itemIndex > -1 &&
        element.incident !== cachedCases.results[itemIndex].incident
      ) {
        cachedCases.results.splice(itemIndex, 1);
      }
    }

    await DbService.setItem(
      `casesReconciled:${queryHash}`,
      moment().toISOString(),
    );

    await DbService.setItem(`cachedCases:${queryHash}`, cachedCases);

    if (response.data.count === 0) {
      return cachedCases;
    }

    for (const element of response.data.results) {
      const itemIndex = cachedCases.results.findIndex(
        (o) => o.id === element.id,
      );
      if (itemIndex > -1) {
        cachedCases.results[itemIndex] = element;
      } else {
        cachedCases.results.push(element);
      }
    }

    cachedCases.count = cachedCases.results.length;

    await DbService.setItem(`cachedCases:${queryHash}`, cachedCases);
    await DbService.setItem(
      `casesUpdated:${queryHash}`,
      moment().toISOString(),
    );
    return cachedCases;
  }

  const response = await axios.get(
    `${import.meta.env.VITE_APP_API_BASE_URL}/worksites_all`,
    {
      params: {
        ...query,
      },
    },
  );
  await DbService.setItem(`cachedCases:${queryHash}`, response.data);
  await DbService.setItem(`casesUpdated:${queryHash}`, moment().toISOString());
  return response.data;
};

export { loadCasesCached, loadCases };
