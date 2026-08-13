# Bank Connectivity Layer (Tier 2)

This module provides a future-proof integration layer for connecting LedgerAI to global banking providers.

## Architecture

The system follows a **Two-Tier Design**:

1.  **Tier 1: LedgerAI Core API**
    *   Responsible for the authoritative ledger.
    *   Exposes a secure ingestion endpoint: `POST /integrations/bank/transactions/bulk`.
    *   Protected by `INTERNAL_API_KEY`.

2.  **Tier 2: Bank Connect Layer**
    *   Handles provider-specific logic (Plaid, TrueLayer, etc.).
    *   Manages encrypted tokens, sync cursors, and deduplication.
    *   Normalizes bank data into the LedgerAI schema.
    *   Pushes data to Tier 1.

## Folder Structure

*   `src/services/bank-connect/`
    *   `providers/`: Adapter implementations for different banks.
        *   `base.ts`: Abstract interface.
        *   `mock_provider.ts`: Local development implementation.
        *   `plaid_provider.ts`: Placeholder for Plaid.
    *   `bank_sync_service.ts`: Core sync engine and encryption logic.
    *   `category_mapper.ts`: Heuristic-based merchant to category mapping.

## Security

*   **Encryption**: Tokens are encrypted at rest using Fernet (AES-128 in CBC mode with HMAC-SHA256).
*   **Authentication**: Tier 2 routes require a User JWT. Tier 1 ingestion requires an `INTERNAL_API_KEY`.
*   **Data Privacy**: Read-only access (aggregation only). No payment or transfer capabilities.

## Getting Started

1.  Set `BANK_TOKEN_ENCRYPTION_KEY` and `INTERNAL_API_KEY` in your environment.
2.  Use the `MockBankProvider` for local testing.
3.  Implement new providers by extending the `BankProvider` interface in `src/services/bank-connect/providers/`.
