<template>
  <Home class="overflow-auto">
    <div class="grid--main h-screen" data-testid="testAboutDiv">
      <!--- Title --->
      <div class="flex flex-col m-5" data-testid="testAboutDescriptionDiv">
        <h1 class="text-4xl px-0.5 text-crisiscleanup-dark-500 font-bold pb-8">
          {{ $t('about.about_header') }}
        </h1>
        <!--- Description --->
        <p class="text-xl px-0.5 pb-5">
          {{ $t('about.philosophy_not_tech') }}
        </p>
        <p class="text-xl px-0.5 pb-5" v-html="$t('about.mission')"></p>
      </div>
      <!--- Content --->
      <!--- About Us Video --->
      <div class="video-container m-5" data-testid="testAboutVideoDiv">
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
                {{ $t('about.ccu_benefits') }}
              </base-text>
            </div>
            <!-- Bottom Left Info Card -->
            <div class="flex-col px-2">
              <div class="flex flex-row m-3 py-5">
                <img
                  src="@/assets/tinycrisiscleanuplogoscreenshot.jpg"
                  class="w-7 h-6"
                />
                <base-text
                  variant="body"
                  class="pt-2"
                  v-html="$t('about.four_cs')"
                >
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
                {{ $t('about.ccu_works_best_when') }}
              </base-text>
            </div>
            <!-- Bottom Right Info Card -->
            <div class="flex flex-col py-5">
              <div class="flex flex-row m-3">
                <img
                  src="@/assets/tinycrisiscleanuplogoscreenshot.jpg"
                  class="w-7 h-6"
                />
                <base-text
                  variant="body"
                  class="pt-2"
                  v-html="$t('about.four_rs')"
                >
                </base-text>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Stats -->
      <div class="flex flex-row justify-around m-5" data-testid="testAboutStatsDiv">
        <div class="flex flex-col">
          <h1 class="text-3xl font-bold text-center">2,500+</h1>
          <base-text weight="300" variant="body" class="crisiscleanup-grey-500"
            >{{ $t('about.organizations') }}
          </base-text>
        </div>
        <div class="flex flex-col">
          <h1 class="text-3xl font-bold text-center">80,905+</h1>
          <base-text
            weight="300"
            variant="body"
            class="crisiscleanup-grey-500"
            v-html="$t('about.homes_businesses_cleaned_up')"
          >
          </base-text>
        </div>
        <div class="flex flex-col text-center">
          <h1 class="text-3xl font-bold">$46,929</h1>
          <base-text
            weight="300"
            variant="body"
            class="crisiscleanup-grey-500"
            v-html="$t('about.dollars_saved_survivors_daily')"
          >
          </base-text>
        </div>
      </div>
      <!-- View Details Button -->
      <div class="flex justify-around py-2">
        <base-button variant="solid" class="py-2 px-3"
          >{{ $t('about.view_details') }}
        </base-button>
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
                {{ $t('about.transparent_collaborative_privacy') }}
              </h1>
            </div>
          </div>
          <div class="flex-col m-5 w-1/4">
            <img src="@/assets/aboutussketchss.jpg" class="h-1/2" />
          </div>
        </div>
      </div>

      <!-- The People of Crisis Cleanup -->
      <h1
        class="text-4xl px-5 sm:px-0.5 text-crisiscleanup-dark-500 font-bold py-8"
      >
        {{ $t('about.people_of_ccu') }}
      </h1>

      <div class="images-grid sm:grid-cols-3" data-testid="testAboutPeopleDiv">
        <!-- Headshots -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/aarontitus.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Aaron Titus</span><br />
            {{ $t('about.aaron_titus_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.aaron_titus_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/rossarroyo.jpeg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Ross Arroyo</span><br />
            {{ $t('about.ross_arroyo_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.ross_arroyo_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/tobiabiodun.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Tobi Abiodun</span><br />
            {{ $t('about.tobi_abiodun_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.tobi_abiodun_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/ginanewby.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Gina Newby</span><br />
            {{ $t('about.gina_newby_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.gina_newby_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/bradenmars.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Braden Mars</span><br />
            {{ $t('about.braden_mars_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.braden_mars_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/deeppanchal.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Deep Panchal</span><br />
            {{ $t('about.deep_panchal_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.deep_panchal_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/dankaupilla.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Dan Kaupilla</span><br />
            {{ $t('about.dan_kaupilla_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.dan_kaupilla_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/quivan.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Qui Van</span><br />
            {{ $t('about.qui_van_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.qui_van_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/zacstout.jpeg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Zac Stout</span><br />
            {{ $t('about.zac_stout_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.zac_stout_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/marktregellas.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Mark Tregellas</span><br />
            {{ $t('about.mark_tregellas_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.mark_tregellas_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->
      </div>

      <!-- Major Contributors -->
      <h1 class="text-4xl px-0.5 text-crisiscleanup-dark-500 font-bold py-8">
        Major Contributors
      </h1>

      <div class="images-grid sm:grid-cols-3" data-testid="testAboutMajorContributorsDiv">
        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/andygimma.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Andy Gimma</span><br />
            {{ $t('about.andy_gimma_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.andy_gimma_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/olgauzhykova.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Olga Uzhykova</span><br />
            {{ $t('about.olga_uzhykova_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.olga_uzhykova_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/mariiafilatova.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Mariia Filatova</span><br />
            {{ $t('about.mariia_filatova_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.mariia_filatova_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/zacharystraub.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Zachary Straub</span><br />
            {{ $t('about.zachary_straub_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.zachary_straub_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/tylersanders.png" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Tyler Sanders</span><br />
            {{ $t('about.tyler_sanders_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.tyler_sanders_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/dhruvmehrotra.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Dhruv Mehrotra</span><br />
            {{ $t('about.dhruv_mehrotra_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.dhruv_mehrotra_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/chriswood.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Chris Wood</span><br />
            {{ $t('about.chris_wood_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.chris_wood_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/karissaphelps.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Karissa Phelps</span><br />
            {{ $t('about.karissa_phelps_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.karissa_phelps_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/jeremypack.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Jeremy Pack</span><br />
            {{ $t('about.jeremy_pack_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.jeremy_pack_bio')"
          >
          </base-text>
        </div>
        <!-- End Card -->

        <div class="flex flex-col items-center px-5 sm:px-0">
          <img src="@/assets/headshots/brucechristensen.jpg" class="m-5" />
          <p class="text-3xl px-0.5 pb-5">
            <span class="font-bold">Bruce Christensen</span><br />
            {{ $t('about.bruce_christensen_title') }}
          </p>
          <base-text
            variant="body"
            class="pt-2"
            v-html="$t('about.bruce_christensen_bio')"
          >
          </base-text>
        </div>

        <!-- End Major Contributors -->
      </div>

      <!-- Major Supporters -->
      <h1 class="text-4xl px-0.5 text-crisiscleanup-dark-500 font-bold py-8">
        {{ $t('about.major_supporters') }}
      </h1>
      <base-text variant="body" class="pt-2"
        >{{ $t('about.in_kind_supporter_intro') }}
      </base-text>

      <!-- Logos -->
      <div class="partners-grid sm:grid-cols-6" data-testid="testAboutSupporterLogosDiv">
        <!-- StartCard -->
        <div class="flex flex-col items-center justify-start">
          <img src="@/assets/partners/fdem_logo.jpg" class="m-5" />
          <p class="text-xl text-center px-0.5 pb-5">
            <span class="font-bold"
              ><a href="https://www.facebook.com/FLSERT/" target="_blank"
                >Florida Division of Emergency Management</a
              ></span
            >
          </p>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center justify-start">
          <img
            src="@/assets/partners/aws_logo.png"
            class="m-5"
            style="width: 12rem; height: 8rem"
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
          <img
            src="@/assets/partners/church_of_jesus_christ_logo.jpg"
            class="m-5"
          />
          <p class="text-xl text-center px-0.5 pb-5">
            <span class="font-bold"
              ><a
                href="https://www.churchofjesuschrist.org/serve/caring-for-those-in-need?lang=eng&cid=rdb_v_caring"
                target="_blank"
                >The Church of Jesus Christ of Latter-day Saints</a
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
          <img src="@/assets/partners/umcor_logo.jpg" class="m-5" />
          <p class="text-xl text-center px-0.5 pb-5">
            <span class="font-bold"
              ><a href="https://www.umcor.org/" target="_blank">UMCOR</a></span
            >
          </p>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center justify-start">
          <img src="@/assets/partners/volunteer_florida_logo.jpg" class="m-5" />
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
              ><a href="https://thinkso.com/" target="_blank">ThinkSo</a></span
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
          <img src="@/assets/partners/nj_voad_logo.jpg" class="m-5" />
          <p class="text-xl text-center px-0.5 pb-5">
            <span class="font-bold"
              ><a href="https://www.njvoad.org/" target="_blank"
                >NJVOAD</a
              ></span
            >
          </p>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center justify-start">
          <img src="@/assets/partners/sdema_logo.png" class="m-5" />
          <p class="text-xl text-center px-0.5 pb-5">
            <span class="font-bold"
              ><a href="https://sdema.wildapricot.org/" target="_blank"
                >SDEMA</a
              ></span
            >
          </p>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center justify-start">
          <img src="@/assets/partners/hono_logo.png" class="m-5" />
          <p class="text-xl text-center px-0.5 pb-5">
            <span class="font-bold"
              ><a href="https://www.handsonneworleans.org/" target="_blank"
                >HandsOn New Orleans</a
              ></span
            >
          </p>
        </div>
        <!-- End Card -->

        <!-- StartCard -->
        <div class="flex flex-col items-center justify-start">
          <img src="@/assets/partners/nc_volunteerism_logo.png" class="m-5" />
          <p class="text-xl text-center px-0.5 pb-5">
            <span class="font-bold"
              ><a
                href="https://www.nc.gov/working/volunteer-opportunities/volunteernc"
                target="_blank"
                >NC Commission on Volunteerism and Community Service</a
              ></span
            >
          </p>
        </div>
        <!-- End Card -->
      </div>
      <!-- Foundational Philosophies -->
      <h1 class="text-4xl px-0.5 text-crisiscleanup-dark-500 font-bold py-8">
        {{ $t('about.foundational_philosophies') }}
      </h1>
      <div class="flex flex-row" data-testid="testAboutPhilosophiesDiv">
        <div class="flex flex-col">
          <img src="@/assets/foundationalphilosophiessketchss.jpg" />
        </div>
        <div class="flex flex-col m-5">
          <ul class="text-xl text-crisiscleanup-dark-400 font-hairline">
            <li>
              {{ $t('about.right_way_get_it_done') }}
            </li>
            <li>
              {{ $t('about.tech_enhance_relationships') }}
            </li>
            <br />
            <li>
              {{ $t('about.no_pyramid') }}
            </li>
            <br />
            <li>
              {{ $t('about.collab_comm_convenient_required') }}
            </li>
            <br />
            <li>
              {{ $t('about.one_app_rule_all') }}
            </li>
            <br />
            <li>
              {{ $t('about.property_not_people') }}
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
              {{ $t('about.innovation_is_coordination') }}
            </h1>
          </div>
        </div>
      </div>
      <!-- End Foundational Philosophies -->
      <!-- Corporate and Legal Stuff -->
      <h1
        class="text-4xl px-5 sm:px-0.5 text-crisiscleanup-dark-500 font-bold py-8"
      >
        {{ $t('about.corporate_legal_stuff') }}
      </h1>

      <div>
        <p
          class="text-xl px-5 sm:px-0.5 pb-5"
          v-html="$t('about.ccu_llc_open_source')"
        ></p>
      </div>
      <!-- End Corporate and Legal Stuff -->

      <!-- Helpful Links -->
      <h1
        class="text-4xl px-5 sm:px-0.5 text-crisiscleanup-dark-500 font-bold py-8"
      >
        {{ $t('about.helpful_links') }}
      </h1>
      <div class="flex flex-row pb-20 sm:pb-0" data-testid="testAboutLegalStuffDiv">
        <div class="flex flex-col m-5">
          <ul class="text-xl text-crisiscleanup-dark-400 font-hairline about">
            <li>
              <a
                href="https://app.dev.crisiscleanup.io/"
                target="_blank"
                :title="$t('about.ccu_demo')"
                >{{ $t('about.ccu_demo') }}</a
              >
            </li>
            <br />
            <li>
              <a
                href="/training"
                target="_blank"
                :title="$t('about.mandatory_training')"
                >{{ $t('about.mandatory_training') }}</a
              >
            </li>
            <br />
            <li>
              <a
                href="https://crisiscleanup.zendesk.com/hc/en-us/articles/200603007"
                target="_blank"
                :title="$t('about.req_for_participation')"
                >{{ $t('about.req_for_participation') }}</a
              >
            </li>
            <br />
            <li>
              <a
                href="https://crisiscleanup.zendesk.com/hc/en-us/articles/200596493-Is-Crisis-Cleanup-a-Good-Fit-"
                target="_blank"
                :title="$t('about.good_fit')"
                >{{ $t('about.good_fit') }}</a
              >
            </li>
            <br />
            <li v-html="$t('about.contribute')"></li>
            <br />
            <li>
              <a
                href="https://crisiscleanup.zendesk.com/hc/en-us/"
                target="_blank"
                :title="$t('about.helpdesk')"
                >{{ $t('about.helpdesk') }}</a
              >
            </li>
            <br />
            <li v-html="$t('about.ccu_story')"></li>
          </ul>
        </div>
      </div>
      <!-- End Helpful Links -->
    </div>
  </Home>
</template>

<script lang="ts">
import Home from '../../layouts/Home.vue';

export default defineComponent({
  name: 'AboutPage',
  components: {
    Home,
  },
});
</script>

<style scoped>
.about > li {
  @apply underline;
}
@media only screen and (max-width: 640px) {
  .homegrid {
    height: 100vh;

    &.grid-container {
      grid:
        [r1] 'logo survivors' [r1end]
        [r4] 'nav nav' [r4end]
        [r3] 'actions actions' [r3end]
        [r2] 'main main' [r2end]
        / auto;
      grid-template-rows: 0.5fr 0.5fr 4fr 1fr;
    }
  }
}

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

.images-grid {
  display: grid;
  grid-gap: 5px;
}

.images-grid img {
  width: 20rem;
  height: 20rem;
}

.partners-grid {
  display: grid;
  grid-gap: 15px;
}

.partners-grid img {
  width: 8rem;
  height: 8rem;
}
</style>
