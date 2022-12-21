import axios from 'axios';
import { useToast } from 'vue-toastification';
import { getErrorMessage } from '../utils/errors';

async function saveCapabilities(
  updatedOrganizationCapabilitiesMatrix,
  organizationCapabilities,
  organization,
  admin = false,
) {
  const $toasted = useToast();

  if (!updatedOrganizationCapabilitiesMatrix) return;

  const capabilitiesToAdd = [];
  const capabilitiesToRemove = [];

  for (const org_capability of organizationCapabilities) {
    if (
      updatedOrganizationCapabilitiesMatrix[org_capability.phase] &&
      updatedOrganizationCapabilitiesMatrix[org_capability.phase].has(
        org_capability.capability,
      )
    ) {
      updatedOrganizationCapabilitiesMatrix[org_capability.phase].delete(
        org_capability.capability,
      );
    } else {
      capabilitiesToRemove.push(org_capability);
    }
  }

  for (const [phase, value] of Object.entries(
    updatedOrganizationCapabilitiesMatrix,
  )) {
    for (const capability of value) {
      capabilitiesToAdd.push({
        organization: organization.id,
        capability,
        phase,
      });
    }
  }

  if (capabilitiesToRemove.length > 0) {
    try {
      await Promise.all(
        capabilitiesToRemove.map((item) =>
          axios.delete(
            `${import.meta.env.VITE_APP_API_BASE_URL}/${
              admin ? 'admins/' : ''
            }organization_organizations_capabilities/${item.id}`,
          ),
        ),
      );
    } catch (error) {
      await $toasted.error(getErrorMessage(error));
    }
  }

  if (capabilitiesToAdd.length > 0) {
    try {
      await Promise.all(
        capabilitiesToAdd.map((item) =>
          axios.post(
            `${import.meta.env.VITE_APP_API_BASE_URL}/${
              admin ? 'admins/' : ''
            }organization_organizations_capabilities`,
            item,
          ),
        ),
      );
    } catch (error) {
      await $toasted.error(getErrorMessage(error));
    }
  }

  updatedOrganizationCapabilitiesMatrix = null;
}

export default function useCapabilities() {
  return { saveCapabilities };
}
