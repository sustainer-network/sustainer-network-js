module.exports = ({
  store,
  query,
  sort = null,
  select = null,
  skip = 0,
  pageSize = null,
  options = null
}) => {
  const op = store.find(query, select, {
    ...(skip && { skip }),
    ...(sort && { sort }),
    ...(pageSize && { limit: pageSize }),
    ...options
  });

  return op;
};
