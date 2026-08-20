// ============================================================
// STORAGE ADAPTER
//
// Única pieza del proyecto que sabe que los datos viven en
// localStorage. Todo el resto de la app (ProductService, admin,
// catálogo) habla contra esta interfaz, no contra localStorage
// directamente.
//
// El día que haya backend (Node + Express + PostgreSQL), esta
// clase se reemplaza por un ApiStorageAdapter que hace fetch()
// a /api/productos/... y devuelve las mismas Promises con la
// misma forma (getAll, getById, create, update, remove...).
// Ningún otro archivo del proyecto necesita cambiar: ProductService
// seguiría llamando a los mismos métodos.
//
// Por eso cada método es async y devuelve Promise, aunque
// localStorage sea síncrono: la interfaz ya está "lista para red".
// ============================================================

export class StorageAdapter {
  /**
   * @param {string} key - clave de localStorage donde vive la colección
   */
  constructor(key) {
    this.key = key;
  }

  async _readAll() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error(`[StorageAdapter] Error leyendo "${this.key}":`, err);
      return [];
    }
  }

  async _writeAll(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
    return items;
  }

  async getAll() {
    return this._readAll();
  }

  async getById(id) {
    const items = await this._readAll();
    return items.find((item) => item.id === id) || null;
  }

  async create(item) {
    const items = await this._readAll();
    items.push(item);
    await this._writeAll(items);
    return item;
  }

  async update(id, changes) {
    const items = await this._readAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error(`No existe el registro con id "${id}"`);
    items[index] = { ...items[index], ...changes };
    await this._writeAll(items);
    return items[index];
  }

  async remove(id) {
    const items = await this._readAll();
    const filtered = items.filter((item) => item.id !== id);
    await this._writeAll(filtered);
    return filtered.length !== items.length;
  }

  async replaceAll(items) {
    return this._writeAll(items);
  }

  async seedIfEmpty(seedItems) {
    const items = await this._readAll();
    if (items.length === 0) {
      await this._writeAll(seedItems);
      return true;
    }
    return false;
  }
}
