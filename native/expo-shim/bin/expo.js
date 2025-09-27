#!/usr/bin/env node
// Local Expo shim to no-op any expo commands invoked by external tooling
// Keeps Next.js dev server from failing when a script tries to start Expo

const args = process.argv.slice(2);
console.log("[expo-shim] Ignoring expo command:", args.join(" "));
process.exit(0);