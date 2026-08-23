// Async boundary, for the same reason the host and the Rspack remote have one:
// bootstrap.tsx touches shared modules (jotai, the atoms package) as soon as it
// is evaluated, and the federation container has to finish wiring up the shared
// scope first. Reaching a shared module synchronously from the entry leaves this
// remote's standalone page blank.
import("./bootstrap");
