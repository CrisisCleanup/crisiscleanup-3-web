<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid--backdrop" />
    </template>
    <template #grid-content>
      <home-nav />
      <home-actions />
      <div class="grid--main">
        <base-text variant="h6" class="text-4xl" v-html="contrib.title" />
        <div class="row mb-6">
          <base-text variant="h3">{{ $t('contrib.subtitle1') }}</base-text>
          <base-text v-html="contrib.subtitle1_intro" />
        </div>
      </div>
    </template>
  </HomeLayout>
</template>

<base-link href="/somefile.pdf">this file</base-link>

ASF Contributor Agreements

The Apache Software Foundation uses various agreements to accept regular contributions from individuals and corporations, and to accept larger grants of existing software products.

These agreements help us achieve our goal of providing reliable and long-lived software products through collaborative open source software development. In all cases, contributors retain full rights to use their original contributions for any other purpose outside of Apache while providing the ASF and its projects the right to distribute and build upon their work within Apache.
Contributor License Agreements

    ICLA: Individual Contributor License Agreement
    CCLA: Corporate Contributor License Agreement

The ASF desires that all contributors of ideas, code, or documentation to any Apache projects complete, sign, and submit via email an Individual Contributor License Agreement (ICLA).

The purpose of this agreement is to clearly define the terms under which intellectual property has been contributed to the ASF and thereby allow us to defend the project should there be a legal dispute regarding the software at some future time. A signed ICLA is required to be on file before an individual is given commit rights to any ASF project.

For a corporation that has assigned employees to work on an Apache project, a Corporate CLA (CCLA) is available for contributing intellectual property via the corporation, that may have been assigned as part of an employment agreement.

Note that a Corporate CLA does not remove the need for every developer to sign their own ICLA as an individual, which covers both contributions which are owned and those that are not owned by the corporation signing the CCLA.

The CCLA legally binds the corporation, so it must be signed by a person with authority to enter into legal contracts on behalf of the corporation.

The ICLA is not tied to any employer you may have, so it is recommended to use one's personal email address in the contact details, rather than an @work address.

Your Full name will be published unless you provide an alternative Public name. For example if your full name is Andrew Bernard Charles Dickens, but you wish to be known as Andrew Dickens, please enter the latter as your Public name. Your Full name should be written with your given name first and your family name last, though your preferred ordering can be used in the Public name.

The email address and other contact details are not published.

If you are submitting an ICLA in response to an invitation from a PMC, be sure to identify the project via the form field "notify project". Also, choose a preferred id that is not already in use. Apache ids must start with an alphabetic character and contain at least two additional alphanumeric characters (no special characters). You can check for ids in use here.
Software License Grant

    Software License Grant: Software Grant Agreement

When an individual or corporation decides to donate a body of existing software or documentation to one of the Apache projects, they need to execute a formal Software Grant Agreement (SGA) with the ASF. Typically, this is done after negotiating approval with the ASF Incubator or one of the PMCs, since the ASF will not accept software unless there is a viable community available to support a collaborative project.
How-To: Submitting License Agreements and Grants

Documents may be submitted by email and signed by hand or by electronic signature. Postal mail hard copy and fax are no longer supported.

When submitting by email, please fill the form with a pdf viewer, then print, sign, scan all pages into a single pdf file, and attach the pdf file to an email to secretary@apache.org.

If possible, send the attachment from the email address in the document. Please send only one document per email.

If you prefer to sign electronically, please fill the form, save it locally (e.g. icla.pdf), and sign the file by preparing a detached PGP signature. For example,

    gpg --armor --detach-sign icla.pdf

The above will create a file icla.pdf.asc. Send both the file (icla.pdf) and signature (icla.pdf.asc) as attachments in the same email to secretary@apache.org. Please send only one document (file plus signature) per email. Please do not submit your public key to Apache. Instead, please upload your public key to pool.sks-keyservers.net. For more information, see SKS Keyservers.

The files should be named icla.pdf and icla.pdf.asc for individual agreements; ccla.pdf and ccla.pdf.asc for corporate agreements; software-grant.pdf and software-grant.pdf.asc for grants.

We do not accept Zip files or other archives. We do not accept links to files; the files must be attached to the mail.

Please note that typing your name in the field at the bottom of the document is not signing, regardless of the font that is used. Signing is one of writing your signature by hand on a printed copy of the document, digitally signing the document by hand drawing a signature, signing the document digitally via gpg, or signing the document via DocuSign. Unsigned documents will not be accepted.

From wikipedia.org: A signature is a handwritten (and often stylized) depiction of someone's name or nickname, on documents as a proof of identity and intent.
Questions?

For answers to frequently asked contribution agreement questions, please consult our CLA Frequently Asked Questions page.
<script>
import HomeLayout, { HomeNav, HomeActions } from '@/layouts/Home';

export default {
  name: 'Contributions',
  components: { HomeLayout, HomeNav, HomeActions },
  computed: {
    contrib() {
      return {
        title: this.$t('~~Example Title'),
        subtitle1_intro: this.$t('Example Subtitle1 Intro'),
      };
    },
  },
};
</script>

<style scoped>
@import '../../assets/css/_terms-privacy.scss';

.homegrid {
  &.grid-container {
    grid-template-areas:
      'logo . . . . survivors'
      'nav . main main main .'
      'nav . main main main .'
      'actions actions main main main .'
      '. . main main main .';
    overflow: auto;

    .grid {
      &--overlay {
        grid-row: 1 / span 5;
        grid-column: 1 / span 3;
      }
    }
  }
}
</style>
