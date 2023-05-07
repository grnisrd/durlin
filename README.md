<p align="center">
    <img src="https://i.imgur.com/Y3o7kJR.png">
</p>

***

**durlin** is a statically-typed, domain-specific, procedural and predictable programming language that defines finite-state machines (FSMs). These FSMs can be efficiently embed in programs without much overhead and can be easily interacted with.

## Overview

- ⚙️ **Create more efficient software.**
  - Durlin's FSMs have predictable behavior that is easily understood by compilers. They can be aggressively optimized for maximum performance and minimal code size.
- 🧮 **Organize your code and improve your productivity.**
  - Durlin's FSMs can serve as organizers for your logic. Their ordered nature, constrained variable placement and reduced control flow options makes it simple to write, modify and interpret the behavior of a machine.
- 🎯 **Prevent logical errors at the source.**
  - Durlin's FSMs have constraints which reduces human error and creates tidier logic. _Uninitialized_ data is impossible by design. _Dangling references_ cannot be created. _Null_ values do not exist.
- 💱 **Integrate finite-state machines into your language.**
  - Durlin's FSMs are embeddable. They can be transcompiled to raw source code for quick integration into codebases, or to durlin bytecode so they can be used across different programs as libraries.

## What is a finite-state machine?
A _finite-state machine_ (FSM) is a way to control the behavior of a system that can only be in a finite number of states. Think of it like a vending machine - it has different states (e.g. waiting for money, dispensing snacks, etc.), and the buttons you press are the inputs that cause it to transition to a new state.

In programming, you can use finite-state machines to control the behavior of a program that has discrete states, like the needs-based artificial intelligence of the individual characters found in the video game _The Sims_, which makes each agent transition to another state (i.e., cooking food) based on the current state (i.e., is hungry). You define the different states the program can be in, and the rules for how it transitions from one state to another based on the inputs it receives. This can help you write cleaner, more organized code that's easier to understand and maintain.

## When to use a finite-state machine?
FSMs aren't appropriate for every purpose in programming. They are useful for certain things requiring predictable regularity, such as:
- Artificial intelligence tasked with doing specific jobs.
  - **Work AI:** FSMs can be the logical foundation of robots at the workplace, such as at an Amazon warehouse. An FSM could be used to control the behavior of the robot, such as navigating through the warehouse, picking up and delivering packages, and interacting with other robots and workers. The different states of the robot (e.g. idle, moving, picking, delivering) can be modeled as states in the FSM, with transitions triggered by different inputs such as sensor readings, barcode scans, or human commands.
    - In practice, the FSM used in a warehouse robot would likely be part of a larger control system that includes additional layers of logic and decision-making. For example, the FSM might be combined with path-planning algorithms, machine learning models, or other forms of AI to optimize the robot's behavior based on factors like traffic, package volume, or worker safety.
  - **Game AI:** FSMs can be used to model the behavior of non-player characters (NPCs) in a game. The different states of the NPC (e.g. idle, attacking, retreating) can be modeled as states in the FSM, with transitions triggered by different game events (e.g. player proximity, damage received).
- Generative algorithms, such as procedural world generation.
  - FSMs can be used to generate procedural content in video games or simulations. For example, an FSM could be used to model the different biomes or regions in a procedurally generated world, with transitions between states triggered by factors such as altitude, temperature, or precipitation. The different states in the FSM correspond to the different biomes, while the transitions between states correspond to the environmental conditions that lead to the formation of different biomes. Other examples of procedural content that could be generated using FSMs include terrain generation, weather patterns, or resource distribution.
- Text processing.
  - FSMs can be used to implement search algorithms, such as the [Aho-Corasick algorithm](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm) for string matching or the [Knuth-Morris-Pratt algorithm](https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm) for pattern matching. FSMs can also be used for spell checking and correction.
- Circuit design.
  - FSMs can be used to model the behavior of digital circuits, such as counters, timers, or controllers. The different states in the FSM correspond to the different outputs of the circuit, while the transitions between states correspond to the different inputs to the circuit.
- Network security.
  - FSMs can be used to model the behavior of network traffic, such as intrusion detection or malware analysis. The different states in the FSM correspond to the different patterns of network traffic, while the transitions between states correspond to the different network protocols and data payloads.
- Parsing of regular grammars.
  - Lexical analysis: FSMs can be used to quickly write lexers which identifies tokens in an input stream. 
  - Regular expressions: FSMs can be built to create performant regular expression libraries.
  - Arithmetic expressions: FSMs can be written to parse arithmetic expressions.
  - Any other grammar with a finite set of rules and terminals/non-terminals.

Otherwise, finite-state machines **aren't** good for:
- Natural language processing.
  - FSMs are not well-suited for natural language processing tasks, such as text generation or machine translation. Instead, machine learning techniques such as neural networks or statistical models are more effective for these tasks.
- Complex decision-making.
  - FSMs are not good at modeling complex decision-making processes that involve uncertainty or multiple objectives. Instead, decision trees, expert systems, or reinforcement learning algorithms are more suitable for these tasks.
- Continuous systems.
  - FSMs are not appropriate for modeling continuous systems that involve analog signals or continuous variables, such as control systems or physical simulations. Instead, differential equations or numerical methods such as finite element analysis or finite difference methods are more appropriate for these tasks.
- Automatically learning AI agents.
  - FSMs are not suitable for creating intelligent agents that can learn to adapt to changing environments. They _are_ appropriate for creating AI that works well within static and/or predictable environments (such as a video game world), but not for environments with novel unpredictable changes. Instead, reinforcement learning, deep learning, or evolutionary algorithms are better suited for creating adaptive AI agents.

## Why use Durlin's FSMs over designing in-house state machines?
1. Durlin machines are **portable.** You can design machines in the Durlin language and embed them across multiple applications, libraries, and/or codebases with ease, whereas in-house state machines are often written specifically for a program and cannot be ported to other codebases easily.
2. 

# Examples
`machine.dr`
```
# Creates a range of numbers.
machine Range (start: int32, end: int32) (
    data: (
        range: array(int32)
    )

    state initial (
        when equals(length($range), end - start) (
            go final
        )
        insert($range, length($range) + 1)
    )

    state final (
        complete($range)
    )
)
```

## Interacting with source code

### Running a machine from source with Deno
```js
import durlin from "https://deno.land/x/durlin/mod.ts"

// Read the source code to the machine.
const src = await Deno.readTextFile("./machine.dr")

// Load the durlin program, retrieve a machine template and create it.
const machine = durlin(src).machine("Range").create()

// Run the machine. runAsync can also be used to retrieve a promise.
const result = machine.run({ start: 1, end: 10 }).array()
/* [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] */
```

### Compiling a machine to bytecode with Deno
```js
import durlin from "https://deno.land/x/durlin/mod.ts"

// Read the source code to the machine.
const src = await Deno.readTextFile("./machine.dr")

// Compile the durlin program to bytecode.
const byc = durlin(src).compile()

// Write the bytecode to a .drc file.
await Deno.writeFile("./machine_bytecode.drc", byc)

// ...or load the bytecode as a durlin program.
const result = durlin(byc).machine("Range").create().run({ start: 1, end: 10 }).array()
/* [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] */
```

### Compiling a machine to bytecode with `durlin-cli`
```sh
durlin --compile --outfile="machine_bytecode.drc" ./machine.dr
```

## Loading machines into a native program (C)

### Creating a pregenerated machine with `durlin-cli`
```sh
durlin --generate="C" --outfile="generated_machine.h" ./machine.dr
```

### Using a pregenerated machine in C
#### Imperative execution
```c
#include "generated_machine.h"

int main() {
    dmach_range mach;
    dmach_result result;

    dmach_range_init(&mach, 1, 10);
    dmach_range_run(&mach, &result);

    // Get pointer to result. This will be deallocated
    // after dmach_free is called on result, so make sure
    // to copy the value elsewhere.
    int array[10] = ((int*)dmach_get_result(&result));

    // Free the machine. This will also free the args.
    dmach_free(&mach);
}
```
#### Callback (async) execution 
```c
#include "generated_machine.h"

static void on_result_obtain(dmach_range* mach, dmach_result* result) {
    // Do something with the result.
    int array[10] = ((int*)dmach_get_result(result));

    // THE RESULT WILL BE DEALLOCATED AUTOMATICALLY AFTER THIS FUNC EXECUTES.
    // COPY THE DATA ELSEWHERE IF NEEDED.
}

int main() {
    dmach_range mach;
    dmach_mutex mtx;

    dmach_range_init(&mach, 1, 10);
    dmach_range_run_async(&mach, &mtx, on_result_obtain);

    // Execution will continue as the machine is ran in a separate thread.
    // Wait for the machine to complete by waiting for mutex unlock.
    dmach_mutex_await(&mtx);

    // Free the machine.
    dmach_free(&mach);
}
```
### Using durlin bytecode in C
**Notes:**
- This is _much_ slower than using a pregenerated machine. Use only if necessary.
- This requires you to include the `durlinc` interpreter in your program.

```c
#include "durlinc.h"

const char* bytecode = {/*...*/0};

int main() {
    dmach_result result;
    dmach_tstate state;
    
    dmach_tstate_create(&state);
    if ( !dmach_tstate_load(&state, bytecode) ) {
        return 1;
    }

    dmach_tmach* range = dmach_tstate_machine(&state, "Range");
    if ( range == NULL ) {
        return 1;
    }

    // Allocate two int32 arguments for start and end.
    dmach_targs* args = dmach_targs_alloc(sizeof(long) * 2);
    dmach_targs_write_int32(args, 0, 0);
    dmach_targs_write_int32(args, sizeof(long), 10);

    // Run the machine. Result behavior works the same as pregenerated machines.
    // dmach_tmach_run_async also exists for callback-based result retrieval.
    dmach_tmach_run(range, args, &result);

    // Get pointer to result. This will be deallocated
    // after dmach_free is called on result, so make sure
    // to copy the value elsewhere.
    int array[10] = ((int*)dmach_get_result(&result));

    // Free the state. This frees everything else, including args.
    dmach_free(&state);
}
```