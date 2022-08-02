/**
 * Use Training Hook
 */

import {
  ref,
  reactive,
  onMounted,
  computed,
  toRefs,
} from 'vue';
import axios from 'axios';
import { hash } from '@/utils/promise';
import { TrainingApi, UserTrainingApi } from '@/utils/api';

interface UseTrainingProps {
  tests?: number[];
}

/**
 * Use User Training Modules.
 * @param tests - IDs of tests to utilize.
 * @returns {{onTrainingComplete: onTrainingComplete, outstandingTrainings: (function(): ComputedRef<Array<$NonMaybeType<T>>|Array<T>>), loadTrainingData: loadTrainingData, trainings: Ref<UnwrapRef<{trainings: [], userTrainings: []}>["trainings"]>, allTrainingCompleted: (function(): ComputedRef<boolean>), userTrainings: Ref<UnwrapRef<{trainings: [], userTrainings: []}>["userTrainings"]>}}
 */
export default ({ tests }: UseTrainingProps = {}) => {
  const _tests = tests || [2, 3, 4];

  const state = reactive({
    trainings: [],
    userTrainings: [],
  });

  const loadTrainingData = async () => {
    const pageData = await hash({
      trainings: axios.get(TrainingApi()),
      userTrainings: axios.get(UserTrainingApi()),
    });
    pageData.userTrainings.data.results.map((v: never) =>
      state.trainings.push(ref(v)),
    );
    const selectedTests = pageData.trainings.data.results.filter((tr) =>
      _tests.includes(tr.id),
    );
    selectedTests.map((t: never) => state.userTrainings.push(ref(t)));
  };

  const outstandingTrainings: any = () =>
    computed(() =>
      state.trainings.filter((tr: any) => {
        return !state.userTrainings.find(
          (uTr: any) => uTr.value.id === tr.value.id,
        );
      }),
    );

  const allTrainingCompleted = () =>
    computed(() => !outstandingTrainings.value.length);

  onMounted(async () => loadTrainingData());

  const onTrainingComplete = async () => {
    state.trainings = [];
    state.userTrainings = [];
    await loadTrainingData();
  };

  return {
    ...toRefs(state),
    loadTrainingData,
    outstandingTrainings,
    allTrainingCompleted,
    onTrainingComplete,
  };
};
