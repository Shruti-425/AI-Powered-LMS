export const getAiReply = (prompt) => {
  const text = prompt.toLowerCase().trim();

  if (text.includes("merge sort")) {
    return "Merge Sort divides the array into halves, sorts each half recursively, and merges them. Time complexity is O(n log n) and it is a stable sorting algorithm.";
  }
  if (text.includes("binary search")) {
    return "Binary Search works on sorted arrays. It repeatedly divides the search interval in half by comparing the target with the middle element. Time complexity is O(log n).";
  }
  if (/\bsql\b/.test(text) || text.includes("structured query language")) {
    return "SQL (Structured Query Language) is used to manage relational databases. It lets you query and update data using commands like SELECT (read rows), INSERT (add rows), UPDATE (modify rows), DELETE (remove rows), and JOIN (combine tables).";
  }
  if (text.includes("normalization") || text.includes("1nf") || text.includes("2nf") || text.includes("3nf")) {
    return "Normalization reduces data redundancy in databases. 1NF removes repeating groups, 2NF removes partial dependencies, and 3NF removes transitive dependencies.";
  }
  if (text.includes("dbms") || text.includes("database")) {
    return "A DBMS (Database Management System) stores data in tables with relationships. Examples include MySQL and PostgreSQL. Key concepts: tables, keys, queries, transactions, and ACID properties.";
  }
  if (text.includes("select") || text.includes("insert") || text.includes("join")) {
    return "In SQL: SELECT retrieves data, INSERT adds new rows, UPDATE changes existing rows, DELETE removes rows, and JOIN combines rows from multiple tables based on a related column.";
  }
  if (text.includes("cloud") || text.includes("aws") || text.includes("ec2") || text.includes("s3")) {
    return "AWS EC2 provides virtual servers, while S3 provides object storage. Together they are commonly used to deploy and host web applications in the cloud.";
  }
  if (text.includes("stack") || text.includes("queue")) {
    return "A stack follows LIFO (Last In, First Out) while a queue follows FIFO (First In, First Out). Stacks are used in recursion and undo operations; queues are used in scheduling and BFS.";
  }
  if (text.includes("deadlock")) {
    return "Deadlock occurs when two or more processes are waiting for resources held by each other. Prevention strategies include resource ordering, timeouts, and avoiding hold-and-wait.";
  }
  if (text.includes("rubric") || text.includes("linked list")) {
    return "For a linked list assignment rubric (100 marks): Correctness 40, Code structure 20, Memory management 15, Documentation 10, Edge cases 15.";
  }
  if (text.includes("mcq") || text.includes("quiz")) {
    return "Sample MCQ tip: test one clear concept per question, use 4 options, and include plausible distractors. Ask about time complexity, definitions, or output of small examples.";
  }

  return "I can help with SQL, DBMS, DSA, Cloud, and OS topics. Try asking: \"What is SQL?\", \"Explain merge sort\", \"What is normalization?\", or \"What is AWS EC2?\"";
};
