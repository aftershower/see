# Storage Migration Notes - 2026-06-02

## Decision

Keep the current prototype on localStorage for V1 because the data set is small and the goal is to validate trust, safety, and elder usability before building a heavier storage layer.

Do not describe the PWA as iCloud sync. Browser localStorage is local browser storage, not iCloud sync, not account storage, and not durable cross-device memory.

## Current V1 Boundary

- localStorage stores messages, memories, and the current check-in.
- Export/import gives the user a manual backup and restore path.
- Older imports now merge instead of deleting newer local chats.
- localStorage is synchronous, so it should stay small and simple.
- Long histories, attachments, audio, and structured query needs are out of scope for localStorage.

## Move To IndexedDB When

Use IndexedDB for the PWA once any of these become true:

- More than a small rolling chat history is kept.
- The app needs indexed structured data, such as memories by type, date, sensitivity, or source message.
- The app stores larger payloads, generated summaries, attachments, or offline queues.
- The app needs transactions for import, merge, delete, and retention operations.
- localStorage write failures or UI stalls appear during validation.

IndexedDB is the right browser-side next step because it is designed for client-side storage of significant amounts of structured data and uses asynchronous requests instead of blocking the UI thread with synchronous storage writes.

## Move To Native CloudKit When

Use native iOS and CloudKit when cross-device continuity becomes a product requirement:

- The user expects memory to survive device replacement without manual export/import.
- The app needs private iCloud sync without building custom accounts.
- The app needs native iOS features such as deeper speech APIs, notification scheduling, watch integration, and app-level privacy controls.
- The product is ready to handle iCloud account absence, iCloud quota, conflict resolution, and native migration.

CloudKit private database is the likely native storage target because it is user-owned iCloud storage and aligns with the "no custom account backend" product promise.

## Migration Path

1. Keep V1 localStorage and JSON export/import for pilot testing.
2. Add IndexedDB when pilot usage proves local history or memory volume is large enough.
3. Export current localStorage data into an IndexedDB bootstrap transaction.
4. Keep JSON export/import even after IndexedDB as a user-visible recovery path.
5. For native iOS, migrate from JSON/IndexedDB-shaped records into CloudKit private database records.
6. Treat CloudKit sync conflicts as a product surface, not hidden infrastructure. The older adult should never lose recent local memories silently.

## Sources

- MDN Web Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
- MDN IndexedDB API: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- Indexed Database API specification: https://w3c.github.io/IndexedDB/
- Apple CloudKit private database: https://developer.apple.com/documentation/cloudkit/ckcontainer/privateclouddatabase
