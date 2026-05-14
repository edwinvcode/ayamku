// In-memory Supabase mock untuk dev tanpa koneksi database.
// Data disimpan selama proses Node.js jalan (reset saat dev server restart).

// Pakai global biar data survive HMR reload
const g = global as any;
if (!g.__mockStore) g.__mockStore = {};
const store: Record<string, Record<string, any>[]> = g.__mockStore;

function getRows(table: string) {
  if (!store[table]) store[table] = [];
  return store[table];
}

function uuid() {
  return crypto.randomUUID();
}

const mockUser = { id: "mock-user-id", email: "dev@ayamku.local" };

// Map: related_table → FK column name in the querying table
const FK_MAP: Record<string, string> = {
  chicken_batches: "batch_id",
  eggs: "source_egg_id",
};

function inferFkField(relatedTable: string): string {
  if (FK_MAP[relatedTable]) return FK_MAP[relatedTable];
  // fallback: strip trailing 's'/'es' + '_id'
  const base = relatedTable.replace(/es$/, "").replace(/s$/, "");
  const last = base.split("_").pop();
  return (last ?? base) + "_id";
}

interface EmbeddedJoin {
  relatedTable: string;
  fields: string[];
  fkField: string;
}

class MockQueryBuilder {
  private _table: string;
  private _filters: Array<(row: any) => boolean> = [];
  private _orderField: string | null = null;
  private _orderAsc = true;
  private _limitN: number | null = null;
  private _op: "select" | "insert" | "update" | "delete" = "select";
  private _insertData: any[] = [];
  private _updateData: any = null;
  private _embeddedJoins: EmbeddedJoin[] = [];

  constructor(table: string) {
    this._table = table;
  }

  select(fields?: string) {
    this._op = "select";
    if (fields) {
      const joinRegex = /(\w+)\(([^)]+)\)/g;
      let m;
      while ((m = joinRegex.exec(fields)) !== null) {
        const relatedTable = m[1];
        const joinFields = m[2].split(",").map(f => f.trim());
        this._embeddedJoins.push({
          relatedTable,
          fields: joinFields,
          fkField: inferFkField(relatedTable),
        });
      }
    }
    return this;
  }

  insert(data: any | any[]) {
    this._op = "insert";
    this._insertData = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data: any) {
    this._op = "update";
    this._updateData = data;
    return this;
  }

  delete() {
    this._op = "delete";
    return this;
  }

  eq(field: string, value: any)  { this._filters.push(r => r[field] === value); return this; }
  neq(field: string, value: any) { this._filters.push(r => r[field] !== value); return this; }
  gte(field: string, value: any) { this._filters.push(r => r[field] >= value);  return this; }
  lte(field: string, value: any) { this._filters.push(r => r[field] <= value);  return this; }
  gt(field: string, value: any)  { this._filters.push(r => r[field] > value);   return this; }
  lt(field: string, value: any)  { this._filters.push(r => r[field] < value);   return this; }
  not(field: string, _op: string, value: any) { this._filters.push(r => r[field] !== value); return this; }

  in(field: string, values: any[]) {
    this._filters.push(r => values.includes(r[field]));
    return this;
  }

  order(field: string, opts?: { ascending?: boolean }) {
    this._orderField = field;
    this._orderAsc = opts?.ascending !== false;
    return this;
  }

  limit(n: number) {
    this._limitN = n;
    return this;
  }

  async single() {
    const result = await this._execute();
    return { data: result.data?.[0] ?? null, error: null };
  }

  then(resolve: any, reject?: any) {
    return this._execute().then(resolve, reject);
  }

  catch(reject: any) {
    return this._execute().catch(reject);
  }

  private async _execute(): Promise<{ data: any; error: null }> {
    const rows = getRows(this._table);
    const now = new Date().toISOString();

    if (this._op === "insert") {
      const created = this._insertData.map(item => ({
        id: uuid(),
        created_at: now,
        updated_at: now,
        ...item,
      }));
      rows.push(...created);
      return { data: created, error: null };
    }

    const match = (row: any) => this._filters.every(f => f(row));

    if (this._op === "update") {
      rows.filter(match).forEach(r => Object.assign(r, this._updateData, { updated_at: now }));
      return { data: null, error: null };
    }

    if (this._op === "delete") {
      const toRemove = rows.filter(match);
      toRemove.forEach(r => rows.splice(rows.indexOf(r), 1));
      return { data: null, error: null };
    }

    // select
    let result = rows.filter(match);

    if (this._orderField) {
      const f = this._orderField;
      const asc = this._orderAsc;
      result = [...result].sort((a, b) => {
        if (a[f] < b[f]) return asc ? -1 : 1;
        if (a[f] > b[f]) return asc ? 1 : -1;
        return 0;
      });
    }

    if (this._limitN !== null) result = result.slice(0, this._limitN);

    // Resolve embedded joins (foreign key lookups)
    if (this._embeddedJoins.length > 0) {
      result = result.map(row => {
        const enriched = { ...row };
        for (const join of this._embeddedJoins) {
          const fkValue = row[join.fkField];
          if (!fkValue) {
            enriched[join.relatedTable] = null;
            continue;
          }
          const relatedRows = getRows(join.relatedTable);
          const related = relatedRows.find(r => r.id === fkValue);
          if (!related) {
            enriched[join.relatedTable] = null;
            continue;
          }
          // Pick only requested fields (or all if "*")
          if (join.fields.includes("*")) {
            enriched[join.relatedTable] = { ...related };
          } else {
            const picked: Record<string, any> = {};
            join.fields.forEach(f => { picked[f] = related[f]; });
            enriched[join.relatedTable] = picked;
          }
        }
        return enriched;
      });
    }

    return { data: result, error: null };
  }
}

export function createMockClient() {
  return {
    auth: {
      getUser:            async () => ({ data: { user: mockUser }, error: null }),
      getSession:         async () => ({ data: { session: { user: mockUser } }, error: null }),
      signInWithPassword: async () => ({ data: { user: mockUser }, error: null }),
      signOut:            async () => ({ error: null }),
    },
    from: (table: string) => new MockQueryBuilder(table),
  } as any;
}
