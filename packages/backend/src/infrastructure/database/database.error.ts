export type DatabaseError = {
  readonly _tag: "DatabaseError";
  readonly message: string;
  readonly cause?: unknown;
};

export type MappingError = {
  readonly _tag: "MappingError";
  readonly message: string;
  readonly entityName: string;
  readonly entityId: string;
  readonly cause: unknown;
};

export const createMappingError = (
  entityName: string,
  entityId: string,
  cause: unknown,
): MappingError => ({
  _tag: "MappingError",
  message: `Failed to map ${entityName} document with ID '${entityId}'.`,
  entityName,
  entityId,
  cause,
});

export const createDatabaseError = (cause?: unknown): DatabaseError => ({
  _tag: "DatabaseError" as const,
  message: "An unexpected database error occurred.",
  cause,
});
