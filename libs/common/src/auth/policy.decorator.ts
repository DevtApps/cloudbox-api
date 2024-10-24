import { SetMetadata } from '@nestjs/common';
import { Policy } from 'src/enum/policy/box.policy';


export const POLICIES_KEY = 'policies';
export const REQUIRED_POLICIES_KEY = 'required_policies';
export const Policies = (...policies: Policy[]) =>SetMetadata(POLICIES_KEY, policies);

export const RequirePolicies = () =>SetMetadata(REQUIRED_POLICIES_KEY, true);
