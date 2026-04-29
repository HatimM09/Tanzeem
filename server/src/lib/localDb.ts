import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(__dirname, '../../data/json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class LocalDB<T extends { id?: string }> {
  private filePath: string;

  constructor(private collection: string) {
    this.filePath = path.join(DATA_DIR, `${collection}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private read(): T[] {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  private write(data: T[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async findMany(where?: (item: T) => boolean): Promise<T[]> {
    const data = this.read();
    return where ? data.filter(where) : data;
  }

  async findUnique(where: (item: T) => boolean): Promise<T | null> {
    const data = this.read();
    return data.find(where) || null;
  }

  async findFirst(where: (item: T) => boolean): Promise<T | null> {
    const data = this.read();
    return data.find(where) || null;
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const data = this.read();
    const newItem = { ...item, id: uuidv4() } as T;
    data.push(newItem);
    this.write(data);
    return newItem;
  }

  async update(where: (item: T) => boolean, updateData: Partial<T>): Promise<T> {
    const data = this.read();
    const index = data.findIndex(where);
    if (index === -1) throw new Error('Item not found');
    
    data[index] = { ...data[index], ...updateData };
    this.write(data);
    return data[index];
  }

  async delete(where: (item: T) => boolean): Promise<void> {
    const data = this.read();
    const newData = data.filter(item => !where(item));
    this.write(newData);
  }

  async upsert(params: { where: (item: T) => boolean, update: Partial<T>, create: Omit<T, 'id'> }): Promise<T> {
    const data = this.read();
    const index = data.findIndex(params.where);
    
    if (index !== -1) {
      data[index] = { ...data[index], ...params.update };
      this.write(data);
      return data[index];
    } else {
      const newItem = { ...params.create, id: uuidv4() } as T;
      data.push(newItem);
      this.write(data);
      return newItem;
    }
  }
}

export const db = {
  users:      new LocalDB<any>('users'),
  items:      new LocalDB<any>('items'),
  scans:      new LocalDB<any>('scans'),
  complaints: new LocalDB<any>('complaints'),
  auditLogs:  new LocalDB<any>('audit_logs'),
};
