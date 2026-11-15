export type ActiveSessionExistsError = {
  readonly _tag: "ActiveSessionExistsError";
  readonly userId: string;
  readonly message: string;
};

export type SessionExpiredError = {
  readonly _tag: "SessionExpiredError";
  readonly sessionId: string;
  readonly message: string;
};

export const createActiveSessionExistsError = (userId: string): ActiveSessionExistsError => ({
  _tag: "ActiveSessionExistsError",
  userId,
  message: `An active session already exists for user ${userId}.`,
});

export const createSessionExpiredError = (sessionId: string): SessionExpiredError => ({
  _tag: "SessionExpiredError",
  sessionId,
  message: `Session ${sessionId} has expired.`,
});
