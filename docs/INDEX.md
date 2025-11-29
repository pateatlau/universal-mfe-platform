# Universal MFE Platform — Documentation Index

This directory contains all core documentation for the Universal Web + Mobile Microfrontend Platform using:

- Nx
- React + React Native
- React Native Web
- Rspack (web)
- Re.Pack (native)
- Module Federation v2
- ScriptManager (runtime loader for native MF)

Use this INDEX.md as your entry point.

---

## 📘 Core Architecture Docs

### **1. Architecture Overview**
**File:** `architecture-overview.md`  
Explains high-level system design, hosts/remotes, bundlers, and boundaries.

### **2. Nx Bundling Boundaries**
**File:** `nx-bundling-boundaries.md`  
Defines directory structure, dependency rules, platform boundaries, and Nx tags.

---

## 🔧 Module Federation (MF) Docs

### **3. MFv2 + ScriptManager Integration Guide**
**File:** `repack-mf-v2-scriptmanager-integration-guide.md`  
The authoritative guide on integrating Re.Pack Module Federation v2 with ScriptManager.  
Explains bootstrap, resolver, runtime behavior, and troubleshooting.

### **4. MFv2 Integration Checklist (Cursor-friendly)**
**File:** `repack-mf-v2-integration-checklist.md`  
A step-by-step implementation plan, specifically written for Cursor automation.

### **5. Minimal Re.Pack MFv2 PoC**
**File:** `repack-mf-poc-mobile-shell-hello-remote.md`  
A minimal working example using:
- `apps/mobile-shell` → host  
- `apps/hello-remote` → native remote

---

## 🚀 Getting Started / Setup Docs

### **6. Setup Checklist**
**File:** `setup-checklist.md`  
High-level onboarding checklist for initializing the project.

### **7. Troubleshooting**
**File:** `troubleshooting.md`  
Common issues across bundling, native builds, MF runtime, or ScriptManager.

---

## 🎯 How to Use this Documentation With Cursor

1. When starting a new MF-related task, attach:  
   - `repack-mf-v2-scriptmanager-integration-guide.md`  
   - `repack-mf-v2-integration-checklist.md`

2. When modifying host/remote configs, also attach:  
   - `repack-mf-poc-mobile-shell-hello-remote.md`  
   - `nx-bundling-boundaries.md`

3. For bugs or runtime errors:  
   - Attach `troubleshooting.md`

This index helps ensure all docs stay discoverable and consistent.

