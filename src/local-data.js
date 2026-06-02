export function normalizeImportedState(imported, options = {}) {
  const createId = options.createId || ((prefix) => `${prefix}-${Date.now()}`);
  const now = options.now || (() => new Date().toISOString());

  if (!imported || !Array.isArray(imported.messages) || !Array.isArray(imported.memories)) {
    throw new Error("Invalid See export");
  }

  const messages = imported.messages
    .filter((item) => item && typeof item.text === "string" && ["assistant", "user"].includes(item.role))
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : createId(item.role),
      role: item.role,
      text: item.text,
      safetyLevel: item.safetyLevel || "normal",
      createdAt: item.createdAt || now()
    }));

  if (messages.length === 0) {
    throw new Error("Imported export has no messages");
  }

  return {
    messages,
    memories: imported.memories
      .filter((item) => item && typeof item.label === "string" && typeof item.type === "string")
      .map((item) => ({
        ...item,
        id: typeof item.id === "string" ? item.id : createId("memory")
      })),
    checkIn: imported.checkIn && typeof imported.checkIn.text === "string" ? imported.checkIn : null
  };
}

export function needsImportConflictConfirmation(currentState, imported) {
  const currentLatest = latestTimestamp(currentState?.messages || []);
  const importedLatest = timestamp(imported?.exportedAt) || latestTimestamp(imported?.messages || []);
  return currentLatest > 0 && importedLatest > 0 && importedLatest < currentLatest;
}

function latestTimestamp(messages) {
  return Math.max(0, ...messages.map((message) => timestamp(message?.createdAt)));
}

function timestamp(value) {
  const time = Date.parse(value || "");
  return Number.isFinite(time) ? time : 0;
}
