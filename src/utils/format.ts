export function formatObj(
  schema: Record<string, string>,
  obj: Record<string, string>
) {
  const keys = Object.keys(schema);
  const result: Record<string, string> = {};
  keys.forEach(key => {
    result[schema[key]] = obj[key];
  });
  return result;
}
