// src/utils/pagination.ts
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const paginate = async <T>(
  model: any,
  options: PaginationOptions,
  where: any = {},
  include: any = {}
): Promise<PaginationResult<T>> => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    model.findMany({
      where,
      include,
      skip,
      take: limit,
      orderBy: options.sortBy
        ? { [options.sortBy]: options.sortOrder || 'desc' }
        : { createdAt: 'desc' },
    }),
    model.count({ where }),
  ]);

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};