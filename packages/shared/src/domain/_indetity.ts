import { z } from "zod";

export const UserIdSchema = z.string().brand<"UserId">();
export const SessionIdSchema = z.string().brand<"SessionId">();
export const TenantIdSchema = z.string().brand<"TenantId">();
export const TeamIdSchema = z.string().brand<"TeamId">();
export const MembershipIdSchema = z.string().brand<"MembershipId">();

export type UserId = z.infer<typeof UserIdSchema>;
export type SessionId = z.infer<typeof SessionIdSchema>;
export type TenantId = z.infer<typeof TenantIdSchema>;
export type TeamId = z.infer<typeof TeamIdSchema>;
export type MembershipId = z.infer<typeof MembershipIdSchema>;

export const UserId = (id: string) => id as UserId;
export const SessionId = (id: string) => id as SessionId;
export const TenantId = (id: string) => id as TenantId;
export const TeamId = (id: string) => id as TeamId;
export const MembershipId = (id: string) => id as MembershipId;

type IdGenerator = () => string;

export const createIdGenerator = (generateRawId: IdGenerator) => ({
  user: (): UserId => UserId(generateRawId()),
  session: (): SessionId => SessionId(generateRawId()),
  tenant: (): TenantId => TenantId(generateRawId()),
  team: (): TeamId => TeamId(generateRawId()),
  Membership: (): MembershipId => MembershipId(generateRawId()),
});
