import produce from 'immer';

class StateManager<TState> {
  state: TState;
  constructor(state: TState) {
    this.state = state;
  }
  modify(modifier: (draft: TState) => void) {
    this.state = produce(this.state, modifier);
    return this;
  }
  select<R>(selector: (state: TState) => R) {
    return selector(this.state);
  }
}

export default function createStateManager<
  TState,
  TManager,
  TStateManager extends new (...args: any[]) => StateManager<TState>,
>(initialState: TState, createManager: (Base: TStateManager) => TManager) {
  // @ts-ignore
  const manager = createManager(StateManager);
  const clone = (newState: TState = initialState) => {
    return createStateManager(newState, createManager);
  };
  return { manager, clone };
}
