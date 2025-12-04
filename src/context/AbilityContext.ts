import { createContext } from 'react';
import type { AnyAbility } from '@casl/ability';

export const AbilityContext = createContext<AnyAbility>(undefined!);
