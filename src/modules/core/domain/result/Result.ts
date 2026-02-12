export type SuccessResult<P = void> = {
  success: true;
  payload: P;
};

export type ErrorResult<E = string> = {
  success: false;
  error: E;
};

export type Result<P = void, E = string> = SuccessResult<P> | ErrorResult<E>;

const success = <P = void>(payload: P): SuccessResult<P> => ({
  success: true,
  payload,
});

const error = <E = string>(error: E): ErrorResult<E> => ({
  success: false,
  error,
});

export const Result = {
  success,
  error,
};
