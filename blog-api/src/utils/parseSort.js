// Convierte ?sort=campo / ?sort=-campo en un objeto de orden de Mongoose.
// Solo acepta los campos de la lista blanca: devuelve null si el valor no es valido,
// para que cada endpoint aplique su orden por defecto.
const parseSort = (raw, allowedFields) => {
  if (typeof raw !== 'string' || raw === '') return null;
  const desc = raw.startsWith('-');
  const field = desc ? raw.slice(1) : raw;
  if (!allowedFields.includes(field)) return null;
  // _id desempata filas con el mismo valor para que la paginacion sea estable
  return { [field]: desc ? -1 : 1, _id: desc ? -1 : 1 };
};

module.exports = parseSort;
