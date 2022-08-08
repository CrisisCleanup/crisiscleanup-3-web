import { ref, Ref } from 'vue';
import axios from 'axios';
import { getErrorMessage } from '@/utils/errors';

export default function useCapabilities(url) {
  const organizationCapabilities = ref();
  const updatedOrganizationCapabilitiesMatrix = ref();
  const setUpdatedOrganizationCapabilitiesMatrix = (value) => {
    updatedOrganizationCapabilitiesMatrix.value = value;
  };
  const getCapabilities = async () => {
    const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}${url}`);
    organizationCapabilities.value = res.data.results;
  };
  const saveCapabilities = async (admin = false, organization) => {
    if (!updatedOrganizationCapabilitiesMatrix.value) return;

    const capabilitiesToAdd: any[] = [];
    const capabilitiesToRemove: any[] = [];

    organizationCapabilities.value.forEach((org_capability) => {
      if (
        updatedOrganizationCapabilitiesMatrix.value[org_capability.phase] &&
        updatedOrganizationCapabilitiesMatrix.value[org_capability.phase].has(
          org_capability.capability,
        )
      ) {
        updatedOrganizationCapabilitiesMatrix.value[
          org_capability.phase
        ].delete(org_capability.capability);
      } else {
        capabilitiesToRemove.push(org_capability);
      }
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const [phase, value] of Object.entries(
      updatedOrganizationCapabilitiesMatrix.value,
    )) {
      // eslint-disable-next-line no-restricted-syntax
      for (const capability of Array.from(value as any)) {
        capabilitiesToAdd.push({
          organization: organization.id,
          capability,
          phase,
        });
      }
    }

    if (capabilitiesToRemove.length) {
      try {
        await Promise.all(
          capabilitiesToRemove.map((item) =>
            axios.delete(
              `${process.env.VUE_APP_API_BASE_URL}/${
                admin ? 'admins/' : ''
              }organization_organizations_capabilities/${item.id}`,
            ),
          ),
        );
      } catch (error) {
        await window.vue.$toasted.error(getErrorMessage(error));
      }
    }

    if (capabilitiesToAdd.length) {
      try {
        await Promise.all(
          capabilitiesToAdd.map((item) =>
            axios.post(
              `${process.env.VUE_APP_API_BASE_URL}/${
                admin ? 'admins/' : ''
              }organization_organizations_capabilities`,
              item,
            ),
          ),
        );
      } catch (error) {
        await window.vue.$toasted.error(getErrorMessage(error));
      }
    }

    updatedOrganizationCapabilitiesMatrix.value = null;
  };

  return {
    organizationCapabilities,
    getCapabilities,
    updatedOrganizationCapabilitiesMatrix,
    setUpdatedOrganizationCapabilitiesMatrix,
    saveCapabilities,
  };
}
