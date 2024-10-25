import { REDE_SOCIAL_NOME } from "../constants";

type SocialEntry = [keyof typeof REDE_SOCIAL_NOME, (typeof REDE_SOCIAL_NOME)[keyof typeof REDE_SOCIAL_NOME]];

export const initialState = { available: Object.entries(REDE_SOCIAL_NOME), used: [] } as {
  available: SocialEntry[];
  used: SocialEntry[];
};

export const enum REDUCER_ACTION_TYPE {
  USE,
  REMOVE,
  CLEAR,
}

type ReducerAction = {
  type: REDUCER_ACTION_TYPE;
  payload?: number;
};

export const reducer = (prevState: typeof initialState, action: ReducerAction): typeof initialState => {
  const newAvailable = [...prevState.available];
  const newUsed = [...prevState.used];
  switch (action.type) {
    case REDUCER_ACTION_TYPE.USE:
      // remove from available and add to used
      newUsed.push(...newAvailable.splice(action.payload ?? -1, 1));
      return { available: newAvailable, used: newUsed };
    case REDUCER_ACTION_TYPE.REMOVE:
      // remove from used and add back to available
      const [removed] = newUsed.splice(action.payload ?? -1, 1);
      const initialIndex = initialState.available.findIndex((entry) => entry[0] === removed[0]);
      newAvailable.splice(initialIndex, 0, removed);
      return { available: newAvailable, used: newUsed };
    case REDUCER_ACTION_TYPE.CLEAR:
      return initialState;
    default:
      throw new Error("Not well handled reducer action from 'SocialNome'");
  }
};
