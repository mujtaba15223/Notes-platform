import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { env } from "../config/env.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import Note from "../models/Note.js";

const subjectsData = [
  {
    name: "Data Structures",
    code: "CS201",
    description: "Fundamental data structures and algorithms",
    semester: 3,
  },
  {
    name: "Database Management Systems",
    code: "CS301",
    description: "Relational databases, SQL, and database design",
    semester: 4,
  },
  {
    name: "Operating Systems",
    code: "CS302",
    description: "Process management, memory management, file systems",
    semester: 4,
  },
  {
    name: "Computer Networks",
    code: "CS303",
    description: "Network protocols, TCP/IP, routing, and security",
    semester: 5,
  },
  {
    name: "Machine Learning",
    code: "CS401",
    description: "Supervised and unsupervised learning, neural networks",
    semester: 6,
  },
  {
    name: "Web Development",
    code: "CS402",
    description: "Frontend, backend, and full-stack development",
    semester: 6,
  },
];

const topicsData = {
  "Data Structures": [
    { name: "Arrays", description: "Array basics, operations, and applications" },
    { name: "Linked Lists", description: "Singly, doubly, and circular linked lists" },
    { name: "Stacks and Queues", description: "LIFO and FIFO data structures" },
    { name: "Trees", description: "Binary trees, BST, AVL, and B-trees" },
    { name: "Graphs", description: "Graph representations, traversal, and algorithms" },
    { name: "Hash Tables", description: "Hash functions, collision resolution" },
    { name: "Sorting Algorithms", description: "Comparison and non-comparison sorts" },
    { name: "Searching Algorithms", description: "Linear, binary, and advanced search" },
  ],
  "Database Management Systems": [
    { name: "Relational Model", description: "Tables, keys, and relationships" },
    { name: "SQL", description: "DDL, DML, DCL, and advanced queries" },
    { name: "Normalization", description: "1NF, 2NF, 3NF, BCNF" },
    { name: "Transactions", description: "ACID properties, concurrency control" },
    { name: "Indexing", description: "B+ trees, hash indexes, query optimization" },
    { name: "NoSQL", description: "Document, key-value, column-family, graph databases" },
  ],
  "Operating Systems": [
    { name: "Process Management", description: "Processes, threads, scheduling" },
    { name: "Memory Management", description: "Virtual memory, paging, segmentation" },
    { name: "File Systems", description: "File organization, directory structure" },
    { name: "Deadlocks", description: "Prevention, avoidance, detection, recovery" },
    { name: "I/O Systems", description: "Device management, disk scheduling" },
  ],
  "Computer Networks": [
    { name: "Physical Layer", description: "Transmission media, encoding" },
    { name: "Data Link Layer", description: "Framing, error control, flow control" },
    { name: "Network Layer", description: "IP, routing algorithms, IPv6" },
    { name: "Transport Layer", description: "TCP, UDP, congestion control" },
    { name: "Application Layer", description: "HTTP, DNS, SMTP, FTP" },
    { name: "Network Security", description: "Encryption, authentication, firewalls" },
  ],
  "Machine Learning": [
    { name: "Supervised Learning", description: "Regression, classification, evaluation" },
    { name: "Unsupervised Learning", description: "Clustering, dimensionality reduction" },
    { name: "Neural Networks", description: "Perceptrons, backpropagation, deep learning" },
    { name: "Decision Trees", description: "CART, random forests, gradient boosting" },
    { name: "Model Evaluation", description: "Cross-validation, metrics, bias-variance" },
  ],
  "Web Development": [
    { name: "HTML & CSS", description: "Semantic HTML, Flexbox, Grid, responsive design" },
    { name: "JavaScript", description: "ES6+, DOM manipulation, async programming" },
    { name: "React", description: "Components, hooks, state management" },
    { name: "Node.js", description: "Express, middleware, REST APIs" },
    { name: "Databases", description: "MongoDB, PostgreSQL, ORMs" },
    { name: "Deployment", description: "Docker, CI/CD, cloud platforms" },
  ],
};

const usersData = [
  {
    name: "Admin User",
    email: "admin@notesplatform.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Sricharan",
    email: "sricharan@example.com",
    password: "student123",
    role: "student",
    bio: "Computer Science student passionate about algorithms and web development",
  },
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    password: "student123",
    role: "student",
    bio: "Final year CS student, interested in ML and databases",
  },
  {
    name: "Rahul Kumar",
    email: "rahul@example.com",
    password: "student123",
    role: "student",
    bio: "Software engineering enthusiast, love building web apps",
  },
  {
    name: "Anita Singh",
    email: "anita@example.com",
    password: "student123",
    role: "student",
    bio: "Data structures and algorithms lover, competitive programmer",
  },
];

const sampleNotes = [
  {
    title: "Array Basics and Operations",
    description: "Comprehensive notes on array fundamentals, time complexity, and common operations",
    subject: "Data Structures",
    topic: "Arrays",
    tags: ["arrays", "basics", "time-complexity", "fundamentals"],
  },
  {
    title: "Dynamic Array Implementation",
    description: "Deep dive into dynamic arrays, resizing strategies, and amortized analysis",
    subject: "Data Structures",
    topic: "Arrays",
    tags: ["dynamic-arrays", "amortized-analysis", "implementation"],
  },
  {
    title: "Singly Linked List Operations",
    description: "Complete guide to singly linked list insertion, deletion, and traversal",
    subject: "Data Structures",
    topic: "Linked Lists",
    tags: ["linked-lists", "singly", "operations", "pointers"],
  },
  {
    title: "Graph Traversal and Shortest Paths",
    description: "An introduction to graph representations, breadth-first search, depth-first search, and shortest paths",
    subject: "Data Structures",
    topic: "Graphs",
    tags: ["graphs", "bfs", "dfs", "shortest-path"],
  },
  {
    title: "Binary Search Tree Implementation",
    description: "BST properties, insertion, deletion, and balancing techniques",
    subject: "Data Structures",
    topic: "Trees",
    tags: ["bst", "binary-tree", "balanced-trees", "algorithms"],
  },
  {
    title: "SQL Joins Explained",
    description: "Inner, left, right, full outer joins with examples and performance tips",
    subject: "Database Management Systems",
    topic: "SQL",
    tags: ["sql", "joins", "queries", "database"],
  },
  {
    title: "Database Normalization Guide",
    description: "Step-by-step normalization from 1NF to BCNF with practical examples",
    subject: "Database Management Systems",
    topic: "Normalization",
    tags: ["normalization", "1nf", "2nf", "3nf", "bcnf"],
  },
  {
    title: "Process Scheduling Algorithms",
    description: "FCFS, SJF, Round Robin, Priority scheduling with Gantt charts",
    subject: "Operating Systems",
    topic: "Process Management",
    tags: ["scheduling", "processes", "algorithms", "cpu"],
  },
  {
    title: "Virtual Memory and Paging",
    description: "Page tables, TLB, page replacement algorithms (FIFO, LRU, Optimal)",
    subject: "Operating Systems",
    topic: "Memory Management",
    tags: ["virtual-memory", "paging", "page-replacement", "tlb"],
  },
  {
    title: "TCP/IP Model and Protocols",
    description: "Four-layer model, TCP vs UDP, three-way handshake, congestion control",
    subject: "Computer Networks",
    topic: "Transport Layer",
    tags: ["tcp", "udp", "handshake", "congestion-control", "protocols"],
  },
  {
    title: "Routing Algorithms",
    description: "Distance vector, link state, path vector routing with examples",
    subject: "Computer Networks",
    topic: "Network Layer",
    tags: ["routing", "dijkstra", "bellman-ford", "bgp", "ospf"],
  },
  {
    title: "Linear Regression from Scratch",
    description: "Mathematical derivation, gradient descent implementation, and evaluation",
    subject: "Machine Learning",
    topic: "Supervised Learning",
    tags: ["linear-regression", "gradient-descent", "supervised", "mathematics"],
  },
  {
    title: "K-Means Clustering Tutorial",
    description: "Algorithm steps, initialization methods, elbow method, silhouette score",
    subject: "Machine Learning",
    topic: "Unsupervised Learning",
    tags: ["kmeans", "clustering", "unsupervised", "elbow-method"],
  },
  {
    title: "React Hooks Deep Dive",
    description: "useState, useEffect, useContext, useReducer, custom hooks patterns",
    subject: "Web Development",
    topic: "React",
    tags: ["react", "hooks", "usestate", "useeffect", "frontend"],
  },
  {
    title: "REST API Design Best Practices",
    description: "Resource naming, HTTP methods, status codes, versioning, pagination",
    subject: "Web Development",
    topic: "Node.js",
    tags: ["rest", "api", "design", "express", "backend"],
  },
];

const sampleNoteContent = {
  "Array Basics and Operations": [
    { heading: "Array model and complexity", points: ["An array stores values in contiguous memory; index i is at base address plus i multiplied by element size.", "Reading or replacing an element by index is O(1). Searching an unsorted array is O(n).", "Inserting or removing in the middle is O(n) because later elements must shift."] },
    { heading: "Core operations", points: ["Traversal visits each element once, so its time is O(n) and extra space is O(1).", "Linear search works on any array; binary search requires sorted data and halves the remaining range each step.", "Two-pointer scans can solve sorted pair and partition problems in O(n) after sorting or when the input is already ordered."] },
    { heading: "Worked example", points: ["For [4, 7, 9, 12], index 2 contains 9; inserting 8 at index 2 shifts 9 and 12 to the right.", "To find 12 in a sorted array, binary search checks the middle, discards the lower half, and repeats; the search takes O(log n).", "Choose arrays when fast indexed access and cache locality matter more than frequent middle insertions."] },
    { heading: "Review checklist", points: ["Check index bounds and empty-array cases before accessing an element.", "Distinguish an array's length from its final valid index, which is length minus one.", "State time and auxiliary-space complexity for each operation."] },
  ],
  "Dynamic Array Implementation": [
    { heading: "Representation", points: ["A dynamic array stores a pointer to a fixed-capacity buffer plus its current length and capacity.", "Appending is O(1) while spare capacity remains; a full buffer must allocate a larger block and copy elements.", "A common growth policy doubles capacity, balancing occasional copies against unused reserved space."] },
    { heading: "Amortized analysis", points: ["With doubling, the copies across n appends are bounded by a geometric sum: 1 + 2 + 4 + ... < 2n.", "Therefore a sequence of n appends costs O(n) total and O(1) amortized per append, although an individual resize costs O(n).", "Amortized cost is a sequence-wide guarantee; it is not the same as average-case probability."] },
    { heading: "Trade-offs and operations", points: ["Appending is amortized O(1), indexed access is O(1), and inserting or deleting near the front remains O(n).", "Growing by a factor near one causes frequent copies; very large factors waste more memory.", "Shrinking should use a lower threshold than the growth threshold to prevent repeated grow-shrink oscillation."] },
    { heading: "Implementation checks", points: ["Before allocation, guard against capacity overflow and allocation failure.", "Copy exactly the live elements, update the pointer and capacity only after successful allocation, then release the old buffer.", "Test empty, full, resize, and repeated append cases."] },
  ],
  "Singly Linked List Operations": [
    { heading: "Node structure", points: ["Each singly linked node contains a value and a reference to the next node; the final node points to null.", "A head reference identifies the first node. Maintaining a tail reference makes append O(1).", "Unlike arrays, nodes need not be adjacent in memory and do not support constant-time indexed access."] },
    { heading: "Insertion and deletion", points: ["Insert at the head by linking the new node to the old head, then updating head; this is O(1).", "Insert after a known node by changing two links; finding a position first still costs O(n).", "Deleting after a known predecessor is O(1); deleting by value requires a traversal and predecessor tracking."] },
    { heading: "Traversal and complexity", points: ["Walk from head by following next until null; traversal and search are O(n).", "A list uses O(n) node storage plus one or more link fields per node.", "A singly linked list cannot move backward without another traversal; a doubly linked list stores a previous link at extra memory cost."] },
    { heading: "Correctness checks", points: ["Handle empty-list insertion and deletion, single-node deletion, head changes, and tail changes.", "Never dereference a null link; detach removed nodes when the language/runtime requires cleanup.", "Use slow and fast pointers to detect cycles in O(n) time and O(1) extra space."] },
  ],
  "Graph Traversal and Shortest Paths": [
    { heading: "Graph representation", points: ["A graph is G = (V, E); edges may be directed or undirected and may carry weights.", "An adjacency list uses O(V + E) space and is efficient for sparse graphs.", "An adjacency matrix uses O(V squared) space and gives O(1) edge-existence checks."] },
    { heading: "Breadth-first and depth-first search", points: ["BFS uses a queue, marks vertices when enqueued, and finds shortest paths by edge count in an unweighted graph.", "DFS uses recursion or an explicit stack and supports connected-component, cycle, and topological-order algorithms.", "Both traversals run in O(V + E) with adjacency lists; store a visited set to avoid revisiting cycles."] },
    { heading: "Shortest paths", points: ["Dijkstra's algorithm finds nonnegative-weight shortest paths; with a binary heap it is typically O((V + E) log V).", "Bellman-Ford supports negative edges and detects reachable negative cycles in O(VE).", "For an unweighted graph, BFS gives shortest paths in O(V + E); reconstruct a route using predecessor links."] },
    { heading: "Worked checks", points: ["Initialize source distance to zero and all other distances to infinity.", "Relax edge (u, v, w) when distance[u] + w is smaller than distance[v].", "Do not use Dijkstra when negative edge weights are present."] },
  ],
  "Binary Search Tree Implementation": [
    { heading: "BST invariant", points: ["For each node, values in its left subtree are smaller and values in its right subtree are larger, subject to the chosen duplicate policy.", "Search, insert, and delete take O(h), where h is tree height; a skewed tree can have h = n.", "An in-order traversal returns keys in sorted order and runs in O(n)."] },
    { heading: "Operations", points: ["Search follows one branch at each comparison until a matching key or null is reached.", "Deleting a leaf removes it directly; deleting a node with one child links its parent to that child.", "For two children, replace with the in-order successor (minimum of the right subtree) or predecessor, then remove that replacement node."] },
    { heading: "Balancing", points: ["A balanced tree keeps height O(log n), giving logarithmic search and update operations.", "AVL trees maintain a strict height-balance condition and use rotations after updates.", "Red-black trees enforce color invariants that bound height while requiring fewer rotations in many workloads."] },
    { heading: "Testing", points: ["Test empty trees, root deletion, missing keys, duplicate keys, and ascending insertion order.", "After every mutation, verify the ordering invariant and the node count.", "Use iterative traversal when recursion depth could exceed the runtime stack."] },
  ],
  "SQL Joins Explained": [
    { heading: "Join fundamentals", points: ["A join combines rows using a predicate, commonly a foreign-key to primary-key equality.", "INNER JOIN returns matching row pairs only.", "LEFT JOIN returns every left row and fills right-side columns with NULL when no match exists."] },
    { heading: "Join variants", points: ["RIGHT JOIN preserves all right-side rows; swapping table order often makes the same query easier to read as LEFT JOIN.", "FULL OUTER JOIN preserves unmatched rows from both sides where the database supports it.", "CROSS JOIN produces every pair of rows and can grow to the product of both table sizes."] },
    { heading: "Example and NULL behavior", points: ["SELECT s.name, e.course_id FROM students s LEFT JOIN enrollments e ON e.student_id = s.id preserves students with no enrollment.", "A WHERE condition on the right table can remove NULL-extended rows and effectively turn a left join into an inner join.", "Put optional right-side filters in the ON clause when unmatched left rows must remain."] },
    { heading: "Performance", points: ["Index join keys used for lookups and inspect the query plan before optimizing.", "Filter early when it preserves query meaning, and select only the columns needed.", "Check for duplicate join keys: one left row can match multiple right rows and increase result cardinality."] },
  ],
  "Database Normalization Guide": [
    { heading: "Why normalize?", points: ["Normalization organizes relational data to reduce duplicate facts and prevent insert, update, and delete anomalies.", "A functional dependency X -> Y means each X value determines exactly one Y value.", "Decompose tables carefully and preserve keys and dependencies where possible."] },
    { heading: "Normal forms", points: ["1NF requires atomic column values and rows identifiable by a key; do not store repeating groups in one field.", "2NF requires 1NF and every non-key attribute to depend on the whole candidate key, not a proper subset.", "3NF requires 2NF and removes transitive dependencies of non-key attributes on a key.", "BCNF requires every determinant in a nontrivial functional dependency to be a superkey."] },
    { heading: "Example", points: ["If Enrollment(student_id, course_id, student_name, grade) uses a composite key and student_name depends only on student_id, it violates 2NF.", "Move student attributes to Student(student_id, student_name); keep course-specific grade in Enrollment.", "The decomposition avoids repeating a student's name for each course and keeps updates consistent."] },
    { heading: "Design trade-offs", points: ["Use foreign keys and constraints to enforce relationships and valid references.", "Normalization is a correctness baseline; denormalization may be justified for measured read performance.", "Document the source of duplicated values and keep them synchronized if denormalization is used."] },
  ],
  "Process Scheduling Algorithms": [
    { heading: "Scheduling goals", points: ["A scheduler chooses a ready process to use the CPU; goals include throughput, response time, waiting time, and fairness.", "Turnaround time is completion time minus arrival time; waiting time is turnaround minus CPU burst for a single-burst example.", "Preemptive algorithms can interrupt a running process; non-preemptive algorithms wait until it blocks or finishes."] },
    { heading: "Common algorithms", points: ["FCFS is simple and non-preemptive but can cause the convoy effect when a long job blocks short jobs.", "Shortest Job First minimizes average waiting time when burst lengths are known; its preemptive form is shortest remaining time first.", "Round Robin gives each ready process a time quantum and is responsive for interactive workloads.", "Priority scheduling selects by priority; aging can reduce starvation by gradually increasing waiting processes' priorities."] },
    { heading: "Gantt chart example", points: ["For bursts P1=5, P2=3, P3=1 arriving together, FCFS order P1,P2,P3 gives waiting times 0,5,8.", "Round Robin with quantum 2 rotates unfinished processes after each two units, improving initial response at the cost of context switches.", "Always state arrival times, tie-breaking, preemption rules, and the quantum when calculating results."] },
    { heading: "Evaluation", points: ["Compute per-process metrics from the schedule, then report averages without hiding starvation or response behavior.", "A very small quantum increases context-switch overhead; a very large quantum approaches FCFS.", "Real operating systems combine policies and account for I/O blocking and multiple cores."] },
  ],
  "Virtual Memory and Paging": [
    { heading: "Address translation", points: ["Virtual memory maps a process's virtual address space to physical frames, isolating processes and allowing address spaces larger than RAM.", "A virtual address splits into a virtual page number and page offset; the offset is unchanged during translation.", "A page table maps virtual pages to frames and stores permission and status bits."] },
    { heading: "TLB and page faults", points: ["A translation lookaside buffer caches recent page-table entries to reduce translation latency.", "A TLB miss requires a page-table walk but is not automatically a page fault.", "A page fault occurs when a referenced page is not resident; the OS loads it, updates mappings, and retries the instruction."] },
    { heading: "Replacement algorithms", points: ["FIFO evicts the oldest loaded page and can exhibit Belady's anomaly.", "LRU evicts the least recently used page and approximates locality, though exact tracking can be costly.", "Optimal replacement evicts the page whose next use is farthest away; it is a theoretical benchmark, not implementable without future knowledge."] },
    { heading: "Worked calculation", points: ["For page size 4096 bytes, virtual address 0x12345 has page number 0x12 and offset 0x345.", "If page 0x12 maps to frame 7, the physical address is frame base 7*4096 plus offset 0x345.", "Track page references and resident frames explicitly when counting faults for a replacement policy."] },
  ],
  "TCP/IP Model and Protocols": [
    { heading: "Four-layer model", points: ["Application protocols such as HTTP, DNS, and SMTP use transport services.", "Transport layer TCP provides reliable ordered byte streams; UDP provides datagrams without built-in delivery guarantees.", "Internet layer IP addresses and forwards packets across networks; link layer handles delivery on a local medium."] },
    { heading: "TCP connection and reliability", points: ["The three-way handshake is SYN, SYN-ACK, ACK; it synchronizes sequence numbers and establishes connection state.", "TCP numbers bytes, acknowledges received data, retransmits lost segments, and uses a receive window for flow control.", "Congestion control adjusts sending behavior based on network congestion; flow control protects the receiver."] },
    { heading: "TCP versus UDP", points: ["Use TCP when reliable ordered delivery is useful, such as web pages and file transfer.", "UDP suits applications that implement their own timing or loss handling, such as real-time voice or some DNS queries.", "Neither protocol is universally faster; measure latency, overhead, and application requirements."] },
    { heading: "Troubleshooting", points: ["DNS resolves names to records; a DNS failure can prevent a connection before TCP starts.", "A successful TCP handshake does not prove that an application request or TLS negotiation succeeded.", "Use packet captures to distinguish name resolution, routing, handshake, retransmission, and application-layer failures."] },
  ],
  "Routing Algorithms": [
    { heading: "Routing problem", points: ["A router selects a next hop for a destination using a routing table and a route metric.", "Link-state protocols distribute topology information and compute shortest paths locally.", "Distance-vector protocols exchange reachability and costs with neighbors."] },
    { heading: "Algorithms", points: ["Dijkstra's algorithm repeatedly finalizes the closest unsettled vertex and relaxes its outgoing edges.", "Bellman-Ford uses repeated edge relaxation and can handle negative edge costs; networking protocols add safeguards against instability.", "BGP is a path-vector protocol that exchanges reachability between autonomous systems and applies policy, not merely shortest distance."] },
    { heading: "Worked shortest-path example", points: ["For edges A-B=2, A-C=5, B-C=1, Dijkstra from A first sets B=2 and C=5.", "Processing B improves C to 3 via A-B-C; record B as C's predecessor.", "The path is reconstructed by following predecessor links backward from the destination."] },
    { heading: "Convergence and loops", points: ["Distance-vector protocols can suffer count-to-infinity after failures; split horizon and poisoned reverse reduce some loops.", "Link-state flooding and recomputation help converge after topology changes but require memory and CPU.", "Administrative policy, equal-cost paths, and failure detection affect real route selection."] },
  ],
  "Linear Regression from Scratch": [
    { heading: "Model and loss", points: ["For one feature, linear regression predicts y_hat = w*x + b; for multiple features, y_hat = Xw + b.", "Mean squared error is the mean of (prediction - target) squared and penalizes large errors strongly.", "Fit parameters by minimizing the loss on training data, then evaluate on held-out data."] },
    { heading: "Gradient descent", points: ["For MSE with n examples, gradient for w is (2/n) times X-transpose multiplied by prediction error; gradient for b is (2/n) times the sum of errors.", "Update each parameter by subtracting learning_rate times its gradient.", "A learning rate that is too high can diverge; one that is too low converges slowly."] },
    { heading: "Practical workflow", points: ["Standardize features when scales differ greatly to make gradient descent better conditioned.", "Add an intercept term or keep b as a separate parameter.", "Plot training loss across iterations; a steadily falling loss is a useful sanity check."] },
    { heading: "Evaluation and assumptions", points: ["MAE is the mean absolute error; RMSE is the square root of MSE and remains in target units.", "R-squared compares model error with predicting the target mean; it is not proof of causality.", "Inspect residuals for nonlinearity, changing variance, outliers, and leakage between training and test data."] },
  ],
  "K-Means Clustering Tutorial": [
    { heading: "Objective", points: ["K-means partitions numeric observations into k clusters by minimizing the sum of squared distances to assigned centroids.", "Each cluster centroid is the coordinate-wise mean of its assigned points.", "Because distance depends on scale, standardize features when their units or ranges differ."] },
    { heading: "Algorithm", points: ["Choose k initial centroids, often with k-means++ to spread starting points.", "Assign every observation to its nearest centroid, then recompute each centroid as its cluster mean.", "Repeat assignment and update until assignments stop changing, centroid movement is small, or an iteration limit is reached."] },
    { heading: "Choosing k and evaluating", points: ["The elbow method plots within-cluster sum of squares against k and looks for diminishing improvement.", "Silhouette score compares within-cluster cohesion with separation from the nearest other cluster; values near 1 indicate clearer assignments.", "Run multiple initializations because the objective can converge to different local minima."] },
    { heading: "Limitations", points: ["K-means is sensitive to outliers and favors roughly spherical, similarly sized clusters under Euclidean distance.", "Empty clusters need a defined reinitialization policy.", "Use domain judgment and visual inspection; a metric alone does not establish that clusters are meaningful."] },
  ],
  "React Hooks Deep Dive": [
    { heading: "State and effects", points: ["useState adds component state; the setter schedules a render and functional updates avoid stale values when the next state depends on the previous one.", "useEffect synchronizes with external systems after rendering; include every reactive value read by the effect in its dependency list.", "Return cleanup from an effect to unsubscribe, clear timers, or cancel obsolete work."] },
    { heading: "Context and reducers", points: ["useContext reads the nearest provider value and is useful for shared state such as the authenticated user.", "useReducer centralizes transitions as reducer(state, action) and can make multi-step state updates easier to test.", "Keep context values stable when appropriate to avoid unnecessary consumer renders."] },
    { heading: "Custom hooks and rules", points: ["A custom hook is a function named with the use prefix that composes other hooks and shares stateful logic.", "Call hooks only at the top level of a React component or custom hook, never conditionally or inside loops.", "Hooks share logic, not one shared state instance; each component invocation has its own state."] },
    { heading: "Common mistakes", points: ["Do not omit effect dependencies to silence lint warnings; restructure the effect or stabilize callbacks when necessary.", "Avoid using effects to calculate values that can be derived during render.", "Use stable keys for list items so React can preserve the intended component identity."] },
  ],
  "REST API Design Best Practices": [
    { heading: "Resources and methods", points: ["Model URLs as nouns such as /notes and /notes/{id}; use HTTP methods to describe the operation.", "GET reads, POST creates or triggers a subordinate action, PUT replaces, PATCH partially updates, and DELETE removes.", "Keep representations consistent and return the created resource with 201 Created when useful."] },
    { heading: "Status codes and errors", points: ["Use 200 for successful reads or updates, 201 for creation, 204 for success without a body, and 400 for invalid input.", "Use 401 for unauthenticated requests, 403 for forbidden actions, 404 for missing resources, and 409 for conflicts.", "Return a stable error shape with a clear message; do not expose stack traces or secrets to clients."] },
    { heading: "Validation and security", points: ["Validate identifiers, body fields, query parameters, file sizes, and uploaded content on the server.", "Enforce authorization for each resource, not just for a route group; never trust a client-supplied owner or role.", "Use HTTPS in production, secure cookies or tokens, rate limits for sensitive endpoints, and safe output handling."] },
    { heading: "Pagination and operations", points: ["Use bounded pagination and return total or next-page metadata; reject invalid or excessive limits.", "Allowlist sortable fields and filter parameters rather than passing arbitrary client keys to database operations.", "Document endpoints, request and response shapes, authentication, and expected error codes; log request IDs without logging credentials."] },
  ],
};

function wrapText(value, maxLength) {
  const words = String(value).split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    if (line && `${line} ${word}`.length > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function createSamplePdf(note) {
  const escapeText = (value) =>
    String(value)
      .replace(/[^\x20-\x7e]/g, " ")
      .replace(/[\\()]/g, "\\$&");
  const sections = sampleNoteContent[note.title] || [];
  const entries = [
    { text: note.title, font: "F2", size: 18, gap: 10 },
    { text: `Subject: ${note.subject}    Topic: ${note.topic}`, font: "F1", size: 9, gap: 14 },
    { text: "Overview", font: "F2", size: 13, gap: 4 },
    { text: note.description, font: "F1", size: 10, gap: 8 },
  ];

  for (const section of sections) {
    entries.push({ text: section.heading, font: "F2", size: 12, gap: 3 });
    for (const point of section.points) {
      entries.push({ text: `- ${point}`, font: "F1", size: 10, gap: 2 });
    }
    entries.push({ text: "", font: "F1", size: 10, gap: 7 });
  }

  const pages = [[]];
  let y = 744;
  for (const entry of entries) {
    const maxLength = Math.floor(504 / (entry.size * 0.52));
    const lines = entry.text ? wrapText(entry.text, maxLength) : [""];
    for (const line of lines) {
      const leading = Math.ceil(entry.size * 1.45);
      if (y < 54) {
        pages.push([]);
        y = 744;
      }
      if (line) {
        pages[pages.length - 1].push(
          `BT /${entry.font} ${entry.size} Tf 54 ${y} Td (${escapeText(line)}) Tj ET`
        );
      }
      y -= leading;
    }
    y -= entry.gap;
  }

  const fontObjectId = 3 + pages.length * 2;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
  ];
  pages.forEach((page, index) => {
    const pageObjectId = 3 + index * 2;
    const contentObjectId = pageObjectId + 1;
    const stream = page.join("\n");
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectId} 0 R /F2 ${fontObjectId + 1} 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
      `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`
    );
  });
  objects.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  );

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const crossReferenceOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${crossReferenceOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "ascii");
}

async function seedDatabase() {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log("Connected to MongoDB");

    const users = [];
    for (const userData of usersData) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = new User(userData);
        await user.save();
      }
      users.push(user);
    }

    const adminUser = users.find((user) => user.role === "admin");
    const studentUsers = users.filter((user) => user.role === "student");

    const createdSubjects = [];
    for (const subjectData of subjectsData) {
      const subject = await Subject.findOneAndUpdate(
        { code: subjectData.code },
        { $setOnInsert: { ...subjectData, createdBy: adminUser._id } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      createdSubjects.push(subject);
    }

    const subjectMap = new Map();
    createdSubjects.forEach((subject) => subjectMap.set(subject.name, subject._id));

    const topicMap = new Map();
    for (const [subjectName, topics] of Object.entries(topicsData)) {
      const subjectId = subjectMap.get(subjectName);
      if (!subjectId) continue;

      for (const topicData of topics) {
        const topic = await Topic.findOneAndUpdate(
          { subject: subjectId, name: topicData.name },
          {
            $setOnInsert: {
              ...topicData,
              subject: subjectId,
              createdBy: adminUser._id,
            },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        topicMap.set(`${subjectId}-${topic.name}`, topic._id);
      }
    }

    fs.mkdirSync(env.storagePath, { recursive: true });
    let createdNotes = 0;
    for (const [index, noteData] of sampleNotes.entries()) {
      const subjectId = subjectMap.get(noteData.subject);
      const topicId = topicMap.get(`${subjectId}-${noteData.topic}`);

      if (!subjectId || !topicId) continue;

      const uploader = studentUsers[index % studentUsers.length];
      const fileName = `sample-${noteData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}.pdf`;
      const filePath = path.join(env.storagePath, fileName);
      fs.writeFileSync(filePath, createSamplePdf(noteData));

      const result = await Note.updateOne(
        { title: noteData.title, subject: subjectId, topic: topicId },
        {
          $setOnInsert: {
            ...noteData,
            subject: subjectId,
            topic: topicId,
            uploadedBy: uploader._id,
            isApproved: true,
          },
          $set: {
            fileUrl: `/uploads/${fileName}`,
            fileName: `${noteData.title}.pdf`,
            fileType: "pdf",
            fileSize: fs.statSync(filePath).size,
          },
        },
        { upsert: true }
      );
      if (result.upsertedCount) createdNotes += 1;
    }

    console.log(
      `Seed complete: ${users.length} demo users, ${createdSubjects.length} subjects, ${topicMap.size} topics, ${createdNotes} new notes. Existing records were preserved.`
    );
    console.log("Demo admin: admin@notesplatform.com / admin123");
    console.log("Demo student: sricharan@example.com / student123");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    console.log("Disconnected from MongoDB");
  }
}

seedDatabase();