import { seedIfEmpty } from '../db/seed';
import { db } from '../db/client';

jest.mock('../db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

jest.mock('crypto-js', () => ({
  SHA256: jest.fn().mockReturnValue({ toString: () => 'mocked-hash-value' }),
}));

const mockDb = db as unknown as { select: jest.Mock; insert: jest.Mock };

describe('seedIfEmpty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts data into all core tables when the database is empty', async () => {
    const mockValues = jest.fn().mockResolvedValue(undefined);
    const mockFrom = jest.fn().mockResolvedValue([]);
    mockDb.select.mockReturnValue({ from: mockFrom });
    mockDb.insert.mockReturnValue({ values: mockValues });

    await seedIfEmpty();

    // Verifies users, categories, habits, habit_logs, and targets are all seeded
    expect(mockDb.insert).toHaveBeenCalledTimes(5);
    expect(mockValues).toHaveBeenCalledTimes(5);

    // Verify users table is seeded with demo user
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Demo User', email: 'demo@example.com' })
    );

    // Verify categories are seeded
    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Exercise' }),
        expect.objectContaining({ name: 'Mindfulness' }),
        expect.objectContaining({ name: 'Learning' }),
      ])
    );

    // Verify habits are seeded
    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Morning Run' }),
        expect.objectContaining({ name: 'Meditation' }),
        expect.objectContaining({ name: 'Reading' }),
      ])
    );
  });

  it('does nothing when data already exists', async () => {
    const mockFrom = jest.fn().mockResolvedValue([{ id: 1 }]);
    mockDb.select.mockReturnValue({ from: mockFrom });

    await seedIfEmpty();

    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});
