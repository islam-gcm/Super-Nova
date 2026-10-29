const pagination = (query) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  return { page, limit, skip: (page - 1) * limit };
};

const paginationMeta = (page, limit, total) => {
  return { page, limit, total, pages: Math.ceil(total / limit) };
};

module.exports = { pagination, paginationMeta };
