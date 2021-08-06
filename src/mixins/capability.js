import { getErrorMessage } from '@/utils/errors';

export default {
  data() {
    return {
      organizationCapabilities: [],
      updatedOrganizationCapabilitiesMatrix: null,
    };
  },
  methods: {
    async saveCapabilities(admin = false) {
      if (!this.updatedOrganizationCapabilitiesMatrix) return;

      const capabilitiesToAdd = [];
      const capabilitiesToRemove = [];

      this.organizationCapabilities.forEach((org_capability) => {
        if (
          this.updatedOrganizationCapabilitiesMatrix[org_capability.phase] &&
          this.updatedOrganizationCapabilitiesMatrix[org_capability.phase].has(
            org_capability.capability,
          )
        ) {
          this.updatedOrganizationCapabilitiesMatrix[
            org_capability.phase
          ].delete(org_capability.capability);
        } else {
          capabilitiesToRemove.push(org_capability);
        }
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const [phase, value] of Object.entries(
        this.updatedOrganizationCapabilitiesMatrix,
      )) {
        // eslint-disable-next-line no-restricted-syntax
        for (const capability of Array.from(value)) {
          capabilitiesToAdd.push({
            organization: this.organization.id,
            capability,
            phase,
          });
        }
      }

      if (capabilitiesToRemove.length) {
        try {
          await Promise.all(
            capabilitiesToRemove.map((item) =>
              this.$http.delete(
                `${process.env.VUE_APP_API_BASE_URL}/${
                  admin ? 'admins/' : ''
                }organization_organizations_capabilities/${item.id}`,
              ),
            ),
          );
        } catch (error) {
          await this.$toasted.error(getErrorMessage(error));
        }
      }

      if (capabilitiesToAdd.length) {
        try {
          await Promise.all(
            capabilitiesToAdd.map((item) =>
              this.$http.post(
                `${process.env.VUE_APP_API_BASE_URL}/${
                  admin ? 'admins/' : ''
                }organization_organizations_capabilities`,
                item,
              ),
            ),
          );
        } catch (error) {
          await this.$toasted.error(getErrorMessage(error));
        }
      }

      this.updatedOrganizationCapabilitiesMatrix = null;
    },
  },
};
