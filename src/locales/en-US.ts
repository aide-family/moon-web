// English language resources (compatible with old version, migrated to modular structure)
// New code should use modular translation files (common.ts, namespaces.ts, etc.)
import { enUS as commonEn } from './common';
import { enUS as namespacesEn } from './namespaces';

export default {
  ...commonEn,
  ...namespacesEn,
} as const;
