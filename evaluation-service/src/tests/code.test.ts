import { runCode } from "../utils/containers/codeRunner.util";
import { CPP_IMAGE, PYTHON_IMAGE } from "../utils/contants";


export async function testPyThonCode() {
    const pythonCode = `
import time
i = 0
while True:
    i += 1
    print(i)
    time.sleep(1)

print("Bye")
    `;
    // 1. Take the python code and dump in a file and run the python file in the container
    
    await runCode({
        code: pythonCode,
        language: "python",
        timeout: 3000,
        imageName: PYTHON_IMAGE,
        input: ""
    });
}

export async function testCppCode() {
    const cppCode = `
#include<iostream>

int main() {
    // std::cout<<"Hello world"<<std::endl;
    int n;
    std::cin>>n;

    for(int i = 0; i < n; i++) {
        std::cout<<i<<std::endl;
    }

    return 0;
}
    
`
    await runCode({
        code: cppCode,
        language: "cpp",
        timeout: 1000,
        imageName: CPP_IMAGE,
        input: "6"
    })
}