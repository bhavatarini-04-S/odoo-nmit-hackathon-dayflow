export async function mockApi<T>(operation: () => T, delay = 350): Promise<T> {
  await new Promise<void>((resolve) => setTimeout(resolve, delay));
  return structuredClone(operation());
}

export function newMockId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
