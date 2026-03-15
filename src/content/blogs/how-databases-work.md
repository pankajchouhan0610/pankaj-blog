—---
title: "How Databases Actually Work"
slug: "how-databases-work"
description: "A deep dive into what happens when you run a SQL query — from parsing to execution."
date: "2026-03-15"
tags: ["databases", "systems", "engineering"]
---

Every time you run `SELECT * FROM users WHERE id = 1`, a surprisingly complex set of operations happens under the hood. Let's break it down.

## The Query Lifecycle

A SQL query goes through several stages:

1. **Parsing** — the query string is tokenized and parsed into an AST (Abstract Syntax Tree)
2. **Semantic Analysis** — table and column names are validated against the schema
3. **Query Planning** — the optimizer picks the cheapest execution plan
4. **Execution** — the plan is executed, reading from disk or memory

## The Query Optimizer

The optimizer is arguably the most sophisticated component in any database engine. It considers:

- Available indexes
- Table statistics (row counts, cardinality)
- Join ordering
- Predicate pushdown

You can see the execution plan using `EXPLAIN ANALYZE`:

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;
```

This shows you the actual execution plan and real timing data — invaluable for debugging slow queries.

## Why Indexes Matter

Without an index, the database does a **full table scan** — reading every single row. With a B-tree index, it can jump directly to the matching rows in `O(log n)` time.

The difference between a 10ms query and a 10s query is often just a missing index.

## Transactions and ACID

Databases guarantee ACID properties:

- **Atomicity** — a transaction either fully completes or fully rolls back
- **Consistency** — the database moves from one valid state to another
- **Isolation** — concurrent transactions don't interfere with each other
- **Durability** — committed transactions survive crashes

Understanding these properties is essential for building reliable systems.

## Conclusion

Databases are incredibly sophisticated pieces of software. The more you understand their internals, the better you'll be at writing efficient queries and designing schemas that scale.
