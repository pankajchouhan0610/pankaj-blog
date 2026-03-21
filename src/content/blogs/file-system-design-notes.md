---
title: "File System Design Notes"
slug: "file-system-design-notes"
description: "Notes on designing an in-memory file system supporting mkdir, cd, and pwd operations."
date: "2026-03-21"
tags: ["systems", "design", "filesystem"]
---

Designing a file system from scratch is a fascinating exercise in system design. Whether for an interview or building a real system, understanding the core components and trade-offs is crucial. Let's break down how to design an in-memory file system that supports basic shell commands.

## The Design Framework

A systematic approach to system design:

1. Clarify the requirements
2. Identify core components
3. Design interactions
4. Define classes and methods

## Requirements Clarification

We need to design an **in-memory file system** that supports:

* `mkdir` - create directories
* `cd` - change directory
* `pwd` - print working directory

Key considerations:

* Only directories for now (no files)
* Support both absolute (`/a/b`) and relative (`a/b`) paths
* Handle special symbols like `.` (current) and `..` (parent)
* Auto-create parent directories during `mkdir` if they don't exist

## Core Components

### Directory Node

Each directory is represented as a node in a tree structure:

* **Purpose**: Represents a folder that can contain subfolders
* **Structure**: Each node has one parent and multiple children
* **Why a tree?** File system relationships are naturally hierarchical

### File System Class

The main orchestrator that manages the entire system:

* **State**: Tracks the current working directory
* **Operations**: Exposes `mkdir`, `cd`, and `pwd` methods
* **Separation of concerns**: Structure (Directory) vs. behavior (FileSystem)

## Why a Tree Structure?

File systems have hierarchical relationships that map perfectly to trees:

* Each directory has exactly one parent
* Can have multiple children
* No cycles (unlike graphs)

Using a flat map or list would make path traversal inefficient and lose the parent-child relationships that are fundamental to file systems.

## The Current Directory Pointer

A crucial component for relative path operations:

* **Needed for**: `cd` with relative paths like `../folder`
* **Without it**: Every operation would require full absolute paths from root
* **Tracks**: The user's current position in the tree

## Handling Edge Cases

### Path Resolution

* **Absolute paths**: Start from root (`/`)
* **Relative paths**: Start from current directory
* **Special cases**: `.` (current), `..` (parent), empty paths

### Directory Creation

* **Recursive creation**: `mkdir -p` behavior
* **Path validation**: Ensure valid directory names
* **Existence checks**: Handle existing directories gracefully

## Advanced Considerations

### Why Not a HashMap?

While HashMaps offer fast lookups, they have drawbacks:

* **Pros**: O(1) access to any directory
* **Cons**: Complex path traversal, loss of hierarchical relationships

### Concurrency

For multi-user systems:

* **Thread safety**: Synchronize access to the tree
* **Locking strategies**: Directory-level vs. file-level locks
* **Deadlock prevention**: Careful ordering of lock acquisition

### Scaling for Large Directories

When directories contain thousands of subdirectories:

* **Trie-like structures**: Prefix-based organization
* **B-Trees**: Sorted access for range queries
* **Sharding**: Distribute across multiple nodes

### Persistence

Moving from memory to disk:

* **Serialization**: Convert the tree to bytes
* **Storage options**: Flat files, databases, key-value stores
* **Metadata**: Store path-to-node mappings

## Time Complexity Analysis

* `mkdir` → O(path length) for traversal + O(1) for creation
* `cd` → O(path length) for traversal
* `pwd` → O(tree depth) for path reconstruction

**Optimization**: Path caching can reduce these to near O(1) for frequently accessed directories.

## My Handwritten Notes

For detailed handwritten notes on this topic, check out my [Notes page](/notes).

## Conclusion

File system design teaches us about hierarchical data structures, path resolution algorithms, and the trade-offs between simplicity and performance. These concepts apply far beyond file systems to any tree-based data model in software engineering.

Understanding these fundamentals will help you design better systems and ace those system design interviews.