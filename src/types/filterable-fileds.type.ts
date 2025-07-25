import type { FilterFields } from '@/enums/filter.enums';

export type FilterableFields = Omit<FilterFields, 'age'>;
