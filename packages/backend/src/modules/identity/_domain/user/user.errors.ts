export type UserNotFoundError = {
  readonly _tag: "UserNotFoundError";
  readonly id: string;
  readonly message: string;
};

export type UserAlreadyExistsError = {
  readonly _tag: "UserAlreadyExistsError";
  readonly email: string;
  readonly message: string;
};

// --- FACTORIES ---
export const createUserNotFoundError = (id: string): UserNotFoundError => ({
  _tag: "UserNotFoundError",
  id,
  message: `User with id ${id} was not found.`,
});

export const createUserAlreadyExistsError = (
  email: string,
): UserAlreadyExistsError => ({
  _tag: "UserAlreadyExistsError",
  email,
  message: `User with email ${email} already exists.`,
});
