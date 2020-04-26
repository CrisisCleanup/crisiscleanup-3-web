<template>
  <HomeLayout class="overflow-auto">
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <home-nav />
      <home-actions />
      <div class="grid--main h-screen">
        <!--- Title --->
        <div class="flex flex-col m-5">
          <h1
            class="text-4xl px-0.5 text-crisiscleanup-dark-500 font-bold pb-8"
          >
            ~~About Crisis Cleanup
          </h1>
          <!--- Description --->
          <p class="text-xl px-0.5 pb-5">
            Crisis Cleanup is not a technology. It's a philosophy.
          </p>
          <p class="text-xl px-o.5 pb-8">
            <span class="font-bold">Mission:</span>
            To help voluntary relief organizations help more more people by
            enabling collaborative disaster recovery.
          </p>
        </div>
        <!--- Content --->
        <!--- About Us Video --->
        <div class="video-container m-5">
          <iframe
            class="resp-video"
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/yCxI5YHyX5k"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
        </div>
        <!--- About Us Cards --->
        <div class="flex flex-col m-5 pt-10">
          <!-- Left Side Info Cards -->
          <div class="flex flex-row justify-between">
            <!-- Top Left Info Card -->
            <div class="flex-col">
              <div class="flex flex-row m-3 py-5">
                <img
                  src="@/assets/tinycrisiscleanuplogoscreenshot.jpg"
                  class="w-7 h-6"
                />
                <base-text variant="body" class="pt-2">
                  <span class="font-bold">Crisis Cleanup</span>
                  is a collaborative
                  <span class="font-bold">disaster work order</span>
                  management platform that improves coordination, reduces
                  duplication of efforts, imporves efficiency and improves
                  volunteers' experience.
                </base-text>
              </div>
              <!-- Bottom Left Info Card -->
              <div class="flex-col px-2">
                <div class="flex flex-row m-3 py-5">
                  <img
                    src="@/assets/tinycrisiscleanuplogoscreenshot.jpg"
                    class="w-7 h-6"
                  />
                  <base-text variant="body" class="pt-2">
                    <span class="font-bold">Crisis Cleanup</span>
                    helps with the
                    <span class="font-bold">4 "C"s of disaster recovery:</span>
                    Communication, Coordination, Collaboration, and Cooperation
                    (as well as the fifth silent "C" of Competition)
                  </base-text>
                </div>
              </div>
            </div>
            <!-- Right Side Info Cards -->
            <div class="flex-col px-2">
              <!-- Top Right Info Card -->
              <div class="flex flex-row m-3 py-5">
                <img
                  src="@/assets/tinycrisiscleanuplogoscreenshot.jpg"
                  class="w-7 h-6"
                />
                <base-text variant="body" class="pt-2">
                  <span class="font-bold">Crisis Cleaning</span>
                  works best when a large number of volunteer organizations with
                  many volunteers work together
                  <span class="font-bold">
                    to large numbers of people in a large area, all at the same
                    time
                  </span>
                </base-text>
              </div>
              <!-- Bottom Right Info Card -->
              <div class="flex flex-col py-5">
                <div class="flex flex-row m-3">
                  <img
                    src="@/assets/tinycrisiscleanuplogoscreenshot.jpg"
                    class="w-7 h-6"
                  />
                  <base-text variant="body" class="pt-2">
                    <span class="font-bold"
                      >Crisis Cleanup does not create the 4 "R"s of disaster
                      recovery:</span
                    >
                    Relationships, Resources, Roles, and Responsibilites. It
                    cannot fix relationships, create resources, or dictate who
                    does what.
                  </base-text>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Stats -->
        <div class="flex flex-row justify-around m-5">
          <div class="flex flex-col">
            <h1 class="text-3xl font-bold text-center">1700+</h1>
            <base-text
              weight="300"
              variant="body"
              class="crisiscleanup-grey-500"
              >Organizations</base-text
            >
          </div>
          <div class="flex flex-col">
            <h1 class="text-3xl font-bold text-center">80,905+</h1>
            <base-text
              weight="300"
              variant="body"
              class="crisiscleanup-grey-500"
              >Homes and Businesses <br />
              Cleaned and Recovered
            </base-text>
          </div>
          <div class="flex flex-col text-center">
            <h1 class="text-3xl font-bold">$46,929</h1>
            <base-text
              weight="300"
              variant="body"
              class="crisiscleanup-grey-500"
            >
              Saved for disaster <br />
              survivors each day
            </base-text>
          </div>
        </div>
        <!-- View Details Button -->
        <div class="flex justify-around py-2">
          <base-button variant="solid" class="py-2 px-3"
            >View Details</base-button
          >
        </div>
        <!-- Info Card w/ Sketch -->
        <div
          class="my-2 mx-3 bg-white shadow w-70 h-70 text-center align-middle flex-wrap"
        >
          <div class="flex flex-row">
            <div class="flex flex-col w-3/4 justify-around">
              <div class="m-5">
                <h1
                  class="text-center pt-50% px-5 py-5 text-2xl text-crisiscleanup-dark-400 font-hairline"
                >
                  Crisis Cleanup embraces and supports the interests of disaster
                  survivors by providing transparent, collaborative, and
                  privacy-enhancing open source technology to assist those who
                  directly interact with and help survivors.
                </h1>
              </div>
            </div>
            <div class="flex-col m-5 w-1/4">
              <img src="@/assets/aboutussketchss.jpg" class="h-1/2" />
            </div>
          </div>
        </div>

        <!-- The People of Crisis Cleanup -->
        <h1 class="text-4xl px-0.5 text-crisiscleanup-dark-500 font-bold py-8">
          The People of Crisis Cleanup
        </h1>

        <div class="images-grid">
          <!-- Headshots -->
          <div class="flex flex-col">
            <img src="@/assets/headshots/aarontitus.jpg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Aaron Titus</span><br />
              Executive Director
            </p>
            <base-text variant="body" class="pt-2"
              ><a href="https://twitter.com/aarontitus" target="_blank"
                >Aaron Titus</a
              >
              is a proud husband and father of nine children, the past president
              of Mountain West VOAD, the Latter-day Saint Charities
              representative to Colorado VOAD, a privacy attorney, and author of
              <em
                ><a href="http://h2prep.me/amazon"
                  >How to Prepare for Everything</a
                ></em
              >.
            </base-text>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col">
            <img src="@/assets/headshots/rossarroyo.jpeg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Ross Arroyo</span><br />
              Director of Operations
            </p>
            <base-text variant="body" class="pt-2"
              ><a
                href="https://www.linkedin.com/in/ross-arroyo-363b224"
                target="_blank"
                >Ross Arroyo</a
              >
              has built several technology ventures. He is always creating,
              building, inventing, and solving problems. It's what he does for
              fun. The more complex and challenging the better. In today's world
              of abundance, you really can do anything you want. You just have
              to be willing to work hard, be creative, add a dash of technology,
              and go for it!
            </base-text>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col">
            <img src="@/assets/headshots/tobiabiodun.jpg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Tobi Abiodun</span><br />
              Lead Developer, v.3
            </p>
            <base-text variant="body" class="pt-2"
              ><a
                href="https://www.toptal.com/resume/tobi-abiodun"
                target="_blank"
                >Tobi Abiodun</a
              >
              is a senior software developer with 7+ years of developing complex
              web applications on both the front-end and back-end. His
              specialties are front-end JavaScript development, online payment
              integrations, REST API design, and software architecture.
            </base-text>
          </div>

          <div class="flex flex-col">
            <img src="@/assets/headshots/olgauzhykova.jpg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Olga Uzhykova</span><br />
              Lead Designer, v.3
            </p>
            <base-text variant="body" class="pt-2"
              ><a href="https://dribbble.com/uzhik13" target="_blank"
                >Olga Uzhykova</a
              >
              is CEO of the design firm
              <a href="https://www.netrixdigital.com/">Netrix</a> in Ukraine and
              lead designer of Crisis Cleanup v.3. Winner of "Ukrainian Design:
              The Very Best Of," Olga is passionate about all things in UX/UI
              and other areas of technology and innovation. Olga seamlessly
              integrates data, use cases to find innovative design solutions to
              complex problems. And for the record, this is not a stock photo.
            </base-text>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col">
            <img src="@/assets/headshots/mariiafilatova.jpg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Mariia Filatova</span><br />
              Designer, v.3
            </p>
            <base-text variant="body" class="pt-2"
              ><a href="https://dribbble.com/filatovamariia" target="_blank"
                >Mariia Filatova</a
              >
              is a UI/UX designer for Netrix, and is a primary designer of
              Crisis Cleanup v.3. And for the record, this is not a stock photo.
            </base-text>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col">
            <img src="@/assets/headshots/bradenmars.jpg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Braden Mars</span><br />
              Developer, v.3
            </p>
            <base-text variant="body" class="pt-2"
              ><a href="https://github.com/BradenM?tab=overview" target="_blank"
                >Braden Mars</a
              >
              is a talented developer living in Mississippi, and specializing in
              just about anything we throw at him. He believes that sleep is for
              the weak.
            </base-text>
          </div>

          <!-- StartCard -->
          <div class="flex flex-col">
            <img src="@/assets/headshots/tylersanders.png" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Tyler Sanders</span><br />
              Engineering Advisor, v.3
            </p>
            <base-text variant="body" class="pt-2"
              ><a href="https://www.linkedin.com/in/tylersanders1"
                >Tyler Sanders</a
              >
              is an experienced DevOps Engineering Lead with expertise in
              Kubernetes, OpenShift, Docker, Jenkins CI, Ansible, Amazon Web
              Services (AWS), ECS, Kustomize, Skaffold, Packer, Terraform,
              Google Cloud Platform (GCP), Bash, Gradle, Git. He also develops
              in Java, Python, JavaScript, Vue.js, Spring, Django, Rails, HTML,
              CSS, Selenium, Nginx, Tomcat, and PostgreSQL
            </base-text>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col">
            <img src="@/assets/headshots/marktregellas.jpg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Mark Tregellas</span><br />
              Crisis Cleanup Australia
            </p>
            <base-text variant="body" class="pt-2"
              ><a
                href="http://au.linkedin.com/pub/mark-tregellas/50/ba8/263"
                target="_blank"
                >Mark Tregellas</a
              >
              is a husband and father of 3 children. He is a retired police
              officer, and also as the President of the Returned and Services
              League of Australia, Mallacoota Sub-Branch. Mark has a passion for
              Community Based Disaster Recovery and has launched platforms
              including
              <a href="https://mallacootaau.recovers.org/" target="_blank"
                >Mallacoota Recovers</a
              >
              and
              <a href="http://www.dove.org.au/" target="_blank">DOVE</a>.
            </base-text>
          </div>
          <!-- End Card -->
        </div>

        <!-- Major Contributors -->
        <h1 class="text-4xl px-0.5 text-crisiscleanup-dark-500 font-bold py-8">
          Major Contributors
        </h1>

        <div class="images-grid">
          <!-- StartCard -->
          <div class="flex flex-col">
            <img src="@/assets/headshots/andygimma.jpg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Andy Gimma</span><br />
              Developer, v.1-2
            </p>
            <base-text variant="body" class="pt-2"
              ><a href="https://twitter.com/AndyGimma" target="_blank"
                >Andy Gimma</a
              >
              is an Android, Python, Google App Engine, Ruby, open source and
              open data programmer, with an emphasis is in non-hierarchical
              organizing structures. He likes Russian literature, Kenzaburo Oe,
              and avoiding the beaten path.
            </base-text>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col">
            <img src="@/assets/headshots/zacharystraub.jpg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Zachary Straub</span><br />
              Designer, v.2
            </p>
            <base-text variant="body" class="pt-2"
              ><a
                href="https://www.linkedin.com/in/zacharystraub"
                target="_blank"
                >Zachary Straub</a
              >
              specializes in web design, UI/UX, branding, and SEO. His passions
              include aiding in community development projects and facilitating
              creativity to others. Zachary currently runs a locally-owned
              microbusines,
              <a href="http://straubcreative.nationbuilder.com" target="_blank"
                >Straub Creative Company</a
              >
              out of San Francisco, California.
            </base-text>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col">
            <img src="@/assets/headshots/dhruvmehrotra.jpg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Dhruv Mehrotra</span><br />
              Designer, v.2
            </p>
            <base-text variant="body" class="pt-2"
              ><a href="https://twitter.com/dmehro" target="_blank"
                >Dhruv Mehrotra</a
              >
              is an NYU graduate and has been doing web development since
              college. In his spare time he has been building interactive tools
              for disaster relief, as well as pursuing personal artistic
              endeavors. Dhruv's specialties include Javascript, Node, Ruby,
              Rails, CSS3, HTML5.
            </base-text>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col">
            <img src="@/assets/headshots/chriswood.jpg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Chris Wood</span><br />
              Developer, v.2
            </p>
            <base-text variant="body" class="pt-2">
              <a href="https://twitter.com/cpwood" style="color: #ffcc44;"
                >Chris Wood</a
              >
              is a freelance software developer and startup-ponderer based in
              London. Though his modesty would never allow him to admit it,
              Chris is an incredibly proficient Python programmer. Chris was a
              major contributor to the project through 2015, and recently
              recently returned to the project during some down time.
            </base-text>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col">
            <img src="@/assets/headshots/karissaphelps.jpg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Karissa Phelps</span><br />
              Designer, v.2
            </p>
            <base-text variant="body" class="pt-2"
              ><a
                href="https://www.linkedin.com/pub/karissa-phelps/44/563/73a"
                target="_blank"
                >Karissa Phelps</a
              >
              is a graphic designer who developed Crisis Cleanup's map pins in
              Version 2.
            </base-text>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col">
            <img src="@/assets/headshots/jeremypack.jpg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Jeremy Pack</span><br />
              Developer, v.1
            </p>
            <base-text variant="body" class="pt-2"
              ><a
                href="https://plus.google.com/100981388284358828816/about"
                target="_blank"
                >Jeremy Pack</a
              >
              is a mathematician and software engineer on the Google Street View
              project. He lives with his wife and four children in Mountain
              View, California. Jeremy was the primary developer of the first
              major deployment of Crisis Cleanup (Hurricane Sandy).
            </base-text>
          </div>
          <!-- End Card -->

          <div class="flex flex-col">
            <img src="@/assets/headshots/brucechristensen.jpg" class="m-5" />
            <p class="text-3xl px-0.5 pb-5">
              <span class="font-bold">Bruce Christensen</span><br />
              Developer, v.1
            </p>
            <base-text variant="body" class="pt-2"
              ><a
                href="https://plus.google.com/+BruceChristensen/about"
                target="_blank"
                >Bruce Christensen</a
              >
              is a software engineer on the Google search team. He lives with
              his family in Mountain View, California. Bruce was a major
              developer of the first major deployment of Crisis Cleanup
              (Hurricane Sandy).
            </base-text>
          </div>

          <!-- Major Contributors -->
        </div>
        <h1 class="text-4xl px-0.5 text-crisiscleanup-dark-500 font-bold py-8">
          Major Supporters
        </h1>
        <base-text variant="body" class="pt-2"
          >We recognize Crisis Cleanup's financial and in-kind supporters with
          gratitude. Support does not necessarily imply endorsement. They
          include:</base-text
        >

        <!-- Logos -->
        <div class="partners-grid">
          <!-- StartCard -->
          <div class="flex flex-col items-center justify-start">
            <img
              src="@/assets/partners/aws_logo.png"
              class="m-5"
              style="width: 12rem; height: 8rem;"
            />
            <p class="text-xl text-center px-0.5 pb-5">
              <span class="font-bold"
                ><a href="https://aws.amazon.com/" target="_blank"
                  >Amazon Web Services</a
                ></span
              >
            </p>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col items-center justify-start">
            <img src="@/assets/partners/arc_logo.jpg" class="m-5" />
            <p class="text-xl text-center px-0.5 pb-5">
              <span class="font-bold"
                ><a href="http://www.redcross.org/" target="_blank"
                  >The American Red Cross</a
                ></span
              >
            </p>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col items-center justify-start">
            <img src="@/assets/partners/houston_logo.png" class="m-5" />
            <p class="text-xl text-center px-0.5 pb-5">
              <span class="font-bold"
                ><a href="http://www.houstontx.gov/housing/" target="_blank"
                  >The City of Houston</a
                ></span
              >
            </p>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col items-center justify-start">
            <img src="@/assets/partners/ldscharities_logo.jpg" class="m-5" />
            <p class="text-xl text-center px-0.5 pb-5">
              <span class="font-bold"
                ><a
                  href="https://www.latterdaysaintcharities.org/"
                  target="_blank"
                  >Latter-day Saint Charities</a
                ></span
              >
            </p>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col items-center justify-start">
            <img src="@/assets/partners/visionlink_logo.jpg" class="m-5" />
            <p class="text-xl text-center px-0.5 pb-5">
              <span class="font-bold"
                ><a href="http://visionlink.org/" target="_blank"
                  >VisionLink</a
                ></span
              >
            </p>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col items-center justify-start">
            <img src="@/assets/partners/connectfirst_logo.png" class="m-5" />
            <p class="text-xl text-center px-0.5 pb-5">
              <span class="font-bold"
                ><a href="http://www.connectfirst.com/" target="_blank"
                  >Connect First</a
                ></span
              >
            </p>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col items-center justify-start">
            <img src="@/assets/partners/umcor_logo.jpg" class="m-5" />
            <p class="text-xl text-center px-0.5 pb-5">
              <span class="font-bold"
                ><a href="https://www.umcor.org/" target="_blank"
                  >UMCOR</a
                ></span
              >
            </p>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col items-center justify-start">
            <img
              src="@/assets/partners/volunteer_florida_logo.jpg"
              class="m-5"
            />
            <p class="text-xl text-center px-0.5 pb-5">
              <span class="font-bold"
                ><a href="https://www.volunteerflorida.org/" target="_blank"
                  >Volunteer Florida</a
                ></span
              >
            </p>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col items-center justify-start">
            <img src="@/assets/partners/h2prep_logo.jpg" class="m-5" />
            <p class="text-xl text-center px-0.5 pb-5">
              <span class="font-bold"
                ><a
                  href="https://www.amazon.com/How-Prepare-Everything-Aaron-Titus/dp/1525505947/"
                  target="_blank"
                  >How to Prepare for Everything</a
                ></span
              >
            </p>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col items-center justify-start">
            <img src="@/assets/partners/nj211_logo.jpg" class="m-5" />
            <p class="text-xl text-center px-0.5 pb-5">
              <span class="font-bold"
                ><a href="http://www.nj211.org/" target="_blank"
                  >NJ 2-1-1</a
                ></span
              >
            </p>
          </div>
          <!-- End Card -->

          <!-- StartCard -->
          <div class="flex flex-col items-center justify-start">
            <img src="@/assets/partners/thinkso_logo.png" class="m-5" />
            <p class="text-xl text-center px-0.5 pb-5">
              <span class="font-bold"
                ><a href="https://thinkso.com/" target="_blank"
                  >ThinkSo</a
                ></span
              >
            </p>
          </div>
          <!-- End Card -->
        </div>

        Legal stuff: project of CCU, LLC **************

        <!-- Foundational Philosophies -->
        <h1 class="text-4xl px-0.5 text-crisiscleanup-dark-500 font-bold py-8">
          Foundational Philosophies
        </h1>
        <div class="flex flex-row">
          <div class="flex flex-col">
            <img src="@/assets/foundationalphilosophiessketchss.jpg" />
          </div>
          <div class="flex flex-col m-5">
            <ul class="text-xl text-crisiscleanup-dark-400 font-hairline">
              <li>
                Technology should enhance, not replace, inter-organization
                relationships.
              </li>
              <br />
              <li>
                There is no pyramid, and you're not on top. Voluntary
                organizations are co-equal, sovereign and interdependent; no
                single organization is in charge.
              </li>
              <br />
              <li>
                Collaboration and communication should be not only convenient,
                but required
              </li>
              <br />
              <li>
                There is no such thing as the "One App to Rule them All." The
                system should not try to do things it was not intended to do.
              </li>
              <br />
              <li>
                The system tracks property, not people. Consequently, strict
                personal information minimization policies are in place.
              </li>
            </ul>
          </div>
        </div>
        <!-- Info Card w/ Sketch pt2 -->
        <div
          class="my-2 mx-3 bg-white shadow w-70 h-70 content-center flex-wrap align-middle pt-15"
        >
          <div class="flex flex-row justify-around">
            <div class="flex-col w-1/4">
              <img src="@/assets/supportteamsketchss.jpg" class="m-5" />
            </div>
            <div class="flex-col w-3/4 m-7">
              <h1
                class="m-5 px-5 py-5 text-center text-2xl text-crisiscleanup-dark-400 font-hairline"
              >
                Crisis Cleanup's real innovation is the ability to coordinate
                tens of thousands of volunteers from hundreds of organizations
                to thousands of sites after a disaster in a non-heirarchial
                collaborative environment.
              </h1>
            </div>
          </div>
        </div>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout, { HomeNav, HomeActions } from '@/layouts/Home';

export default {
  name: 'AboutPage',
  components: {
    HomeLayout,
    HomeNav,
    HomeActions,
  },
};
</script>

<style scoped>
.resp-video {
  position: absolute;
  top: 0;
  left: 0;
  border: 0;
}
.video-container {
  position: relative;
  overflow: hidden;
  padding-top: 56.25%;
  justify-content: right;
}
li::before {
  content: '\2022';
  color: #fece09;
}
.images-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 5px;
}

.images-grid img {
  width: 20rem;
  height: 20rem;
}

.partners-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 15px;
}

.partners-grid img {
  width: 8rem;
  height: 8rem;
}
</style>
