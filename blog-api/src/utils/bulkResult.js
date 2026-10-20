const ApiError = require('./ApiError');

// Ejecuta una accion por id y reune el resultado. Cada elemento aplica las mismas reglas
// que su endpoint individual, asi que un fallo (permisos, no encontrado) no aborta el resto.
const runBulk = async (ids, action) => {
  const succeeded = [];
  const failed = [];
  // Secuencial a proposito: como mucho 100 ids, y evita saturar la conexion a la base
  for (const id of ids) {
    try {
      await action(id);
      succeeded.push(id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error inesperado.';
      failed.push({ id, message });
    }
  }
  return { succeeded, failed };
};

module.exports = runBulk;
