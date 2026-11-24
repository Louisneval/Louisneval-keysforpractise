/**
 * Keys and Code: lesson content.
 * Author: LouisNeval
 *
 * This file holds data only. The trainer logic lives in app.js.
 *
 * Conventions:
 *  - `hint` is the instruction shown to the learner.
 *  - `win` / `mac` hold the text or shortcut for each system.
 *  - In editor lessons a "|" inside a text marks where the caret is.
 */
'use strict';

/* ==========================================================================
   Builders
   ========================================================================== */

/** A terminal command: the learner types it and sends it with Enter. */
const cmd = (hint, win, { mac = win, out = '', macOut = out, cd = '', ...extra } = {}) => ({
  kind: 'type',
  submit: true,
  hint,
  win,
  mac,
  out,
  macOut,
  cd,
  ...extra,
});

/** Free text typed inside an editor. Enter is part of the text. */
const typeText = (text, hint, extra = {}) => ({
  kind: 'type',
  submit: false,
  hint,
  text,
  indents: null,
  ...extra,
});

/** A keyboard shortcut. `effects` describe what it does on screen. */
const key = (win, mac, hint, effects = {}) => ({ kind: 'keys', win, mac, hint, ...effects });

/** One entry of the shortcut drill. The Mac shortcut defaults to the Windows one. */
const shortcut = (action, win, mac = win) => ({ action, win, mac });

/**
 * The five steps of writing a file with nano:
 * open it, type the content, save, confirm the name, exit.
 */
const nanoFile = (file, content) => [
  cmd(`Open ${file} in nano`, `nano ${file}`, { openNano: file }),
  typeText(content, 'Type the file content', { nano: true }),
  key('Ctrl+O', 'Ctrl+O', 'Save the file (Write Out)', { nanoPrompt: true }),
  key('Enter', 'Enter', 'Confirm the file name', { nanoSave: true }),
  key('Ctrl+X', 'Ctrl+X', 'Exit nano', { nanoExit: true }),
];

/* Steps that appear in many terminal lessons. */
const makeFolder = (name) => cmd('Create the folder', `mkdir ${name}`);
const enterFolder = (name) => cmd('Go into the folder', `cd ${name}`, { cd: name });

/* ==========================================================================
   Terminal lessons
   ========================================================================== */

const TERMINAL_LESSONS = [
  {
    id: 'py',
    title: 'Python: Hello World',
    tag: 'Python',
    steps: [
      makeFolder('hello'),
      enterFolder('hello'),
      ...nanoFile('hello.py', 'print("Hello, World!")'),
      cmd('Show the file contents', 'type hello.py', { mac: 'cat hello.py', catFile: 'hello.py' }),
      cmd('Check the Python version', 'python --version', { mac: 'python3 --version', out: 'Python 3.12.4' }),
      cmd('Run the program', 'python hello.py', { mac: 'python3 hello.py', out: 'Hello, World!' }),
    ],
  },
  {
    id: 'js',
    title: 'JavaScript: Node.js',
    tag: 'JS',
    steps: [
      makeFolder('hello'),
      enterFolder('hello'),
      ...nanoFile('hello.js', 'console.log("Hello, World!");'),
      cmd('Check the Node version', 'node --version', { out: 'v20.11.1' }),
      cmd('Run it', 'node hello.js', { out: 'Hello, World!' }),
    ],
  },
  {
    id: 'c',
    title: 'C: gcc',
    tag: 'C',
    steps: [
      makeFolder('hello'),
      enterFolder('hello'),
      ...nanoFile('hello.c', '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n}'),
      cmd('Compile', 'gcc hello.c -o hello'),
      cmd('Run it', 'hello', { mac: './hello', out: 'Hello, World!' }),
    ],
  },
  {
    id: 'cpp',
    title: 'C++: g++',
    tag: 'C++',
    steps: [
      makeFolder('hello'),
      enterFolder('hello'),
      ...nanoFile('hello.cpp', '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!\\n";\n}'),
      cmd('Compile', 'g++ hello.cpp -o hello'),
      cmd('Run it', 'hello', { mac: './hello', out: 'Hello, World!' }),
    ],
  },
  {
    id: 'java',
    title: 'Java: javac',
    tag: 'Java',
    steps: [
      makeFolder('hello'),
      enterFolder('hello'),
      ...nanoFile(
        'Hello.java',
        'class Hello {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      ),
      cmd('Compile', 'javac Hello.java'),
      cmd('Run the class', 'java Hello', { out: 'Hello, World!' }),
    ],
  },
  {
    id: 'go',
    title: 'Go: go run',
    tag: 'Go',
    steps: [
      makeFolder('hello'),
      enterFolder('hello'),
      cmd('Create the module', 'go mod init hello', { out: 'go: creating new go.mod: module hello' }),
      ...nanoFile('main.go', 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}'),
      cmd('Run it', 'go run .', { out: 'Hello, World!' }),
    ],
  },
  {
    id: 'rust',
    title: 'Rust: cargo',
    tag: 'Rust',
    steps: [
      cmd('Create the project', 'cargo new hello', { out: '    Creating binary (application) `hello` package' }),
      enterFolder('hello'),
      cmd('Build and run', 'cargo run', {
        out: '   Compiling hello v0.1.0\n    Finished `dev` profile\n     Running `target\\debug\\hello.exe`\nHello, world!',
        macOut: '   Compiling hello v0.1.0\n    Finished `dev` profile\n     Running `target/debug/hello`\nHello, world!',
      }),
    ],
  },
  {
    id: 'cs',
    title: 'C#: dotnet',
    tag: 'C#',
    steps: [
      cmd('Create a console project in folder hello', 'dotnet new console -o hello', {
        out: 'The template "Console App" was created successfully.',
      }),
      enterFolder('hello'),
      cmd('Run it', 'dotnet run', { out: 'Hello, World!' }),
    ],
  },
  {
    id: 'git',
    title: 'Git: first commit',
    tag: 'Git',
    steps: [
      makeFolder('shop'),
      enterFolder('shop'),
      cmd('Create the repository', 'git init', {
        out: 'Initialized empty Git repository in C:/dev/shop/.git/',
        macOut: 'Initialized empty Git repository in /Users/you/dev/shop/.git/',
      }),
      ...nanoFile('README.md', '# Shop'),
      cmd('Stage everything', 'git add .'),
      cmd('Make a commit', 'git commit -m "first commit"', {
        out: '[main (root-commit) 3f2a1b9] first commit\n 1 file changed, 1 insertion(+)\n create mode 100644 README.md',
      }),
      cmd('View the history', 'git log --oneline', { out: '3f2a1b9 (HEAD -> main) first commit' }),
    ],
  },
  {
    id: 'pip',
    title: 'Python: venv and pip',
    tag: 'pip',
    steps: [
      makeFolder('api'),
      enterFolder('api'),
      cmd('Create a virtual environment', 'python -m venv venv', { mac: 'python3 -m venv venv' }),
      cmd('Activate it', 'venv\\Scripts\\activate', { mac: 'source venv/bin/activate' }),
      cmd('Install requests', 'pip install requests', { out: 'Successfully installed requests-2.32.3' }),
      cmd('Save dependencies to a file', 'pip freeze > requirements.txt'),
      cmd('Show the file', 'type requirements.txt', {
        mac: 'cat requirements.txt',
        out: 'certifi==2024.8.30\ncharset-normalizer==3.3.2\nidna==3.8\nrequests==2.32.3\nurllib3==2.2.2',
      }),
    ],
  },
  {
    id: 'npm',
    title: 'npm: new project',
    tag: 'npm',
    steps: [
      makeFolder('app'),
      enterFolder('app'),
      cmd('Initialize package.json', 'npm init -y', {
        out: 'Wrote to C:\\dev\\app\\package.json',
        macOut: 'Wrote to /Users/you/dev/app/package.json',
      }),
      cmd('Install express', 'npm install express', { out: 'added 64 packages in 3s' }),
      ...nanoFile('index.js', 'console.log("ok");'),
      cmd('Run it', 'node index.js', { out: 'ok' }),
    ],
  },
];

/* ==========================================================================
   SQL lessons
   ========================================================================== */

const SQL_LESSONS = [
  {
    id: 's1',
    title: 'Table and first rows',
    tag: 'SQL',
    steps: [
      cmd('Create the users table', 'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER);'),
      cmd('Insert the first row', "INSERT INTO users VALUES (1, 'Anna', 25);"),
      cmd('Insert the second row', "INSERT INTO users VALUES (2, 'Oleg', 31);"),
      cmd('Select all rows', 'SELECT * FROM users;', {
        out: 'id | name | age\n---+------+----\n 1 | Anna |  25\n 2 | Oleg |  31\n(2 rows)',
      }),
      cmd('Select people older than 30', 'SELECT name FROM users WHERE age > 30;', { out: 'name\n----\nOleg' }),
    ],
  },
  {
    id: 's2',
    title: 'Update and delete',
    tag: 'SQL',
    steps: [
      cmd('Change the age of Anna', 'UPDATE users SET age = 26 WHERE id = 1;', { out: '1 row affected' }),
      cmd('Sort by age, descending', 'SELECT name, age FROM users ORDER BY age DESC;', {
        out: 'name | age\n-----+----\nOleg |  31\nAnna |  26',
      }),
      cmd('Delete everyone younger than 30', 'DELETE FROM users WHERE age < 30;', { out: '1 row affected' }),
      cmd('Count the rows left', 'SELECT COUNT(*) FROM users;', { out: 'COUNT(*)\n--------\n       1' }),
    ],
  },
  {
    id: 's3',
    title: 'JOIN and grouping',
    tag: 'SQL',
    steps: [
      cmd('Create the orders table', 'CREATE TABLE orders (id INTEGER, user_id INTEGER, total REAL);'),
      cmd('Insert three orders', 'INSERT INTO orders VALUES (1, 1, 19.90), (2, 1, 5.50), (3, 2, 40.00);', {
        out: '3 rows affected',
      }),
      cmd('Join users with their orders', 'SELECT u.name, o.total FROM users u JOIN orders o ON o.user_id = u.id;', {
        out: 'name | total\n-----+------\nAnna | 19.9\nAnna |  5.5\nOleg | 40.0',
      }),
      cmd('Total of orders per user', 'SELECT user_id, SUM(total) FROM orders GROUP BY user_id;', {
        out: 'user_id | SUM(total)\n--------+-----------\n      1 |       25.4\n      2 |       40.0',
      }),
      cmd('Users who have orders', 'SELECT name FROM users WHERE id IN (SELECT user_id FROM orders);', {
        out: 'name\n----\nAnna\nOleg',
      }),
    ],
  },
  {
    id: 's4',
    title: 'Index and transaction',
    tag: 'SQL',
    steps: [
      cmd('Create an index on name', 'CREATE INDEX idx_users_name ON users(name);'),
      cmd('Start a transaction', 'BEGIN TRANSACTION;'),
      cmd("Increase everyone's age", 'UPDATE users SET age = age + 1;', { out: '2 rows affected' }),
      cmd('Roll back the changes', 'ROLLBACK;'),
      cmd('Drop the table', 'DROP TABLE users;'),
    ],
  },
];

/* ==========================================================================
   Code snippets (typed whole; indentation is filled in automatically)
   ========================================================================== */

const CODE_SNIPPETS = [
  {
    id: 'c-py',
    title: 'Python: Fibonacci',
    tag: 'Python',
    lines: [
      'def fib(n):',
      '    a, b = 0, 1',
      '    for _ in range(n):',
      '        a, b = b, a + b',
      '    return a',
      '',
      'print([fib(i) for i in range(10)])',
    ],
  },
  {
    id: 'c-js',
    title: 'JavaScript: fetch',
    tag: 'JS',
    lines: [
      'async function getUser(id) {',
      '  const res = await fetch(`/api/users/${id}`);',
      '  if (!res.ok) throw new Error("Not found");',
      '  return res.json();',
      '}',
    ],
  },
  {
    id: 'c-cs',
    title: 'C#: LINQ',
    tag: 'C#',
    lines: [
      'var names = new List<string> { "Ann", "Oleg", "Ira" };',
      'var result = names',
      '    .Where(n => n.Length > 3)',
      '    .Select(n => n.ToUpper())',
      '    .ToList();',
    ],
  },
  {
    id: 'c-java',
    title: 'Java: loop',
    tag: 'Java',
    lines: [
      'public class Main {',
      '    public static void main(String[] args) {',
      '        for (int i = 1; i <= 5; i++) {',
      '            System.out.println("i = " + i);',
      '        }',
      '    }',
      '}',
    ],
  },
  {
    id: 'c-cpp',
    title: 'C++: vector',
    tag: 'C++',
    lines: [
      '#include <vector>',
      '#include <iostream>',
      '',
      'int main() {',
      '    std::vector<int> v = {3, 1, 2};',
      "    for (auto& x : v) std::cout << x << '\\n';",
      '    return 0;',
      '}',
    ],
  },
  {
    id: 'c-go',
    title: 'Go: map',
    tag: 'Go',
    lines: [
      'func main() {',
      '    m := map[string]int{"a": 1, "b": 2}',
      '    for k, v := range m {',
      '        fmt.Printf("%s=%d\\n", k, v)',
      '    }',
      '}',
    ],
  },
  {
    id: 'c-rust',
    title: 'Rust: iterators',
    tag: 'Rust',
    lines: [
      'fn main() {',
      '    let nums: Vec<i32> = (1..=5).collect();',
      '    let sum: i32 = nums.iter().map(|n| n * n).sum();',
      '    println!("sum = {}", sum);',
      '}',
    ],
  },
  {
    id: 'c-sql',
    title: 'SQL: query with JOIN',
    tag: 'SQL',
    lines: [
      'SELECT u.name, COUNT(o.id) AS orders',
      'FROM users u',
      'LEFT JOIN orders o ON o.user_id = u.id',
      'GROUP BY u.name',
      'HAVING COUNT(o.id) > 1',
      'ORDER BY orders DESC;',
    ],
  },
  {
    id: 'c-html',
    title: 'HTML: button and script',
    tag: 'HTML',
    lines: [
      '<button class="btn" onclick="save()">',
      '  Save',
      '</button>',
      '<script src="app.js"></script>',
    ],
  },
];

/* ==========================================================================
   Shortcut drill: Windows follows Visual Studio, Mac follows VS Code.
   ========================================================================== */

const SHORTCUTS = [
  shortcut('Save file', 'Ctrl+S', 'Cmd+S'),
  shortcut('Save all files', 'Ctrl+Shift+S', 'Alt+Cmd+S'),
  shortcut('Undo', 'Ctrl+Z', 'Cmd+Z'),
  shortcut('Redo', 'Ctrl+Y', 'Cmd+Shift+Z'),
  shortcut('Comment selection', 'Ctrl+K Ctrl+C', 'Cmd+/'),
  shortcut('Uncomment selection', 'Ctrl+K Ctrl+U', 'Cmd+/'),
  shortcut('Format document', 'Ctrl+K Ctrl+D', 'Alt+Shift+F'),
  shortcut('Quick actions and refactorings', 'Ctrl+.', 'Cmd+.'),
  shortcut('Complete word (IntelliSense)', 'Ctrl+Space'),
  shortcut('Parameter info', 'Ctrl+Shift+Space', 'Cmd+Shift+Space'),
  shortcut('Start debugging', 'F5'),
  shortcut('Run without debugging', 'Ctrl+F5'),
  shortcut('Stop debugging', 'Shift+F5'),
  shortcut('Toggle breakpoint', 'F9'),
  shortcut('Step over', 'F10'),
  shortcut('Step into', 'F11'),
  shortcut('Build solution', 'Ctrl+Shift+B', 'Cmd+Shift+B'),
  shortcut('Go to definition', 'F12'),
  shortcut('Find all references', 'Shift+F12'),
  shortcut('Navigate back', 'Ctrl+-'),
  shortcut('Navigate forward', 'Ctrl+Shift+-'),
  shortcut('Find in file', 'Ctrl+F', 'Cmd+F'),
  shortcut('Replace in file', 'Ctrl+H', 'Alt+Cmd+F'),
  shortcut('Find in all files', 'Ctrl+Shift+F', 'Cmd+Shift+F'),
  shortcut('Go to line', 'Ctrl+G'),
  shortcut('Go to anything (Go To All)', 'Ctrl+,', 'Cmd+P'),
  shortcut('Delete line', 'Ctrl+Shift+L', 'Cmd+Shift+K'),
  shortcut('Move line up', 'Alt+Up'),
  shortcut('Move line down', 'Alt+Down'),
  shortcut('Insert line above', 'Ctrl+Enter', 'Cmd+Shift+Enter'),
  shortcut('Insert line below', 'Ctrl+Shift+Enter', 'Cmd+Enter'),
  shortcut('Rename symbol', 'Ctrl+R Ctrl+R', 'F2'),
  shortcut('Collapse all', 'Ctrl+M Ctrl+O', 'Cmd+K Cmd+0'),
  shortcut('Expand all', 'Ctrl+M Ctrl+L', 'Cmd+K Cmd+J'),
  shortcut('Solution / file explorer', 'Ctrl+Alt+L', 'Cmd+Shift+E'),
  shortcut('Open terminal', 'Ctrl+`'),
];

/* ==========================================================================
   Editor lessons: type text and press shortcuts, then watch the result.
   ========================================================================== */

/* Indents every line of `body` by `spaces` and wraps it between two lines. */
const indent = (body, spaces) =>
  body
    .split('\n')
    .map((line) => ' '.repeat(spaces) + line)
    .join('\n');

const csharpMain = (body) =>
  `using System;\n\nclass Program\n{\n    static void Main()\n    {\n${indent(body, 8)}\n    }\n}`;

const htmlBoilerplate = (body) =>
  [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '    <meta charset="UTF-8">',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '    <title>Document</title>',
    '</head>',
    '<body>',
    indent(body, 4),
    '</body>',
    '</html>',
  ].join('\n');

const htmlBody = (body) => `<body>\n${indent(body, 4)}\n</body>`;
const htmlHead = (body) => `<head>\n${indent(body, 4)}\n</head>`;
const cssBox = (body) => `.box {\n${indent(body, 4)}\n}`;

/* Source files used by the debugging, navigation and formatting lessons. */
const DEBUG_SOURCE = [
  'using System;',
  '',
  'class Program',
  '{',
  '    static int Twice(int n)',
  '    {',
  '        return n * 2;',
  '    }',
  '',
  '    static void Main()',
  '    {',
  '        int a = 5;',
  '        int b = Twice(a);',
  '        Console.WriteLine(b);',
  '    }',
  '}',
].join('\n');

const NAVIGATION_SOURCE = [
  'using System;',
  '',
  'class Program',
  '{',
  '    static string GetUser(int id)',
  '    {',
  '        return "Ann";',
  '    }',
  '',
  '    static void Main()',
  '    {',
  '        var user = GetUser(1);',
  '        Console.WriteLine(user);',
  '    }',
  '}',
].join('\n');

const MESSY_SOURCE = 'using System;\nclass Program{\nstatic void Main(){Console.WriteLine("Hi");\nint x=1;}\n}';

const FORMATTED_SOURCE = [
  'using System;',
  '',
  'class Program',
  '{',
  '    static void Main()',
  '    {',
  '        Console.WriteLine("Hi");',
  '        int x = 1;',
  '    }',
  '}',
].join('\n');

const COLLAPSED_SOURCE = 'using System;\n\nclass Program\n{\n    static void Main() { ... }\n}';

const SAVE_TOAST = 'File saved';
const saveStep = (file) => key('Ctrl+S', 'Cmd+S', 'Save the file', { toast: `${file} saved` });
const expandStep = (set, extra = {}) => key('Tab', 'Tab', 'Expand the abbreviation', { set, ...extra });

const EDITOR_LESSONS = [
  {
    id: 'v-hello',
    title: 'C#: Hello World and the cw snippet',
    tag: 'C#',
    file: 'Program.cs',
    base: csharpMain('|'),
    items: [
      typeText('cw', 'Type the cw snippet'),
      key('Tab', 'Tab', 'Expand the snippet', { set: csharpMain('Console.WriteLine(|);') }),
      typeText('"Hello, World!"', 'Type the text inside the parentheses'),
      key('Ctrl+K Ctrl+D', 'Alt+Shift+F', 'Format the document', { toast: 'Document formatted' }),
      key('Ctrl+S', 'Cmd+S', 'Save the file', { toast: 'Program.cs saved' }),
      key('Ctrl+F5', 'Ctrl+F5', 'Run without debugging', { out: 'Hello, World!' }),
    ],
  },
  {
    id: 'v-calc',
    title: 'C#: variable, build, debug',
    tag: 'C#',
    file: 'Program.cs',
    base: csharpMain('|'),
    items: [
      typeText('int a = 5;\ncw', 'Type the declaration, Enter and the cw snippet'),
      key('Tab', 'Tab', 'Expand the snippet', { set: csharpMain('int a = 5;\nConsole.WriteLine(|);') }),
      typeText('a * 2', 'Print the doubled value'),
      key('Ctrl+Shift+B', 'Cmd+Shift+B', 'Build the solution', { toast: 'Build succeeded, 0 errors' }),
      key('F5', 'F5', 'Start debugging', { out: '10', toast: 'Debugging started' }),
      key('Shift+F5', 'Shift+F5', 'Stop debugging', { toast: 'Debugging stopped' }),
    ],
  },
  {
    id: 'v-lines',
    title: 'Editing lines without the mouse',
    tag: 'C#',
    file: 'Program.cs',
    base: csharpMain('|'),
    items: [
      typeText('var x = 1;\nvar y = 2;', 'Type two lines'),
      key('Alt+Up', 'Alt+Up', 'Move the current line up', { set: csharpMain('var y = 2;|\nvar x = 1;') }),
      key('Ctrl+K Ctrl+C', 'Cmd+/', 'Comment the line', { set: csharpMain('// var y = 2;|\nvar x = 1;') }),
      key('Ctrl+K Ctrl+U', 'Cmd+/', 'Uncomment the line', { set: csharpMain('var y = 2;|\nvar x = 1;') }),
      key('Ctrl+Shift+L', 'Cmd+Shift+K', 'Delete the line', { set: csharpMain('|var x = 1;') }),
      key('Ctrl+Z', 'Cmd+Z', 'Bring the line back', { set: csharpMain('var y = 2;|\nvar x = 1;') }),
      key('Ctrl+S', 'Cmd+S', 'Save the file', { toast: SAVE_TOAST }),
    ],
  },
  {
    id: 'v-debug',
    title: 'Debugging: breakpoint, step into, locals',
    tag: 'Debug',
    file: 'Program.cs',
    base: DEBUG_SOURCE,
    items: [
      key('F9', 'F9', 'Set a breakpoint on line 13', { breakpoints: [13], toast: 'Breakpoint set on line 13' }),
      key('F5', 'F5', 'Start debugging', {
        currentLine: 13,
        panel: { title: 'Locals', text: 'a = 5\nb = 0' },
        toast: 'Paused at line 13',
      }),
      key('F11', 'F11', 'Step into Twice()', {
        currentLine: 7,
        panel: { title: 'Locals', text: 'n = 5' },
        toast: 'Inside Twice, line 7',
      }),
      key('F10', 'F10', 'Step over the return line', {
        currentLine: 8,
        panel: { title: 'Locals', text: 'n = 5\nreturn value: 10' },
        toast: 'End of Twice, line 8',
      }),
      key('F10', 'F10', 'Step over again to get back to Main', {
        currentLine: 13,
        panel: { title: 'Locals', text: 'a = 5\nb = 10' },
        toast: 'Back in Main, line 13',
      }),
      key('F5', 'F5', 'Continue until the program ends', {
        currentLine: 0,
        panel: { title: 'Locals', text: '(program finished)' },
        out: '10',
        toast: 'Program exited with code 0',
      }),
    ],
  },
  {
    id: 'v-nav',
    title: 'Navigating code, references, rename',
    tag: 'Nav',
    file: 'Program.cs',
    base: NAVIGATION_SOURCE,
    items: [
      key('Ctrl+G', 'Ctrl+G', 'Go to line 12', { currentLine: 12, toast: 'Jumped to line 12' }),
      key('F12', 'F12', 'Go to the definition of GetUser', { currentLine: 5, toast: 'Definition found: line 5' }),
      key('Ctrl+-', 'Ctrl+-', 'Navigate back', { currentLine: 12, toast: 'Back at line 12' }),
      key('Shift+F12', 'Shift+F12', 'Find all references of GetUser', {
        currentLine: 12,
        panel: {
          title: 'References (2)',
          text: 'Program.cs (5)   static string GetUser(int id)\nProgram.cs (12)  var user = GetUser(1);',
        },
      }),
      key('Ctrl+R Ctrl+R', 'F2', 'Rename the variable user to name', {
        set: NAVIGATION_SOURCE.replace(/user/g, 'name'),
        currentLine: 12,
        panel: { title: 'Rename', text: 'user -> name\n2 places updated' },
      }),
      key('Ctrl+Shift+F', 'Cmd+Shift+F', 'Find "GetUser" in all files', {
        currentLine: 12,
        panel: {
          title: 'Find in Files',
          text: 'Program.cs (5)   static string GetUser(int id)\nProgram.cs (12)  var name = GetUser(1);\n2 matches in 1 file',
        },
      }),
    ],
  },
  {
    id: 'v-format',
    title: 'Format, collapse and expand',
    tag: 'Format',
    file: 'Program.cs',
    base: MESSY_SOURCE,
    items: [
      key('Ctrl+K Ctrl+D', 'Alt+Shift+F', 'Format the messy document', { set: FORMATTED_SOURCE, toast: 'Document formatted' }),
      key('Ctrl+M Ctrl+O', 'Cmd+K Cmd+0', 'Collapse everything to definitions', { set: COLLAPSED_SOURCE, toast: 'Collapsed' }),
      key('Ctrl+M Ctrl+L', 'Cmd+K Cmd+J', 'Expand everything back', { set: FORMATTED_SOURCE, toast: 'Expanded' }),
      key('Ctrl+S', 'Cmd+S', 'Save the file', { toast: SAVE_TOAST }),
    ],
  },

  /* ---- Emmet: type a short abbreviation, press Tab, see the page. ---- */
  {
    id: 'e-html',
    title: 'Emmet: full HTML boilerplate from !',
    tag: 'HTML',
    file: 'index.html',
    noOutput: true,
    view: 'html',
    base: '|',
    items: [
      typeText('!', 'Type ! (exclamation mark)'),
      key('Tab', 'Tab', 'Press Tab: the whole boilerplate appears', {
        set: htmlBoilerplate('|'),
        toast: 'Emmet: HTML5 boilerplate',
      }),
      typeText('h1', 'Inside body type h1'),
      expandStep(htmlBoilerplate('<h1>|</h1>')),
      typeText('Hello', 'Type the heading text'),
      saveStep('index.html'),
    ],
  },
  {
    id: 'e-list',
    title: 'Emmet: a list in one go',
    tag: 'HTML',
    file: 'index.html',
    noOutput: true,
    view: 'html',
    base: htmlBody('|'),
    items: [
      typeText('ul>li*3', 'Type ul>li*3 (a list with three items)'),
      expandStep(htmlBody('<ul>\n    <li>|</li>\n    <li></li>\n    <li></li>\n</ul>')),
      typeText('Home', 'Type the text of the first item'),
      saveStep('index.html'),
    ],
  },
  {
    id: 'e-nav',
    title: 'Emmet: a nav menu with links',
    tag: 'HTML',
    file: 'index.html',
    noOutput: true,
    view: 'html',
    base: htmlBody('|'),
    items: [
      typeText('nav>ul>li*3>a', 'Type nav>ul>li*3>a'),
      expandStep(
        htmlBody(
          '<nav>\n    <ul>\n        <li><a href="">|</a></li>\n        <li><a href=""></a></li>\n        <li><a href=""></a></li>\n    </ul>\n</nav>',
        ),
      ),
      typeText('Home', 'Type the text of the first link'),
      saveStep('index.html'),
    ],
  },
  {
    id: 'e-card',
    title: 'Emmet: a card with classes',
    tag: 'HTML',
    file: 'index.html',
    noOutput: true,
    view: 'html',
    base: htmlBody('|'),
    items: [
      typeText('div.card>h2.title+p', 'Type div.card>h2.title+p'),
      expandStep(htmlBody('<div class="card">\n    <h2 class="title">|</h2>\n    <p></p>\n</div>')),
      typeText('Pricing', 'Type the card title'),
      saveStep('index.html'),
    ],
  },
  {
    id: 'e-head',
    title: 'Emmet: styles and script in head',
    tag: 'HTML',
    file: 'index.html',
    noOutput: true,
    view: 'head',
    base: htmlHead('|'),
    items: [
      typeText('link:css', 'Type link:css'),
      expandStep(htmlHead('<link rel="stylesheet" href="style.css">|')),
      typeText('\nscript:src', 'Enter, then script:src'),
      expandStep(htmlHead('<link rel="stylesheet" href="style.css">\n<script src="|"></script>')),
      typeText('app.js', 'Type the script file name'),
      saveStep('index.html'),
    ],
  },
  {
    id: 'e-css',
    title: 'Emmet in CSS: df, jcc, p20',
    tag: 'CSS',
    file: 'style.css',
    noOutput: true,
    view: 'css',
    base: cssBox('|'),
    items: [
      typeText('df', 'Type df'),
      expandStep(cssBox('display: flex;|')),
      typeText('\njcc', 'Enter, then jcc'),
      expandStep(cssBox('display: flex;\njustify-content: center;|')),
      typeText('\naic', 'Enter, then aic'),
      expandStep(cssBox('display: flex;\njustify-content: center;\nalign-items: center;|')),
      typeText('\np20', 'Enter, then p20'),
      expandStep(cssBox('display: flex;\njustify-content: center;\nalign-items: center;\npadding: 20px;|')),
      typeText('\nm0-auto', 'Enter, then m0-auto'),
      expandStep(
        cssBox('display: flex;\njustify-content: center;\nalign-items: center;\npadding: 20px;\nmargin: 0 auto;|'),
      ),
      saveStep('style.css'),
    ],
  },
];
