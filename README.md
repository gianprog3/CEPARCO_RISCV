## To run:

Open command prompt on the folder with app.js

Type the following:

npm i express express-handlebars

node app.js

Open link in browser:

localhost:3000

## Integrating Project Milestone #1
https://youtu.be/CYMEFEEJT-E

In video: Test working opcodes, test errors

Project update: 
- Error handling and opcodes implemented
- Registers implemented but not displayed yet

## Integrating Project Milestone #2

https://youtu.be/6LRcJbgBTPQ

Project update:
- GUI for Registers/Memory
- Set Registers/Memory
- Initial Pipeline drafting:
  - Run Step / Run All
  - Pipeline Map
  - Initial Pipeline Registers (IR and NPC)

## Integrating Project Milestone #3


Project update:
- Fully functional program

### Screenshots:

- OpCode generation:
  - <img width="1449" height="248" alt="image" src="https://github.com/user-attachments/assets/68a83429-6d49-49cc-8553-4c8dac8a73f3" />

- Branch Taken:
  - <img width="1282" height="162" alt="image" src="https://github.com/user-attachments/assets/ddc1d5fd-7f69-4cc7-8882-231ed49419f5" />
  - <img width="1446" height="488" alt="image" src="https://github.com/user-attachments/assets/9ddc5ad8-c6e0-4827-a52e-8968d51aa031" />

- Branch Not Taken:
  - <img width="1443" height="144" alt="image" src="https://github.com/user-attachments/assets/1e2c3494-b281-4a6f-9418-2e553ed1b0ce" />
  - <img width="1447" height="493" alt="image" src="https://github.com/user-attachments/assets/d0d69946-9946-44f2-b639-3ec1327363a8" />

- No Forwarding with Branch Taken:
  - <img width="1452" height="250" alt="image" src="https://github.com/user-attachments/assets/0ebb4a27-d2ef-4a6d-b07b-0e880d53eee5" />
  - <img width="1450" height="501" alt="image" src="https://github.com/user-attachments/assets/a1e0c563-6221-4f3c-ba3e-b694aaa95189" />

- No Forwarding with Branch Not Taken:
  - <img width="1450" height="250" alt="image" src="https://github.com/user-attachments/assets/b349ddf8-632e-40f6-8a3b-09879fa27f55" />
  - <img width="1443" height="495" alt="image" src="https://github.com/user-attachments/assets/4fd732ce-ff0f-4fa6-b8a7-caa72e677102" />


### Design Methodology: 

We implemented the project using javascript and handlebars as the file management and code readability was easy to understand. It can be thought of as an easier HTML + java approach as there is less need for encapsulation and formatting templates are available in handlebars (i.e. create a row of tables using an iterative #each function). This environment was also familiar to most of the group as most of us took CCAPDEV and were thought how to use the programming languages.

The design of the interface itself is loosely inspired by the RARS program, with the main editor window taking a majority of the screen, and the register values displayed on the right side of the screen. We decided to omit the use of the error/compile screen and instead make it take the same space as the editor screen to make way for the pipeline map, and to have a uniformed approach in displaying each tab (editor, errors, pipeline map, risc-v registers). The same goes with the memory display.

### Testing Methodology:

The program's instructions were verified by doing the opcode instructions manually, especially with the branching conditions, and it helped fix any unwanted behavior, especially with arithmetic on hexadecimal/binary values.

### AHA Moments:










