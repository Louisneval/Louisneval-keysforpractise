```
#   # ##### #   #  ####                ####  ###  ####  #####
#  #  #      # #  #           #       #     #   # #   # #
###   ####    #    ###       ###      #     #   # #   # ####
#  #  #       #       #       #       #     #   # #   # #
#   # #####   #   ####                 ####  ###  ####  #####
```

**A typing trainer for programmers.** Not a quiz about code. A gym for your fingers:
terminal commands, SQL, editor shortcuts, and the weird symbols that live in real code.

```
        .---------------------------------------------------------.
        |  [Terminal] [SQL] [Visual Studio] [Code]    Win | Mac   |
        |---------------------------------------------------------|
        |  Lessons        |  Step 3 of 6  Write the code to a file|
        |  > Python       |  .--------------------------------.   |
        |    JavaScript   |  | C:\dev\hello> nano hello.py    |   |
        |    C            |  |                                |   |
        |    Rust         |  '--------------------------------'   |
        |    Git          |  TIME 0:12  WPM 41  ACC 97%  ERR 1    |
        '---------------------------------------------------------'
```

---

## What is inside

```
 +-----------+     +-----------+     +----------------+     +-----------+
 | TERMINAL  | --> |    SQL    | --> | VISUAL STUDIO  | --> |   CODE    |
 | 11 lessons|     | 4 lessons |     |  13 lessons    |     | 9 snippets|
 +-----------+     +-----------+     +----------------+     +-----------+
  type commands     type queries      press shortcuts        type real code
  see the output    see the table     see the result         with brackets
```

37 lessons in total, 36 editor shortcuts in the drill.

### 1. Terminal

You type the commands that really make "Hello, World" happen:

```
C:\dev> mkdir hello
C:\dev> cd hello
C:\dev\hello> nano hello.py
```

Then a nano screen opens right inside the page: type the code and save it.
Both common ways work, no setting needed. The page follows whichever you start with:

- `Ctrl+O`, `Enter`, `Ctrl+X` (write out, confirm the name, exit)
- `Ctrl+X`, `Y`, `Enter` (exit, answer yes, confirm the name)

```
C:\dev\hello> cat hello.py
print("Hello, World!")
C:\dev\hello> python hello.py
Hello, World!
```

Python, JavaScript, C, C++, Java, Go, Rust, C#, plus Git, venv + pip and npm.
On Mac the prompt becomes `~/dev %` and the commands switch to zsh style
(`python3`, `cat`, `./hello`). nano is built into macOS; on Windows it comes
with Git Bash and WSL.

### 2. SQL

```
sql> SELECT name FROM users WHERE age > 30;
name
----
Oleg
```

Create a table, insert rows, update, delete, JOIN, GROUP BY, indexes, transactions.
Keywords are uppercase, so your Shift finger gets a workout.

### 3. Visual Studio (and VS Code)

Two kinds of practice.

**Shortcut drill.** 12 random shortcuts out of 36. Hide the keycaps and they
appear after 4 seconds if you are stuck.

```
   Comment selection

   +------+  +---+      then      +------+  +---+
   | Ctrl |  | K |               | Ctrl |  | C |
   +------+  +---+               +------+  +---+
```

**Editor lessons.** Type code and press shortcuts like in a real editor, and
watch what happens.

```
   F9    ->  (o) red dot on line 13            [breakpoint]
   F5    ->  >   yellow line + Locals panel    [a = 5, b = 0]
   F11   ->  jump inside Twice()               [n = 5]
   F10   ->  step over, Locals update
   F5    ->  program ends, Output: 10
```

**Emmet.** Type a tiny word, press Tab, get a lot of markup, and see the page.

```
   you type          you get
   ------------      ----------------------------------------
   !          Tab -> <!DOCTYPE html> ... the whole skeleton
   ul>li*3    Tab -> <ul> with three <li>
   nav>ul>li*3>a  -> a menu with three links
   div.card>h2.title+p -> a card with classes
   link:css   Tab -> <link rel="stylesheet" href="style.css">
   df         Tab -> display: flex;
   jcc        Tab -> justify-content: center;
```

The result panel renders it like a browser, so you see the boxes move.

### 4. Code

Nine real snippets (Python, JS, C#, Java, C++, Go, Rust, SQL, HTML).
Indentation fills itself in after Enter, so you only practice the hard stuff:

```
   { }  [ ]  ( )  =>  ::  <>  ->  !=  ;  `  $ {  |  &  \n
```

---

## Windows or Mac

Flip the switch in the top right corner.

```
   Windows (Visual Studio)        Mac (VS Code keymap)
   -----------------------        --------------------
   Ctrl+S                         Cmd+S
   Ctrl+K Ctrl+C                  Cmd+/
   Ctrl+Shift+L                   Cmd+Shift+K
   Ctrl+R Ctrl+R                  F2
   Alt+Up                         Option+Up
```

Visual Studio for Mac was retired, so the Mac mode follows VS Code.
On a MacBook hold `fn` together with F1 to F12.

## How the typing works

```
   typed key is right  ->  green letter
   typed key is wrong  ->  red block, Backspace fixes it
   Enter (terminal)    ->  sends the line only if it is exactly right
   Esc (shortcuts)     ->  skip this one
```

Stats on top: **time**, **WPM**, **accuracy**, **errors**. Your best result per
lesson is remembered in your browser.

## Good to know

```
   [!]  Click inside the page first, or the keys go nowhere.
   [!]  Wrong keyboard layout?  A banner will ask you to switch to English.
   [!]  The browser may steal some shortcuts.  Press Esc and move on.
   [!]  Needs a physical keyboard.  Phones and tablets need not apply.
   [!]  Terminal and SQL are simulated.  Nothing is really executed.
```

## A tiny training plan

```
   Day 1-2   Terminal: Python + Git            (10 min)
   Day 3-4   Shortcut drill, 3 rounds          (10 min)
   Day 5     Emmet: list, nav, card            (10 min)
   Day 6     Code snippets with brackets       (10 min)
   Day 7     Beat your own best time           (for glory)
```

```
        ( o_o)  <- you, after one week
       /|    |\
        |_||_|        "I did not even look at the keyboard."
```

Happy typing.
