export function queryStrToWhereCriteria(queryString: string) {
  const params = new URLSearchParams(queryString);
  const criteria = {};
  for (const [key, value] of params.entries()) {
    criteria[key] = value;
  }
  return criteria;
}
