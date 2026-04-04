---
title: "LLD Interview: File System Design (mkdir, cd, pwd) in C++"
slug: "file-system-design-lld-cpp"
date: "2026-03-21"
draft: false
author: ["Me"]
description: "Step-by-step Low Level Design of a File System supporting mkdir, cd, and pwd in C++. Beginner friendly, SDE-2 interview style."
tags: ["lld", "system-design", "cpp", "interview", "sde2"]
categories: ["Low Level Design"]
keywords: ["lld", "low level design", "file system design", "c++", "sde2 interview", "mkdir cd pwd"]
showtoc: true
tocopen: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowCodeCopyButtons: true
ShowWordCount: true
cover:
  image: ""
  alt: "File System LLD Design"
  caption: "Low Level Design — File System in C++"
  relative: false
  hidden: true
---

## Problem in Simple Words

Think of it like **Windows File Explorer** or a **Linux terminal** only.

- You start from **root folder** (`/`)
- You can **create folders**, **go inside them**, and **print where you are sitting right now**

---

# ## Step 1 — Requirements

### Functional (what it should do)

- Create new directory → `mkdir photos`
- Move inside a directory → `cd photos`
- Move back → `cd ..`
- Jump to any path → `cd /home/user/photos`
- Print current path → `pwd`

### Non-Functional (how it should behave)

- Lookup of folders should be fast
- Same name folder should not repeat in one place (no duplicates)
- On wrong path it should not crash

---

## Step 2 — Core Objects

Everything in this system is a **Directory** only — and we are forming a **tree structure** like this:

```
/                         ← root
├── home
│   └── user
│       └── photos
└── etc
```

| Object | What it represents |
|--------|-------------------|
| `Directory` | One single folder in the tree |
| `FileSystem` | Whole system — holds root and tracks where you are |

Just **2 classes.** Simple only.

---

## Step 3 — Class Design

### Directory Class

| Variable | Type | Why needed |
|----------|------|------------|
| `name` | `string` | To identify the folder |
| `parent` | `Directory*` | For going back with `cd ..` |
| `children` | `map<string, Directory*>` | To find folders inside (fast lookup) |

### FileSystem Class

| Variable | Type | Why needed |
|----------|------|------------|
| `root` | `Directory*` | Points to `/` (starting point) |
| `current` | `Directory*` | Points where you are right now |

| Method | What it does |
|--------|--------------|
| `mkdir(name)` | Creates new folder inside `current` |
| `cd(path)` | Changes `current` pointer |
| `pwd()` | Prints path from `root` till `current` |

---

## Step 4 — Relationships

- **Directory has parent** (composition) → `Directory* parent`
- **Directory has children map** (composition) → `map<string, Directory*>`
- **FileSystem has root and current** (composition)
- **FileSystem uses Directory** (association)

This is classic **tree data structure** where each node is pointing to parent and children both.

---

## Step 5 — Logic Explained Simply

### mkdir logic

1. Check if folder already exists in `current` — if yes then print error
2. Create new `Directory` object with name and `current` as parent
3. Add it in `current->children` map

### pwd logic

- Travel from `current` to parent to parent ... till root
- It is like **linked list traversal** only
- Push each name in **stack** (so that order can reverse)
- Pop one by one and build path string

### cd logic — 3 cases

| Case | Input | Action |
|------|-------|--------|
| Case 1 | `cd photos` | Move `current` to child named `photos` |
| Case 2 | `cd ..` | Move `current` to `current->parent` |
| Case 3 | `cd /home/user/photos` | Start from root, split path by `/`, walk down |

---

## Step 6 — Full C++ Code

```cpp
#include <iostream>
#include <map>
#include <stack>
#include <sstream>
using namespace std;

// ─────────────────────────────
// Directory Class
// ─────────────────────────────
class Directory {
public:
    string name;
    Directory* parent;
    map<string, Directory*> children;

    Directory(string name, Directory* parent) {
        this->name = name;
        this->parent = parent;
    }
};

// ─────────────────────────────
// FileSystem Class
// ─────────────────────────────
class FileSystem {
private:
    Directory* root;
    Directory* current;

public:
    // constructor — creates root "/"
    FileSystem() {
        this->root = new Directory("/", nullptr);
        this->current = root;
    }

    // create new folder inside current
    void mkdir(string name) {
        if (current->children.count(name)) {
            cout << "Error: Directory already exists!" << endl;
            return;
        }
        Directory* newDir = new Directory(name, current);
        current->children[name] = newDir;
        cout << "Directory '" << name << "' created!" << endl;
    }

    // move to folder
    void cd(string path) {
        // Case 2: go back
        if (path == "..") {
            if (current->parent == nullptr) {
                cout << "Error: Already at root!" << endl;
            } else {
                current = current->parent;
            }
        }
        // Case 3: full absolute path
        else if (path[0] == '/') {
            Directory* temp = root;
            stringstream ss(path);
            string part;

            while (getline(ss, part, '/')) {
                if (part.empty()) continue;
                if (temp->children.count(part)) {
                    temp = temp->children[part];
                } else {
                    cout << "Error: Path not found!" << endl;
                    return;
                }
            }
            current = temp;
        }
        // Case 1: go into child
        else {
            if (current->children.count(path)) {
                current = current->children[path];
            } else {
                cout << "Error: Directory not found!" << endl;
            }
        }
    }

    // print current path
    string pwd() {
        stack<string> st;
        Directory* temp = current;

        // push all names going up to root
        while (temp != nullptr) {
            st.push(temp->name);
            temp = temp->parent;
        }

        // pop and build path
        string path = "";
        while (!st.empty()) {
            string folder = st.top();
            st.pop();
            if (folder == "/") {
                path += "/";
            } else {
                path += folder + "/";
            }
        }
        return path;
    }
};

// ─────────────────────────────
// Main — Test it
// ─────────────────────────────
int main() {
    FileSystem fs;

    cout << fs.pwd() << endl;       // /

    fs.mkdir("home");
    fs.cd("home");
    cout << fs.pwd() << endl;       // /home/

    fs.mkdir("user");
    fs.cd("user");
    cout << fs.pwd() << endl;       // /home/user/

    fs.mkdir("photos");
    fs.cd("photos");
    cout << fs.pwd() << endl;       // /home/user/photos/

    fs.cd("..");
    cout << fs.pwd() << endl;       // /home/user/

    fs.cd("/home/user/photos");
    cout << fs.pwd() << endl;       // /home/user/photos/

    fs.mkdir("home");               // Error: already exists
    fs.cd("unknown");               // Error: not found

    return 0;
}
```

---

## Step 7 — Example Walkthrough

```
FileSystem starts → current = "/"
pwd()  →  "/"

mkdir("home")    → creates home inside /
cd("home")       → current = home
pwd()            → "/home/"

mkdir("user")    → creates user inside home
cd("user")       → current = user
pwd()            → "/home/user/"

mkdir("photos")  → creates photos inside user
cd("photos")     → current = photos
pwd()            → "/home/user/photos/"

cd("..")         → current = user
pwd()            → "/home/user/"

cd("/home/user/photos")  → start from root, walk down
pwd()            → "/home/user/photos/"
```

---

## Step 8 — Edge Cases

| Edge Case | How We Handle |
|-----------|---------------|
| `mkdir` with duplicate name | Print error, return early |
| `cd ..` at root | Print error (parent does not exist) |
| `cd` with wrong folder name | Print error, do not move |
| `cd /wrong/path` | Print error mid-walk, do not move |
| Empty parts after split by `/` | Skip with `if (part.empty()) continue` |

---

## Step 9 — Improvements (How to Scale)

| Improvement | Why |
|-------------|-----|
| Add **File** class (not only Directory) | Real file systems have files also |
| Add **permissions** (read/write/execute) | Security — who can access what |
| Add **`ls()` method** | List all children of current directory |
| Use **`shared_ptr`** instead of raw pointers | Avoid memory leaks |
| Add **move / rename / delete** operations | Full file system support |
| Add **symlinks** (shortcuts) | Like Windows shortcuts |

---

## Complexity Analysis

| Operation | Time Complexity | Why |
|-----------|-----------------|-----|
| `mkdir` | O(log n) | `map` insertion |
| `cd` (child) | O(log n) | `map` lookup |
| `cd` (absolute path) | O(d × log n) | d = depth of path |
| `pwd` | O(d) | d = depth of current node |

`n` = number of children in a directory  
`d` = depth of directory tree

---

## Key Concepts Used

| Concept | Where Used |
|---------|------------|
| **Tree data structure** | Directory hierarchy |
| **Linked list traversal** | `pwd()` going up to root |
| **Stack** | Reversing path in `pwd()` |
| **map** | Fast O(log n) child lookup |
| **Composition (has-a)** | Directory has children, FileSystem has root |
| **Pointers** | Navigating between nodes |

---

 