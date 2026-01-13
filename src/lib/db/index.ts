import { KnowledgeDB } from './schema';

export const db = new KnowledgeDB();

export { KnowledgeDB, type FileNode, type SyncState, type PendingChange } from './schema';
