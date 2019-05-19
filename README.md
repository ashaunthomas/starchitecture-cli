# starchitecture-cli
A front-end architecture tool based on the Stable Abstractions Principle expressed in "Clean Architecture" by Robert C. Martin

![Abstract/Stability Graph](https://adriancitu.files.wordpress.com/2017/12/sapprinciple1.png)

Fan-In: Number of classes *outside* the component that depend on classes *within* the component

Fan-Out: Number of classes *inside* the component that depend on classes *outside* the component

Instability =  Fan-out / (Fan-In + Fan-Out)

(Instability is in range 0-1 inclusive with a value of 1 meaning a maximally unstable component)

Na = Number of abstract classes and interfaces in the component

Nc = total classes and interfaces

Abstractiveness = Na / Nc

(Abstractiveness is in range 0-1 inclusive with a value of 1 meaning a component contains all abstract classes and interfaces)

## Legend

🧠 = No work started yet

👨🏾‍💻 = In Progress 

✔️ = Done Done

🚢 = Shipped and available

## Status

### Version 0.2 🧠
- Add flags to denote project type
- Add flags for output format (log | json)
- Output single object with file name as key, attributes as value object

### Version 0.1 ✔️ 
- Angular project coverage
- Prints component abstract analysis to console
- Prints component stability analysis to console
