import { SocialNome } from "@/types";

type SocialEntry = ReturnType<typeof Object.entries<SocialNome>>[number];

export const initState = { available: Object.entries(SocialNome), used: [] } as {
  available: SocialEntry[];
  used: SocialEntry[];
};

export const enum REDUCER_ACTION_TYPE {
  USE,
  REMOVE,
}

type ReducerAction = {
  type: REDUCER_ACTION_TYPE;
  payload: number;
};

export const reducer = (prevState: typeof initState, action: ReducerAction): typeof initState => {
  const newAvailable = [...prevState.available];
  const newUsed = [...prevState.used];
  switch (action.type) {
    case REDUCER_ACTION_TYPE.USE:
      // remove from available and add to used
      newUsed.push(...newAvailable.splice(action.payload, 1));
      return { available: newAvailable, used: newUsed };
    case REDUCER_ACTION_TYPE.REMOVE:
      // remove from used and add back to available
      newAvailable.push(...newUsed.splice(action.payload, 1));
      return { available: newAvailable, used: newUsed };
    default:
      throw new Error("Not well handled reducer action from 'SocialNome'");
  }
};
