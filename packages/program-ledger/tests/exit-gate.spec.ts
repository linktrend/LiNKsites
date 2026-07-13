import { InMemoryLedgerStore } from '../src/store.js'
import { runLedgerContractTests } from './ledgerContract.shared.js'

runLedgerContractTests('in-memory', () => new InMemoryLedgerStore())
