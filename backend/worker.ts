/// <reference lib="webworker" />
import { dbManager } from './database/connection';
import { createRouter } from './routes';
import { MainToWorkerMessage, WorkerToMainMessage } from './types/api';

const router = createRouter();

function postToMain(message: WorkerToMainMessage) {
  self.postMessage(message);
}

// Auto-initialize DB on worker spawn
async function initWorker() {
  postToMain({ type: 'EVENT', event: 'DB_INIT_START' });

  try {
    const sqlite3 = await dbManager.getSqlite();
    const hasOpfs = !!sqlite3.oo1?.OpfsDb && typeof navigator !== 'undefined' && !!navigator.storage?.getDirectory;
    let exists = false;
    if (hasOpfs) {
      try {
        const root = await navigator.storage.getDirectory();
        await root.getFileHandle('fefw.sqlite');
        exists = true;
      } catch {
        exists = false;
      }
    }

    if (exists) {
      await dbManager.initialize(undefined, false);
      postToMain({ type: 'EVENT', event: 'DB_READY', data: { dbType: dbManager.getConnection().dbType } });
      return;
    }

    const remoteUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REMOTE_SQLITE_GZ_URL) || '';
    if (!remoteUrl) {
      postToMain({ type: 'EVENT', event: 'DB_NO_REMOTE_URL' });
      return;
    }

    await dbManager.initialize(remoteUrl, false, (stage, detail) => {
      if (stage === 'downloading') {
        postToMain({ type: 'EVENT', event: 'DB_DOWNLOADING', data: { detail } });
      } else if (stage === 'extracting') {
        postToMain({ type: 'EVENT', event: 'DB_EXTRACTING', data: { detail } });
      }
    });

    postToMain({ type: 'EVENT', event: 'DB_READY', data: { dbType: dbManager.getConnection().dbType } });
  } catch (error: any) {
    console.error('Worker failed to initialize database:', error);
    postToMain({
      type: 'EVENT',
      event: 'DB_ERROR',
      data: { error: error.message },
    });
  }
}

self.onmessage = async (event: MessageEvent<MainToWorkerMessage>) => {
  const { id, type, payload } = event.data;

  if (type === 'API_REQUEST') {
    try {
      const response = await router.dispatch(payload, (stage, detail) => {
        // Forward sync progress events
        if (stage === 'downloading') {
          postToMain({ type: 'EVENT', event: 'DB_DOWNLOADING', data: { detail } });
        } else if (stage === 'extracting') {
          postToMain({ type: 'EVENT', event: 'DB_EXTRACTING', data: { detail } });
        }
      });

      postToMain({
        id,
        type: 'API_RESPONSE',
        payload: response,
      });
    } catch (error: any) {
      postToMain({
        id,
        type: 'API_RESPONSE',
        payload: {
          status: 500,
          error: error.message,
        },
      });
    }
  }
};

// Start initial bootstrap
initWorker();
