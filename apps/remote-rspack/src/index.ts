// Async boundary. Same reason the host has one: this entry pulls in components
// that resolve shared modules (react/jsx-runtime, jotai, the atoms package)
// synchronously, and the federation container has to finish initialising the
// shared scope first. Without the dynamic import, booting this remote standalone
// dies with "Invalid loadShareSync function call #RUNTIME-006".
import("./bootstrap");
