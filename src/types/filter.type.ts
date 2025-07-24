export type FilterFields = 'country' | 'city' | 'age';

export type FilterableFields = Omit<FilterFields, 'age'>;
